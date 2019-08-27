// const crypto = require('crypto');
// const fs = require('fs')
// const sqlite3 = require('sqlite3')
// const ffi = require('ffi');
// const ref = require('ref')
// const ArrayType = require('ref-array');
// const {getCookies} = require('./cookies')
const {replay_post,replay_letter,get_posts,bath_replay_posts,analyzeText,robotChat,listenLetter,excSchedule,keep_reply_post} = require('./19lou')
// const superagent = require('superagent')
// const async = require("async");
// const request  = require("request")
// const urlencode = require('urlencode');




let domain = '.19lou.com,jiaxing.19lou.com,.jiaxing.19lou.com'

// getCookies(domain).then(res=>{
//   console.log(res);
// })

// replay_post({
//     fid: '2215',
//     tid: '177751560325830362',
//     content: '大家好。。。',
// }).then(res=>{
//     console.log(res)
// })

// replay_letter({url:'https://jiaxing.19lou.com/u/msg/dialog/single?dialogId=48501561524456048',nums:2,from:'空岛一人'})

// bath_replay_posts('https://jiaxing.19lou.com/forum-2215-1.html')
excSchedule()
// keep_reply_post({})
// listenLetter()
// analyzeText('https://jiaxing.19lou.com/forum-2215-thread-177461560314835172-1-1.html').then(res=>{
//     console.log(res)
// })

// let keyword = undefined;
// robotChat(keyword).then(res=>{
//     console.log(res)
// }).then(res=>{
//     console.log(1213)
// })
// console.log('2222')

//腾讯ai接口调用签名
//params 请求参数
//app_key 你创建的app的密钥
// function getSignParams(params,app_key='nTtEpKv7jWSJeaND'){
//     // console.log(Object.keys(params).sort().map(k=>`${k}=${urlencode(params[k]).replace(/\%20/g,'+')}`).concat('app_key=nTtEpKv7jWSJeaND').join('&'))
//     params.sign = crypto.createHash('md5')
//                         .update(Object.keys(params).filter(k=>params[k]).sort().map(k => `${k}=${urlencode(params[k]).replace(/\%20/g,'+')}`).concat('app_key='+app_key).join('&'))
//                         .digest('hex').toUpperCase()
//     return params
// }


// request({
//     method:'post',
//     url:'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat',
//     form:getSignParams({
//         app_id:'2117528645',
//         time_stamp:Date.now()/1000>>0,
//         nonce_str:crypto.createHash('md5').update(Date.now()+"").digest('hex'),
//         question:`扯淡`,
//         session:'10002',
//         sign:''
//     }),
//   },    
//   function(err,r,res){
//         if(err){
//             throw new Error(err)
//         }else{
//             console.log(res)
//         }
//     }
// )


// get_posts('https://jiaxing.19lou.com/forum-2215-3.html').then(res=>{
//     async.eachOfSeries(res,function(v,k,cb){
//         replay_post({fid:v.fid,tid:v.tid,content:'你的帖子我来顶，不用谢我，举手之劳！'}).then(_=>{
//             const respones = JSON.parse(_);
//             if(respones.success == 'false'){
//                 throw new Error(_)
//             }else{
//                 console.log(v)
//                 setTimeout(cb,1*60*1000)
//             }
//         }).catch(err => {
//             cb(err)
//         })
//     },err => {
//         if(err) throw new Error(err)
//     })

//     // console.log(res[0])
//     // replay_post({fid:res[0].fid,tid:res[0].tid,content:'你的帖子我来顶，不用谢我，举手之劳！'}).then(_=>{
//     //     console.log(_)
//     // }).catch(err=>{
//     //     console.log(err);
//     // })
// })


// request('get','http://www.baidu.com')


// let req = request({
//     protocol:'https:',
//     host:'www.baidu.com',
//     port:'443',
//     path :'/',
//     method:'get',
//     headers:{
//         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
//         "Accept-Encoding": "deflate, br",
//         "Accept-Language": "zh-CN,zh;q=0.9",
//         "Cache-Control": "max-age=0",
//         "Connection": "keep-alive",
//         "Host": "www.baidu.com",
//         "Referer":" https://www.baidu.com/",
//         "Upgrade-Insecure-Requests": 1,
//         "User-Agent":" Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"
//     }
// },(res) => {
//     console.log(`状态码: ${res.statusCode}`);
//     console.log(`响应头: ${JSON.stringify(res.headers)}`);
//     res.on('data', (chunk) => {
//         process.stdout.write(chunk);
//     });
//   })
//   console.log(req)
//   req.end()

// let current = ffi.Library('C:\\Windows\\System32\\crypt32',{
//     'CryptUnprotectData':['bool',[ref.refType('string'),'string','string','string','string',ref.types.int,ref.types.Object]]
// })

// var obj = crypto.createHash('md5');
// obj.update('__JSONP_yw6p3np_4');

//  console.log(obj.digest('hex'));
// let cnn = new sqlite3.Database('C:/Users/dell/AppData/Local/Google/Chrome/User Data/Default/Cookies',function(error){
//     if(error){
//         console.log(error)
//     }else{
//         let DataVerify = {}
//         cnn.all('SELECT host_key, name, path, value, encrypted_value FROM cookies where host_key = ".baidu.com"',function(e,res){
//             for(let i of res){
//                 if (current.CryptUnprotectData(
//                     i.encrypted_value,
//                     null,
//                     null,   
//                     null,         
//                     null,            
//                     0,
//                     DataVerify)){
//                         console.log(DataVerify)
//                     }
                   
//             }
//             console.log(ref.getType(res[0].encrypted_value))
//         })
//     }
    
// })
