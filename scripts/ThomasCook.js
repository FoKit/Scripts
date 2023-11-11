/*
脚本名称：托迈酷客
活动规则：每日签到可获得积分
环境变量：ThomasCook_Cookie
使用说明：添加重写规则进入“复游度假生活”小程序即可获取Cookie
更新时间：2023-11-10 新增每日浏览任务
更新时间：2023-11-12 代码优化
====================================================================================================
配置 (Surge)
[MITM]
hostname = apis.folidaymall.com

[Script]
获取托迈酷客Cookie = type=http-request,pattern=^https:\/\/apis\.folidaymall\.com\/online\/capi\/uc\/getCount,requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/ThomasCook.js


托迈酷客 = type=cron,cronexp=15 10 * * *,timeout=60,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/ThomasCook.js,script-update-interval=0
----------------------------------------------------------------------------------------------------
配置 (QuanX)
[MITM]
hostname = apis.folidaymall.com

[rewrite_local]
^https:\/\/apis\.folidaymall\.com\/online\/capi\/uc\/getCount url script-request-header https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/ThomasCook.js

[task_local]
15 10 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/ThomasCook.js, tag=托迈酷客, enabled=true
====================================================================================================
*/

const $ = new Env('托迈酷客');
const ck_key = 'ThomasCook_Cookie';
const origin = 'https://apis.folidaymall.com';

// ---------------------- 一般不动变量区域 ----------------------
const Notify = 1;  // 0 为关闭通知, 1 为打开通知, 默认为 1
let cookie = '', cookiesArr = [], userIdx = 0;  // Cookie 数据
$.notifyMsg = [];  // 为通知准备的空数组
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';  // 调试模式

// ---------------------- 自定义变量区域 ----------------------


// 统一管理 api 接口
const Api = {
  "sign": {
    "name": "每日签到",
    "url": "/online/cms-api/sign/userSign",
  },
  "relationList": {
    "name": "获取任务列表",
    "url": "/online/cms-api/activity/queryActivityTaskRelationList",
  },
  "task": {
    "name": "领取任务",
    "url": "/online/cms-api/activity/receiveActivityTask",
    "body": `{"activityTaskId":"${$.activityTaskId}"}`
  },
  "submit": {
    "name": "提交任务",
    "url": "/online/cms-api/activity/submitCompleteActivityTask",
    "body": `{"activityTaskId":"${$.activityTaskId}"}`
  },
  "rewards": {
    "name": "领取奖励",
    "url": "/online/cms-api/activity/receiveActivityTaskRewards",
    "body": `{"activityTaskId":"${$.activityTaskId}","activityTaskRelationId":"${$.activityTaskRelationId}"}`
  }
}

// 获取 Cookie
function GetCookie() {
  if ($request && $request.url.indexOf("getCount") > -1 && $request.headers.Authorization) {
    cookie = $request.headers.Authorization;
    $.setdata(cookie, ck_key);
    $.msg($.name, ``, `🎉 Cookie 获取成功`);
  }
}

// 脚本入口函数
async function main() {
  for (let cookieItem of cookiesArr) {
    cookie = cookieItem;
    $.index = ++userIdx;
    $.activityTaskId = '';
    $.activityTaskRelationId = '';
    $.taskContentNum = 0;
    $.notCompleted = true;
    console.log(`\n账号 ${$.index} 开始执行\n`);
    // 每日签到
    await signin();
    // 获取任务列表
    await relationList();
    // 如果任务id不存在或已完成，则跳过该用户
    if (!$.activityTaskId || !$.notCompleted) continue;
    // 领取任务
    await toTask(Api.task);
    // 等待任务
    await $.wait(1000 * $.taskContentNum);
    // 提交任务
    await toTask(Api.submit);
    // 再次获取任务列表
    await relationList();
    // 领取奖励
    await toTask(Api.rewards);
  }
}

// 每日签到
async function signin() {
  try {
    let result = await httpRequest(options(Api.sign.url));
    debug(result);
    let text = '';
    if (result?.responseCode === '0') {
      $.mobile = result.data.signInfo.mobile;  // 手机号
      // $.accountId = result.data.signInfo.accountId;  // 用户ID
      $.signInStatus = result.data.signInfo.signInStatus === 1 ? '🎉 签到成功' : "❌ 签到失败";  // 签到状态：1=是 0=否
      $.changeIntegeral = result.data.signInfo.changeIntegeral;  // 积分变动
      $.continousSignDays = result.data.signInfo.continousSignDays;  // 连续签到天数
      $.currentIntegral = result.data.signInfo.currentIntegral + $.changeIntegeral;  // 当前积分
      text = `账号 ${$.mobile}\n${$.signInStatus}, ${$.changeIntegeral > 0 ? `积分 +${$.changeIntegeral}, ` : ''}连续签到 ${$.continousSignDays} 天, 积分余额 ${$.currentIntegral}\n`;
    } else if (result?.responseCode === '402') {
      $.signInStatus = result.message;
      text = $.signInStatus;
    } else {
      $.signInStatus = "❌ 签到失败";
      text = $.signInStatus;
      console.log(data);
    }
    $.notifyMsg.push(text);
    console.log(`每日签到: ${$.signInStatus}`);
  } catch (e) {
    console.log(e);
  }
}

// 获取任务列表
async function relationList() {
  try {
    let result = await httpRequest(options(Api.relationList.url));
    debug(result);
    let taskList = result.data.activityTaskRelations;
    for (const item of taskList) {
      const { activityTaskId, activityTaskRelationId, activityTaskName, activityTaskType, activityTaskDesc, taskProcessStatus, activityTaskSort, taskContentNum, taskRewardType, taskRewardTypeName, taskRewardValue, taskJumpAddressType, taskJumpAddressDesc, taskEventButton, taskFinishNum, successRewardDesc } = item;
      if (taskRewardTypeName == "积分") {
        $.activityTaskId = activityTaskId;
        // if (!activityTaskRelationId) console.log(`\n活动名称: ${activityTaskName}\n活动说明: ${activityTaskDesc}\n活动奖励: ${taskRewardValue} ${taskRewardTypeName}`);
        if (taskProcessStatus == "NOT_COMPLETED") {
          $.taskContentNum = taskContentNum;
          console.log(`活动名称: ${activityTaskName}\n活动说明: ${activityTaskDesc}\n活动奖励: ${taskRewardValue} ${taskRewardTypeName}`);
        } else {
          $.notCompleted = false;
          $.activityTaskRelationId = activityTaskRelationId;
          console.log(`完成任务: ${$.activityTaskRelationId}`);
        }
        break;
      }
      // console.log(item);
    }
  } catch (e) {
    console.log(e);
  }

}

// 执行任务
async function toTask(obj) {
  try {
    let result = await httpRequest(options(obj.url, obj.body));
    debug(result);
    if (result?.responseCode == "0") {
      console.log(`${taskName}: ${result['message']}`);
    } else {
      console.log(`${taskName}失败: ${$.toStr(result)}`);
    }
  } catch (e) {
    console.log(e);
  }
}

// 主执行程序
!(async () => {
  // 获取 Cookie
  if (isGetCookie = typeof $request !== `undefined`) {
    GetCookie();
    return;
  }
  // 未检测到 Cookie，退出
  if (!(await checkEnv())) { throw new Error(`❌未检测到ck，请添加环境变量`) };
  // 执行任务
  if (cookiesArr.length > 0) await main();
})()
  .catch((e) => $.notifyMsg.push(e.message || e))  // 捕获登录函数等抛出的异常, 并把原因添加到全局变量(通知)
  .finally(async () => {
    await sendMsg($.notifyMsg.join('\n'));  // 推送通知
    $.done();
  })


// ---------------------- 辅助函数区域 ----------------------
// 封装请求参数
function options(url, body = '') {
  let opt = {
    url: `${origin}${url}`,
    headers: {
      'Accept': `*/*`,
      'Origin': `https://hotels.folidaymall.com`,
      'Accept-Encoding': `gzip, deflate, br`,
      'Content-Type': `application/json;charset=utf-8`,
      'Connection': `keep-alive`,
      'Host': `apis.folidaymall.com`,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.32(0x1800202c) NetType/WIFI Language/zh_CN miniProgram/wx1fa4da2889526a37`,
      'Authorization': cookie,
      'Accept-Language': `zh-CN,zh-Hans;q=0.9`,
      'Referer': `https://hotels.folidaymall.com/`
    },
    body,
    timeout: 10000
  }
  if (body == '') delete opt.body;
  return opt;
}

// 检查变量
async function checkEnv() {
  // 多账号分割
  cookie = ($.isNode() ? process.env.ThomasCook_Cookie : $.getdata(ck_key)).split('@');
  if (cookie) {
    // 获取 Cookie 数组
    Object.keys(cookie).forEach((item) => item && cookiesArr.push(cookie[item]));
    // 检测账号数量
    return console.log(`共找到${cookiesArr.length}个账号`), true;  // true == !0
  }
  return;
}

// 发送消息
async function sendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    if ($.isNode()) {
      try {
        var notify = require('./sendNotify');
      } catch (e) {
        var notify = require('./utils/sendNotify');
      }
      await notify.sendNotify($.name, message);
    } else {
      $.msg($.name, '', message);
    }
  } else {
    console.log(message);
  }
}

// DEBUG
function debug(content) {
  let start = '\n------- debug ------\n';
  let end = `\n----- ${$.time('HH:mm:ss')} -----\n`;
  if ($.is_debug === 'true') {
    if (typeof content == "string") {
      console.log(start + content + end);
    } else if (typeof content == "object") {
      console.log(start + $.toStr(content) + end);
    }
  }
}


// 请求函数二次封装
function httpRequest(options, method) { typeof (method) === 'undefined' ? ('body' in options ? method = 'post' : method = 'get') : method = method; return new Promise((resolve) => { $[method](options, (err, resp, data) => { try { if (err) { console.log(`${method}请求失败`); $.logErr(err) } else { if (data) { typeof JSON.parse(data) == 'object' ? data = JSON.parse(data) : data = data; resolve(data) } else { console.log(`服务器返回空数据`) } } } catch (e) { $.logErr(e, resp) } finally { resolve() } }) }) }
// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }
