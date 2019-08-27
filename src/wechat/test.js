const {startBot} = require('../wechat/index')
//监听私信
async function listenLetter(){
    let bot1  = await startBot();
    let bot2 = await startBot();
    let bot3 = await startBot();
    console.log(bot1 === bot2 && bot1 === bot3 && bot2 === bot3)
  }

  listenLetter()