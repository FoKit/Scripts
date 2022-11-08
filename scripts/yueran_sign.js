/*
脚本名称：悦然荟签到
签到规则：每日签到可获得积分
环境变量：yrh_token、yrh_info_mkey、yrh_sign_mkey（青龙）
使用说明：添加重写规则进入小程序签到成功即可获取token&mkey，多账号以@隔开
更新时间：2022-7-13
====================================================================================================
配置 (Surge)
[MITM]
hostname = %APPEND% wox2019.woxshare.com

[Script]
获取悦然荟查询mkey = type=http-request,pattern=^https:\/\/wox2019\.woxshare\.com\/clientApi\/userCenterDetail,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js
获取悦然荟签到mkey = type=http-request,pattern=^https:\/\/wox2019\.woxshare\.com\/clientApi\/signInRecordAdd,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js

悦然荟签到 = type=cron,cronexp=15 10 * * *,timeout=60,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js,script-update-interval=0
----------------------------------------------------------------------------------------------------
配置 (QuanX)
[MITM]
hostname = wox2019.woxshare.com

[rewrite_local]
^https:\/\/wox2019\.woxshare\.com\/clientApi\/userCenterDetail url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js
^https:\/\/wox2019\.woxshare\.com\/clientApi\/signInRecordAdd url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js

[task_local]
15 10 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/yueran_sign.js, tag=悦然荟签到, enabled=true
====================================================================================================
*/

const $ = new Env('悦然荟签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const API_HOST = 'https://wox2019.woxshare.com';
let token = $.getdata('yrh_token');
let info_mkey = $.getdata('yrh_info_mkey');
let sign_mkey = $.getdata('yrh_sign_mkey');
let KEY_yrh_token = 'yrh_token';
let KEY_yrh_info_mkey = 'yrh_info_mkey';
let KEY_yrh_sign_mkey = 'yrh_sign_mkey';

let tokenArr = [], info_mkeyArr = [], sign_mkeyArr = [], Message = "", timestamp = Date.now();

if (isGetUserInfo = typeof $request !== `undefined`) {
  GetUserInfo();
  $.done()
} else {
  !(async () => {
    if ($.isNode()) {
      token = process.env.yrh_token || "";
      info_mkey = process.env.yrh_info_mkey || "";
      sign_mkey = process.env.yrh_sign_mkey || "";
    }
    token = token.split('@')
    Object.keys(token).forEach((item) => {
      tokenArr.push(token[item]);
    })
    info_mkey = info_mkey.split('@')
    Object.keys(info_mkey).forEach((item) => {
      info_mkeyArr.push(info_mkey[item]);
    })
    sign_mkey = sign_mkey.split('@')
    Object.keys(sign_mkey).forEach((item) => {
      sign_mkeyArr.push(sign_mkey[item]);
    })
    if (!tokenArr[0] || !sign_mkeyArr[0]) {
      $.msg($.name, '【提示】请先获取签到Token&mkey。');
      return;
    }
    for (let i = 0; i < tokenArr.length; i++) {
      if (tokenArr[i]) {
        token = tokenArr[i];
        info_mkey = info_mkeyArr[i];
        sign_mkey = sign_mkeyArr[i];
        $.index = i + 1;
        console.log(`账号 ${$.index} 开始签到\n`);
        await UserInfo();
        await main();
      }
    }
    if (Message) {
      $.msg($.name, '', Message);
      if ($.isNode()) await notify.sendNotify($.name, Message);
    }
  })()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
}

// 获取 mkey
function GetUserInfo() {
  if ($request && $request.url.indexOf("userCenterDetail") > -1 && $request.headers && $request.body) {
    let rest_body = JSON.parse($request.body);
    if (rest_body) $.setdata(rest_body.token, KEY_yrh_token) && $.setdata(rest_body.mkey, KEY_yrh_info_mkey)
    $.msg($.name, `用户 ${rest_body.token}`, `🎉 查询 mkey 获取成功`)
  } else if ($request && $request.url.indexOf("signInRecordAdd") > -1 && $request.headers && $request.body) {
    let rest_body = JSON.parse($request.body);
    if (rest_body) $.setdata(rest_body.mkey, KEY_yrh_sign_mkey)
    $.msg($.name, `用户 ${rest_body.token}`, `🎉 签到 mkey 获取成功`)
  }
}

// 签到主函数
function main() {
  let opt = {
    url: `${API_HOST}/clientApi/signInRecordAdd`,
    headers: {
      'content-type' : `application/json`,
      'mkey' : `${sign_mkey}`,
      'Connection' : `keep-alive`,
      // 'version' : `4.0.01`,
      'bid' : `bhgff`,
      'Accept-Encoding' : `gzip,compress,br,deflate`,
      'gid' : `0`,
      'oid' : `1`,
      'token' : `${token}`,
      'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.25(0x18001925) NetType/4G Language/zh_CN`,
      'Host' : `wox2019.woxshare.com`,
      'Referer' : `https://servicewechat.com/wx8f3e8a4b8e0ebe84/69/page-frame.html`,
      'ts' : `${timestamp}`
      },
    body: `{"bid":"bhgff","token":"${token}","version":"4.0.01","mkeyUrl":"/clientApi/signInRecordAdd","mkey":"${sign_mkey}"}`
  }
  return new Promise(resolve => {
    // console.log(opt)
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            result = JSON.parse(data);
            // console.log(data)
            if (result.errCode == 0) {
              console.log(`🎉 签到成功！`);
              Message += `🎉 签到成功！`
            } else {
              console.log(`❌ ${result.errMsg}\n`);
              Message += `❌ ${result.errMsg}\n\n`
            }
          } else {
            $.log("服务器返回了空数据")
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

// 查询个人信息
function UserInfo() {
  let opt = {
    url: `${API_HOST}/clientApi/userCenterDetail`,
    headers: {
      'content-type' : `application/json`,
      'mkey' : `${info_mkey}`,
      'Connection' : `keep-alive`,
      // 'version' : `4.0.01`,
      'bid' : `bhgff`,
      'Accept-Encoding' : `gzip,compress,br,deflate`,
      'gid' : `0`,
      'oid' : `1`,
      'token' : `${token}`,
      'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.25(0x18001925) NetType/WIFI Language/zh_CN`,
      'Host' : `wox2019.woxshare.com`,
      'Referer' : `https://servicewechat.com/wx8f3e8a4b8e0ebe84/69/page-frame.html`,
      'ts' : `${timestamp}`
      },
    body: `{"bid":"bhgff","token":"${token}","version":"4.0.01","mkeyUrl":"/clientApi/userCenterDetail","mkey":"${info_mkey}"}`
  }
  return new Promise(resolve => {
    // console.log(opt)
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            result = JSON.parse(data);
            // console.log(data)
            if (result.errCode == 0) {
              NickName = `会员昵称：${result.detail.userInfoDetail.nickName}`
              Level = `会员等级：${result.detail.userInfoDetail.cardLevelName}`
              Integral = `当前积分：${result.detail.userInfoDetail.integral}`
              console.log(`${NickName}\n${Level}\n${Integral}\n`);
              Message += `\n${NickName}\n${Level}\n${Integral}\n\n`
            } else {
              console.log(`❌ 个人信息查询失败\n${result}\n`);
            }
          } else {
            $.log("服务器返回了空数据")
          }
        }
      } catch (error) {
        $.log(error)
      } finally {
        resolve();
      }
    })
  })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),a=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}
