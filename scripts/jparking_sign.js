/*
脚本名称：捷停车签到
签到规则：连签奖励，首日1积分，次日2积分，以此类推
活动入口：捷停车APP-积分签到
环境变量：jtc_userId（青龙）
使用说明：添加重写规则并打开捷停车APP即可获取 userId
更新时间：2022-6-11
====================================================================================================
配置 (Surge)
[MITM]
jparking.jslife.com.cn

[Script]
http-request ^https:\/\/jparking\.jslife\.com\.cn\/jparking-service\/pay\/login_to_jsjk script-path=https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jparking_sign.js, requires-body=true
cron "15 9 * * *" script-path=https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jparking_sign.js
----------------------------------------------------------------------------------------------------
配置 (QuanX)
[MITM]
jparking.jslife.com.cn

[rewrite_local]
^https:\/\/jparking\.jslife\.com\.cn\/jparking-service\/pay\/login_to_jsjk url script-request-body https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jparking_sign.js

[task_local]
15 9 * * * https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jparking_sign.js
====================================================================================================
*/

const $ = new Env('捷停车签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const API_HOST = 'https://jparking.jslife.com.cn';
let userId = $.getdata('jtc_userId');
let taskNo = $.getdata('jtc_taskNo');
let KEY_jtc_userId = 'jtc_userId'
let KEY_jtc_mobile = 'jtc_mobile'
let allMessage = "";

if (!$.isNode()) {
  userId = process.env.jtc_userId；
  taskNo = process.env.jtc_taskNo；
}

if (!taskNo) {
  taskNo = "T71811221608";
}

if ($request && $request.headers && $request.body) {
  const rest_body = $request.body
  if (rest_body) $.setdata(rest_body.userId, KEY_jtc_userId) && $.setdata(rest_body.mobile, KEY_jtc_mobile)
  $.msg($.name, `用户 ${rest_body.mobile}`, `userId 获取成功`)
}

!(async () => {
  await main();
  if (allMessage) {
    $.msg($.name, '', allMessage);
    if ($.isNode()) await notify.sendNotify($.name, allMessage);
  }
})()
.catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

function main() {
  let opt = {
    url: `${API_HOST}/jparking-other-service/coupons/integral/receive`,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;JTC_IOS',
    },
    body: `{"userId":"${userId}","reqSource":"JTC_I","taskNo":"${taskNo}"}`
  }
  console.log(`\n********开始签到********\n`);
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.right) {
              console.log(`${userId}\n🎉签到${data.message}`);
              allMessage += `${userId}\n🎉签到${data.message}`
            } else {
              console.log(`${userId}\n❌签到${data.message}`);
              allMessage += `${userId}\n❌签到${data.message}`
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=get;return"POST"===e&&(s=post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return send.call(env,t)}post(t){return send.call(env,t,"POST")}}return new class{constructor(t,e){name=t,http=new s(this),data=null,dataFile="box.dat",logs=[],isMute=!1,isNeedRewrite=!1,logSeparator="\n",startTime=(new Date).getTime(),Object.assign(this,e),log("",`🔔${name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=getdata(t);if(i)try{s=JSON.parse(getdata(t))}catch{}return s}setjson(t,e){try{return setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,accept:"*/*"}};post(n,(t,e,i)=>s(i))}).catch(t=>logErr(t))}loaddata(){if(!isNode())return{};{fs=fs?fs:require("fs"),path=path?path:require("path");const t=path.resolve(dataFile),e=path.resolve(process.cwd(),dataFile),s=fs.existsSync(t),i=!s&&fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(isNode()){fs=fs?fs:require("fs"),path=path?path:require("path");const t=path.resolve(dataFile),e=path.resolve(process.cwd(),dataFile),s=fs.existsSync(t),i=!s&&fs.existsSync(e),r=JSON.stringify(data);s?fs.writeFileSync(t,r):i?fs.writeFileSync(e,r):fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?getval(s):"";if(r)try{const t=JSON.parse(r);e=t?lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);lodash_set(e,r,t),s=setval(JSON.stringify(e),i)}catch(e){const o={};lodash_set(o,r,t),s=setval(JSON.stringify(o),i)}}else s=setval(t,e);return s}getval(t){return isSurge()||isLoon()?$persistentStore.read(t):isQuanX()?$prefs.valueForKey(t):isNode()?(data=loaddata(),data[t]):data&&data[t]||null}setval(t,e){return isSurge()||isLoon()?$persistentStore.write(t,e):isQuanX()?$prefs.setValueForKey(t,e):isNode()?(data=loaddata(),data[e]=t,writedata(),!0):data&&data[e]||null}initGotEnv(t){got=got?got:require("got"),cktough=cktough?cktough:require("tough-cookie"),ckjar=ckjar?ckjar:new cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),isSurge()||isLoon()?(isSurge()&&isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):isQuanX()?(isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):isNode()&&(initGotEnv(t),got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(cktough.Cookie.parse).toString();s&&ckjar.setCookieSync(s,null),e.cookieJar=ckjar}}catch(t){logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],isSurge()||isLoon())isSurge()&&isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(isQuanX())t.method="POST",isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(isNode()){initGotEnv(t);const{url:s,...i}=t;got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return isLoon()?t:isQuanX()?{"open-url":t}:isSurge()?{url:t}:void 0;if("object"==typeof t){if(isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(isMute||(isSurge()||isLoon()?$notification.post(e,s,i,o(r)):isQuanX()&&$notify(e,s,i,o(r))),!isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),logs=logs.concat(t)}}log(...t){t.length>0&&(logs=[...logs,...t]),console.log(t.join(logSeparator))}logErr(t,e){const s=!isSurge()&&!isQuanX()&&!isLoon();s?log("",`❗️${name}, 错误!`,t.stack):log("",`❗️${name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-startTime)/1e3;log("",`🔔${name}, 结束! 🕛 ${s} 秒`),log(),(isSurge()||isQuanX()||isLoon())&&$done(t)}}(t,e)}