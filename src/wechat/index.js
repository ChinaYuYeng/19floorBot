const { Wechaty } = require('wechaty')
const Qrterminal = require('qrcode-terminal')

let bot = {};
function startBot(botName = 'listener'){
    return new Promise(resolve => {
        if(bot.userSelf && bot.userSelf()){
            resolve(bot)
        }else{
            const wechat = new Wechaty({name:botName})
            wechat.on('scan',(qrcode, status) => {
                Qrterminal.generate(qrcode,{small: true})
                console.log(['https://api.qrserver.com/v1/create-qr-code/?data=',encodeURIComponent(qrcode),'&size=220x220&margin=20',].join(''))
            })
            wechat.on('login',user => {
                bot = wechat;
                console.log(`user ${user} login success`)
                resolve(bot)
            })
            wechat.on('logout',user => {
                bot = {};
                console.log(`user ${user} logout`)
            })
            wechat.on('error',err=>{
                console.error(err)
            })
            wechat.start()
        }

    })    
}

exports.startBot = startBot