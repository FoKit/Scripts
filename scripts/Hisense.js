/**
 * 脚本名称：海信爱家
 * 活动入口：海信爱家（公众号） -> 个人中心 -> 会员中心 -> 玩转积分 -> 签到
 * 活动说明：每日签到送10积分；连续签到7天、第7天额外赠送20积分；连续签到20天，第20天额外赠送50积分；连续签到50天，第50天额外赠送100积分。
 * 脚本说明：配置重写并手动签到一次即可获取签到数据。兼容 Node.js 环境，变量名称 HISENSE_CPS、HISENSE_SWEIXIN，多账号分割符 "@"。
 * 仓库地址：https://github.com/FoKit/Scripts
 * 更新时间：2023-10-17
/*
--------------- BoxJS & 重写模块 --------------

https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_hisense_cookie.sgmodule

------------------ Surge 配置 -----------------

[MITM]
hostname = sweixin.hisense.com, cps.hisense.com

[Script]
海信数据 = type=http-request,pattern=^https:\/\/sweixin\.hisense\.com\/ecrp\/member\/initMember,requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js
海信签到 = type=http-request,pattern=^https:\/\/cps\.hisense\.com\/customerAth\/activity-manage\/activityUser\/participate,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js

海信爱家 = type=cron,cronexp=52 7 * * *,timeout=60,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js,script-update-interval=0

------------------ Loon 配置 ------------------

[MITM]
hostname = sweixin.hisense.com, cps.hisense.com

[Script]
http-request ^https:\/\/sweixin\.hisense\.com\/ecrp\/member\/initMember tag=海信数据, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js,requires-body=0
http-request ^https:\/\/cps\.hisense\.com\/customerAth\/activity-manage\/activityUser\/participate tag=海信签到, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js,requires-body=1

cron "52 7 * * *" script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js,tag = 海信爱家,enable=true

-------------- Quantumult X 配置 --------------

[MITM]
hostname = sweixin.hisense.com, cps.hisense.com

[rewrite_local]
^https:\/\/sweixin\.hisense\.com\/ecrp\/member\/initMember url script-request-header https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js
^https:\/\/cps\.hisense\.com\/customerAth\/activity-manage\/activityUser\/participate url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js

[task_local]
52 7 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js, tag=海信爱家, img-url=https://github.com/FoKit/Scripts/blob/main/images/hisense.png?raw=true, enabled=true

------------------ Stash 配置 -----------------

cron:
  script:
    - name: 海信爱家
      cron: '52 7 * * *'
      timeout: 60

http:
  mitm:
    - "sweixin.hisense.com, cps.hisense.com"
  script:
    - match: ^https:\/\/sweixin\.hisense\.com\/ecrp\/member\/initMember
      name: 海信数据
      type: request
      require-body: false
    - match: ^https:\/\/cps\.hisense\.com\/customerAth\/activity-manage\/activityUser\/participate
      name: 海信签到
      type: request
      require-body: true

script-providers:
  海信爱家:
    url: https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/Hisense.js
    interval: 86400

*/

const $ = new Env('海信爱家');
const notify = $.isNode() ? require('./sendNotify') : '';
const HISENSE_CPS_KEY = 'HISENSE_CPS';
const HISENSE_SWEIXIN_KEY = 'HISENSE_SWEIXIN';
let HISENSE_CPS = ($.isNode() ? process.env.HISENSE_CPS : $.getdata(HISENSE_CPS_KEY)) || '';
let HISENSE_SWEIXIN = ($.isNode() ? process.env.HISENSE_SWEIXIN : $.getdata(HISENSE_SWEIXIN_KEY)) || '';
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';
let message = '';

if (isGetCookie = typeof $request !== `undefined`) {
  GetCookie();
  $.done();
} else {
  !(async () => {
    let HISENSE_CPS_ARR = HISENSE_CPS.split('@');
    let HISENSE_SWEIXIN_ARR = HISENSE_SWEIXIN.split('@');
    if (!HISENSE_CPS_ARR[0] && !HISENSE_SWEIXIN_ARR[0]) {
      $.msg($.name, '❌ 请先获取海信爱家签到数据。');
      return;
    }
    console.log(`共有[${HISENSE_CPS_ARR.length}]个海信爱家账号\n`);
    for (let i = 0; i < HISENSE_CPS_ARR.length; i++) {
      if (HISENSE_CPS_ARR[i]) {
        $.SWEIXIN_CK = HISENSE_SWEIXIN_ARR[i]
        $.CPS_CK = HISENSE_CPS_ARR[i]
        $.index = i + 1;
        console.log(`===== 账号[${$.index}]开始签到 =====\n`);
        await main();  // 每日签到
        await getInfo();  // 用户信息
      }
    }
    if (message) {
      message = message.replace(/\n+$/, '');
      if ($.isNode()) {
        await notify.sendNotify($.name, message);
      } else {
        $.msg($.name, '', message);
      }
    }
  })()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
}


// 获取签到数据
function GetCookie() {
  if ($request && /initMember/.test($request.url)) {
    $.data = $request.headers['COOKIE'] || $request.headers['Cookie'] || $request.headers['cookie'];
    if ($.data) {
      console.log("HISENSE_SWEIXIN: " + $.data);
      $.setdata($.data, HISENSE_SWEIXIN_KEY);
      if (!HISENSE_SWEIXIN) {
        $.msg($.name, ``, `🎈 点击【玩转积分】签到一次即可获取签到数据。`);
      }
    }
  } else if ($request && /participate/.test($request.url)) {
    $.data = $request.headers['COOKIE'] || $request.headers['Cookie'] || $request.headers['cookie'];
    if ($.data) {
      console.log("HISENSE_CPS: " + $.data);
      $.setdata($.data, HISENSE_CPS_KEY);
      if (!HISENSE_CPS) {
        $.msg($.name, ``, `🎉 签到数据获取成功。`);
      }
    }
  }
}


// 每日签到
function main() {
  let opt = {
    url: `https://cps.hisense.com/customerAth/activity-manage/activityUser/participate`,
    headers: {
      // 'X-Requested-With': `XMLHttpRequest`,
      // 'Connection': `keep-alive`,
      // 'Accept-Encoding': `gzip, deflate, br`,
      'Content-Type': `application/json`,
      // 'Origin': `https://cps.hisense.com`,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.33(0x18002129) NetType/4G Language/zh_CN`,
      'Cookie': $.CPS_CK,
      // 'Host': `cps.hisense.com`,
      // 'Referer': `https://cps.hisense.com/static/game_sign.shtml?code=74f51fd29cea445e9b95eb0dd14fba40`,
      // 'Accept-Language': `zh-CN,zh-Hans;q=0.9`,
      // 'Accept': `application/json, text/javascript, */*; q=0.01`
    },
    body: `{"code":"74f51fd29cea445e9b95eb0dd14fba40"}`
  }
  return new Promise(resolve => {
    // console.log(opt);
    $.post(opt, async (err, resp, data) => {
      try {
        err && $.log(err);
        if (data) {
          debug(data);
          $.message = '';
          data = JSON.parse(data);
          if (data?.isSuccess && data?.resultCode == "00000") {
            $.message += `签到成功，获得 ${data.data.obtainScore} 积分 🎉`;
          } else if (data?.resultCode == "A0202") {
            $.message += `重复签到 ❌`;
          } else {
            $.message += `${data.resultMsg} ❌`;
            console.log(JSON.stringify($.message));
          }
        } else {
          $.log("服务器返回了空数据");
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    })
  })
}


// 用户信息
async function getInfo() {
  let opt = {
    url: `https://sweixin.hisense.com/ecrp/member/initMember`,
    headers: {
      // 'Accept-Encoding': `gzip, deflate, br`,
      'Cookie': $.SWEIXIN_CK,
      // 'Connection': `keep-alive`,
      // 'Accept': `application/json, text/plain, */*`,
      // 'Referer': `https://sweixin.hisense.com/front/?`,
      // 'Host': `sweixin.hisense.com`,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.33(0x18002129) NetType/4G Language/zh_CN`,
      // 'Authorization': ``,
      // 'Accept-Language': `zh-CN,zh-Hans;q=0.9`
    }
  }
  return new Promise(resolve => {
    $.get(opt, async (err, resp, data) => {
      try {
        err && $.log(err);
        if (data) {
          debug(data);
          let text = '';
          data = JSON.parse(data);
          if (data?.data?.memberDetail) {
            let memberDetail = data.data.memberDetail;
            const { gradeName, score, customerName, memberCard, kdOpenId, grade, grouthValue, thdCusmobile, nextGrouthValue } = memberDetail;
            text += `账号[${hideSensitiveData(thdCusmobile, 3, 4)}] ${$.message}\n当前积分:${score}, 会员等级:${gradeName}, 成长值:${grouthValue}/${grouthValue + nextGrouthValue}\n`
          } else {
            text += `❌ 用户信息获取失败\n`;
          }
          console.log(text);
          message += text;
        } else {
          $.log("服务器返回了空数据");
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    })
  })
}


// 数据脱敏
function hideSensitiveData(string, head_length = 2, foot_length = 2) {
  let star = '';
  try {
    for (var i = 0; i < string.length - head_length - foot_length; i++) {
      star += '*';
    }
    return string.substring(0, head_length) + star + string.substring(string.length - foot_length);
  } catch (e) {
    console.log(e);
    return string;
  }
}


// DEBUG
function debug(text) {
  if ($.is_debug === 'true') {
    if (typeof text == "string") {
      console.log(text);
    } else if (typeof text == "object") {
      console.log($.toStr(text));
    }
  }
}


// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }