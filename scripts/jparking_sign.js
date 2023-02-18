/*
脚本名称：捷停车签到
活动入口：捷停车APP-积分签到
签到规则：连签奖励，首日1积分、次日2积分，以此类推7天封顶
活动奖励：积分可用于兑换停车券，比例 1:100
环境变量：jtc_userId（Node环境，多账号以@隔开）
使用说明：添加重写规则并打开捷停车APP即可获取userId
更新时间：2023-02-18

================ Surge 配置 ================
[MITM]
hostname = %APPEND% sytgate.jslife.com.cn

[Script]
获取捷停车userId = type=http-request, pattern=^https:\/\/sytgate\.jslife\.com\.cn\/core-gateway\/order\/carno\/pay\/info, requires-body=1, max-size=0, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js

捷停车签到 = type=cron, cronexp=15 9 * * *, timeout=60, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js, script-update-interval=0

============ Quantumult X 配置 =============
[MITM]
hostname = sytgate.jslife.com.cn

[rewrite_local]
^https:\/\/sytgate\.jslife\.com\.cn\/core-gateway\/order\/carno\/pay\/info url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js

[task_local]
15 9 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js, tag=捷停车签到, enabled=true

================ Loon 配置 ================
[MITM]
hostname = sytgate.jslife.com.cn

cron "15 9 * * *" script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js, tag=捷停车签到

http-request ^https:\/\/sytgate\.jslife\.com\.cn\/core-gateway\/order\/carno\/pay\/info script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jparking_sign.js, requires-body=true, timeout=10, enabled=false, tag=获取捷停车userId

================ Boxjs订阅 ================
订阅地址：https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json

*/

const $ = new Env('捷停车签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const jtc_userId_key = 'jtc_userId';
let userId = $.getdata(jtc_userId_key) || '';
let taskNo = $.getdata('jtc_taskNo') || "T71811221608";
let userIdArr = [], message = '', msg = '';

if ($.isNode()) {
  userId = process.env.jtc_userId || '';
  taskNo = process.env.jtc_taskNo || "T71811221608";
}
userIdArr = userId.split('@');

if (isGetCookie = typeof $request !== `undefined`) {
  GetCookie();
  $.done()
} else {
  !(async () => {
    if (!userIdArr[0]) {
      $.msg($.name, '【提示】请先获取捷停车 userId');
      return;
    }
    console.log(`\n当前共有 ${userIdArr.length} 个账号\n`);
    for (let i = 0; i < userIdArr.length; i++) {
      $.result = '';
      $.mobile = '未知';
      $.integralValue = 0;
      $.userId = userIdArr[i];
      $.index = i + 1;
      console.log(`账号[${$.index}]开始签到`);
      await checkIn();
      await getUserInfo();
      msg = `账号 ${hideSensitiveData($.mobile, 3, 4)}\n${$.result}  积分余额 ${$.integralValue}  可抵扣 ${$.integralValue / 100} 元`;
      message += msg + "\n\n";
      if (!$.isNode()) $.msg($.name, '', msg);
      await $.wait(1000 * 3);
    }
    if (message) {
      if ($.isNode()) await notify.sendNotify($.name, message);
    }
  })()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
}

function GetCookie() {
  if ($request && $request.body) {
    let body = JSON.parse($request.body);
    if (body?.userId) {
      if (!userIdArr.includes(body.userId)) {
        userId ? userId += `@${body.userId}` : userId += `${body.userId}`;
        $.setdata(userId, jtc_userId_key);
        console.log(`userId: ${body.userId}\n`);
        $.msg($.name, ``, `🎉 userId 写入成功\n${hideSensitiveData(body.userId, 4, 4)}`);
      } else {
        console.log(`❌ ${body.userId} 已存在\n`);
      }
    }
  }
}

// 签到
function checkIn() {
  let opt = {
    url: `https://jparking.jslife.com.cn/jparking-other-service/coupons/integral/receive`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Connection": "keep-alive",
      "Content-Length": "89",
      "Content-Type": "application/json;charset=UTF-8",
      "Host": "jparking.jslife.com.cn",
      "Origin": "https://www.jslife.com.cn",
      "Referer": "https://www.jslife.com.cn/",
      "User-Agent": `JTC/6.0.4 (iPhone; iOS 16.3; Scale/3.00)`,
      "axiosSrc": "dataService"
    },
    body: `{"userId":"${$.userId}","reqSource":"JTC_I","taskNo":"${taskNo}"}`
  }
  return new Promise(resolve => {
    // console.log(opt)
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            // console.log(data);
            data = JSON.parse(data);
            if (data.right) {
              $.result = `🎉 签到${data.message}`;
              console.log($.result);
            } else {
              $.result = `❌ 重复签到`;
              console.log($.result);
            }
          } else {
            $.log("服务器返回了空数据")
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    })
  })
}

// 查询用户信息
function getUserInfo() {
  let opt = {
    url: `https://sytgate.jslife.com.cn/base-gateway/member/queryMbrCityBaseInfo`,
    headers: {
      'Accept': `*/*`,
      'Connection': `keep-alive`,
      'Content-Type': `application/json;charset=utf-8`,
      'Accept-Encoding': `gzip, deflate, br`,
      'Host': `sytgate.jslife.com.cn`,
      'User-Agent': `JTC/6.0.4 (iPhone; iOS 16.3; Scale/3.00)`,
      'Accept-Language': `zh-Hans-CN;q=1, zh-Hant-HK;q=0.9, en-CN;q=0.8, de-DE;q=0.7, ja-CN;q=0.6`
    },
    body: `{"userId": "${$.userId}","reqSource": "APP_JTC"}`
  }
  return new Promise(resolve => {
    // console.log(opt)
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            // console.log(data)
            data = JSON.parse(data);
            if (data.code == '0') {
              $.mobile = data.data.mobile;
              $.integralValue = data.data.integralValue;
              console.log(`账号 ${$.mobile}  积分余额 ${$.integralValue}\n`);
            } else {
              console.log(`❌ 用户信息查询失败\n${data}\n`);
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


// 数据脱敏
function hideSensitiveData(string, head_length = 2, foot_length = 2) {
  let star = '';
  for (var i = 0; i < string.length - head_length - foot_length; i++) {
    star += '*';
  }
  return string.substring(0, head_length) + star + string.substring(string.length - foot_length);
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),a=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}
