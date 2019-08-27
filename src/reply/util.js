const urlencode = require('urlencode');
const crypto = require('crypto');
//腾讯ai接口调用签名
//params 请求参数
//app_key 你创建的app的密钥
function getSignParams(params,app_key){
    params = {
        ...params,
        time_stamp:Date.now()/1000>>0,
        nonce_str:crypto.createHash('md5').update(Date.now()+"").digest('hex'),
        sign:''
    }
    //url编码空格的编码问题，腾讯是html4标准，空格编码成+，而最新的标准是%20
    params.sign = crypto.createHash('md5')
                        .update(Object.keys(params).filter(k=>params[k]).sort().map(k => `${k}=${urlencode(params[k]).replace(/\%20/g,'+')}`).concat('app_key='+app_key).join('&'))
                        .digest('hex').toUpperCase()
    return params
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.getSignParams = getSignParams;
exports.delay = delay


