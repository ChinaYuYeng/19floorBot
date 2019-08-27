const exec = require('child_process').exec;

function getCookies(domain){
    return new Promise(function(res,rej){
        let cookie = [];
        exec(`python -c "import cookies;cookies.get_chrome_cookies('${domain}')"`,(err,stdout,stderr)=>{
            if(err){
              rej(err)
              return ''
            }
            let cookieObj = JSON.parse(stdout.replace(/'/g,'"'))
            for(let c in cookieObj){
              cookie.push(`${c}=${cookieObj[c]}`)
            }
            console.log('当前浏览器cookie数：',cookie.length)
            res(cookie.join(';'))
        })      
    })
}

exports.getCookies = getCookies

