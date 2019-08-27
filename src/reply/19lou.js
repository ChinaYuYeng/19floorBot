const superagent = require('superagent');
const cheerio = require('cheerio');
const {getCookies} = require('./cookies')
const charset = require('superagent-charset')(superagent) //注册插件
const path = require('path')
const async = require("async");
const nodejieba = require("nodejieba");
const _request  = require("request")
const {getSignParams,delay} = require('./util')
const {startBot} = require('../wechat/index')
const schedule = require('node-schedule')
const { URL } = require('url')


//19楼请求头
async function headers_19lou(){
  let cookie = await getCookies('.19lou.com,jiaxing.19lou.com,.jiaxing.19lou.com,ssdata.19lou.com,.dm.19lou.com')
  return {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    'Upgrade-Insecure-Requests':1,
    'Referer':'https://jiaxing.19lou.com',
    'Origin':'https://jiaxing.19lou.com',
    'Host':'jiaxing.19lou.com',
    'cookie':cookie,
    'Accept':'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding':'gzip, deflate, br',
    'Connection':'keep-alive',
    'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With':'XMLHttpRequest'
  }
}

//19楼请求基础
async function request(method,url,data){
  let headers = await headers_19lou();
  console.log('url跟踪:',url)
  return new Promise((resolve,reject)=>{
    superagent(method,url)
      .retry(1)
      .set(headers)
      .send(data||{})
      .charset('gb2312')
      .end((err, res) => {
        if(err){
          reject(err)
        }else{
          //请求之间带随机间隔
          setTimeout(_=>{
            resolve(res.text)
          },(1*5+(Math.random()*15)>>0)*1000)
        }
      });
  })
}

//回复私信(机器人)
async function replay_letter({from='未知',url,nums=1},content){
  let map = {}
  let res = await request('get',url)
  const $ = cheerio.load(res, { decodeEntities: false });
  $('#msgForm [type=hidden]').each(function(i,e){
    let elm = $(this);
    map[elm.attr('name')] = elm.attr('value')
  })
  let ques = []
  $('#session-dl dl:not(.s-lz)').slice(-nums).each((i,e)=>{
    let que = $('dd p',e).text().trim();
    ques.push({
      from,
      que,
      url
    })
  })
  //私信机器人自动回复，依次回复
  for(let q of ques){
    let reply = await chooseReply(q)
    //等待3秒回复
    await delay(3000)
    let resp = await request('post','https://jiaxing.19lou.com/u/msg/send',{
      ...map,
      content: content || reply
    })
    resp = JSON.parse(resp)
    if(resp.success){
      console.log(`${q.from} 说 : ${q.que}`,`回复 ${content || reply}`)
    }else{
      console.log(resp)
    }
  }
}

//回复帖子,提供一下数据
//     fid: '778',
//     tid: '177611560320958349',
//     content: '大家好。。。',
function replay_post(data){
  return request('post','https://jiaxing.19lou.com/post/reply',{
    subject: '',
    useSign: true,
    attachments: [{"origName":"","name":"","path":"","desc":"","displayOrder":1,"source":null,"aid":"","isImage":""}],
    attentionUids: '',
    sendQQ: 0,
    sendSina: 0,
    pid: 0,
    ...data,
  })
}

//持续保持回帖对话
async function keep_reply_post({url = 'https://jiaxing.19lou.com/u/msg/reply',nums=1}){
  let res = await request('get',url)
  let $ = cheerio.load(res,{decodeEntities:false});

  const newPosts = [];
  //获得最新帖子回复
  // $('.remind-con li').eq(0).find('dd').each( (i,e) => {
  $('.remind-con .w_d dd').each( (i,e) => {
    const que = $('p',e).eq(1).text();
    const url = $('p.tz a',e).attr('href');
    const from = $('p',e).eq(0).find('a').text();
    newPosts.push({url,que,from})
  })

  //依次回复帖子的回复
  for(const p of newPosts){
    res = await request('get',p.url);
    $ = cheerio.load(res,{decodeEntities:false});
    const urlObj = new URL(p.url);
    p.url_url = 'https:'+$(`#pid${urlObj.searchParams.get('pid')} .view-ft a[ttname=bbs_detail_quote]`).attr('href');
    res = await request('get',p.url_url);
    $ = cheerio.load(res,{decodeEntities:false});
    let content = ''
    $('script').each((i,e)=>{
      let match = $(e).html().match(/quoteVal:"(\[quote=[^\[\]]*\][\s\S]*\[\/quote\])",/mi)
      if(match){
        //文本带有转义符，去掉
        content = match[1].replace(/\\/g,'')
      }
    })
    let reply = await chooseReply(p)
    content += reply //拼装整个回复结构
    let attentionUids = content.match(/\[AT=(\d+)]/mi)
    if(!content) {
      console.error('回帖内容无法获取')
      return;
    }else if(!attentionUids){
      console.error('AT匹配失败：',content)
      return;
    }

    let search = new URL(p.url_url).searchParams;
    await request('post','https://jiaxing.19lou.com/util/keyword',{
      content,
      fid:search.get('fid'),
      tid:search.get('tid')
    })

    await replay_post({
      fid:search.get('fid'),
      tid:search.get('tid'),
      repquote:search.get('repquote'),
      content,
      anonymous:false,
      attachments:[],
      attentionUids:attentionUids[1],
      htmlon:0,
      goodReply:0
    })
  }
}

//获得帖子
async function get_posts(url){
  function parseUrl(url){
    let _pathName = path.basename(url,'.html');
    const forum_reg = /forum-(\d+)/
    const thread_reg = /thread-(\d+)/
    return {
      fid : _pathName.match(forum_reg)[1],
      tid : _pathName.match(thread_reg)[1]
    }
  }
  let posts = []
  let res = await request('get',url);
  const $ = cheerio.load(res, { decodeEntities: false });
  $('.new-data-item .subject a').each(function(i,e){
    let elm = $(this);
    let url = 'https:'+elm.attr('href');
    posts.push({
      title:elm.attr('title'),
      url:url,
      ...parseUrl(url)
    })
  })
  return posts
}

//批量回复帖子(随机帖子，随机回复时间)
async function bath_replay_posts(url,content){
  let res = await get_posts(url);
  //打乱，截取，实现随机回复其中的帖子
  let len = Math.floor(Math.random()*(res.length-1))+1
  res = res.sort((a,b)=>(0.5-Math.random())).slice(0,len)
  async.eachOfSeries(res,async function(v,k){
      //没有指定内容就机器回帖
      if(!content){
        const keyword = await analyzeText(v.url)
        const robotReply = await robotChat(keyword && keyword.word)
        v.keyword = keyword;
        v.content = robotReply;
      }else{
        v.content = content;
      }
      //回帖前等待最多1分钟
      await delay((30+(Math.random()*60)>>0)*1000)
      const _ = await replay_post({fid:v.fid,tid:v.tid,content:v.content})
      const respones = JSON.parse(_);
      if(!respones.success){
        console.log(_)
      }else{
        console.log(v)
      }
  },err => {
      if(err) console.log(err)
  })
}

async function analyzeText(url){
  let res = await request('get',url);
  const $ = cheerio.load(res, { decodeEntities: false });
  let content = '';
  $('[data-floor=f-3] .view-data .thread-cont div[align=left]').each(function(i,e){
    let elm = $(this);
    content += elm.text()
  })
  nodejieba.load({
    userDict: './userDict.utf8',
  });
  return nodejieba.extract(nodejieba.tag(content).reduce((sum,v,i)=>{
    if(v.tag === 'n'){
      return sum += v.word
    }
    return sum;
  },''),1)[0];
}

//机器人聊天
function robotChat(question,defaultMsg){
  return new Promise((res,rej) => {
    _request({
      method:'post',
      url:'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat',
      form:getSignParams({
          app_id:'2117528645',
          question:question,
          session:'10002'
      },'nTtEpKv7jWSJeaND')
    },
    function(err,resp,body){
      if(err){
        rej(err)
      }else{
        body = JSON.parse(body)
        if(body.ret === 0){
          res(body.data.answer)
        }else{
          rej(body)
        }
      }
    })
  }).catch(err => {
    console.log('机器人回复出错:'+err.msg)
    //出错后默认回复，避免程序崩溃
    return defaultMsg || '没看懂什么意思，不过帮顶~' 
  })
}

//监听私信
async function listenLetter(){
  let res = await request('get','https://jiaxing.19lou.com/u/msg/index')
  let $ = cheerio.load(res,{ decodeEntities: false });
  let newMsgs = []
  if($('title').text().trim() != '我的消息_我家'){
    console.warn('无法访问消息页面！')
    return;
  }
  $('.message-list .msg-user span').each((i,e)=>{
    const msg = $(e).parent().siblings()
    const url = 'https://jiaxing.19lou.com' + $(e).parent().parent().parent().attr('href')
    const nums = $(e).text().trim();
    const from  = $(msg).find('strong').text().trim();
    newMsgs.push({
      from ,
      nums ,
      url,
      content:''
    })
  })

  //没有新消息返回
  if(!newMsgs.length) {
    console.log('没有新消息');
    return;
  }
  //test
  // newMsgs.push({
  //   from :'dfd',
  //   nums:'2',
  //   url:'https://jiaxing.19lou.com/u/msg/dialog/single?dialogId=48311561607764529',
  //   content:''
  // })

  for(let v of newMsgs){
    if(v.from == '系统提醒'){

    }else if(v.from == '回帖'){
      await keep_reply_post(v)
    }else{
      await replay_letter(v)
    }
  }

  console.log(newMsgs);
  
  // let fromatMsg = newMsgs.reduce((sum,v,i)=>{
  //   if(v.from == '系统提醒'){
  //     sum += ` 你有${v.nums}条 系统提醒 未读<br>`
  //   }else if(v.from == '回帖'){
  //     sum += ` 你有${v.nums}条 回帖 未读<br>`
  //   }else{
  //     sum += ` 你有来自${v.from}的新消息：<br>${v.content}` 
  //   }
  //   return sum;
  // },`<strong>来自19楼的消息<strong>：<br>`)

  // let contact = await bot.Contact.find({ name: '亲亲宝贝' }) || await bot.Contact.find({ alias: '亲亲宝贝' })
  // try {
  //   await delay(5000)
  //   await contact.say(fromatMsg)
  //   console.log('消息发送成功..')
  // } catch (error) {
  //   console.log(error)
  // }
}

async function chooseReply({que:question,from,url}){
  const apology = ['微信','神经','神经病','不懂你说什么','你是谁','手机','联系方式','有病'].some(key => question.includes(key));
  const showAbility = ['你好','hi','hello'].some(key => question.includes(key));
  const callMe = ['召唤大龙神'].some(key => question.includes(key));
  if(callMe){
    let bot  = await startBot();
    let contact = await bot.Contact.find({ name: '亲亲宝贝' }) || await bot.Contact.find({ alias: '亲亲宝贝' })
    try {
      await delay(5000)
      await contact.say(`来自19楼的 ${from} 召唤你：${url}`)
      console.log('消息发送成功..')
    } catch (error) {
      console.log(error)
    }
    return '小秘已经通知本人了，请稍等片刻！！'
  }else if(showAbility){
    return `
      你好！我是AI妮妮，请问有什么帮你？
      1、我可以陪你闲聊，
      2、我是生活大百科，可以回答你的任何问题
      3、呼叫本人（请输入‘召唤大龙神’四个字，我会立刻通知本人回复你的哦）
    `
  }else if(apology){
    return '很抱歉，妮妮能力有限，请输入‘召唤大龙神’四个字，我会立刻通知本人回复你的哦！！'
  }else{
    return await robotChat(question,'不懂你的意思啊！')
  }
}

async function excSchedule(){
  //先启动微信
  // await startBot();
  //定时轮询新消息
  schedule.scheduleJob('*/10 * * * * ',listenLetter)
  //工作日12点回复帖子
  schedule.scheduleJob(' 33 14 * * 1-5 ',bath_replay_posts.bind(null,'https://jiaxing.19lou.com/forum-2215-1.html',undefined))
}

module.exports = {
  replay_letter,
  replay_post,
  get_posts,
  request,
  bath_replay_posts,
  analyzeText,
  robotChat,
  listenLetter,
  excSchedule,
  keep_reply_post
}
