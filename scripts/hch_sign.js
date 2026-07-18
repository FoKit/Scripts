/**
 * 脚本名称：花城汇小程序（广州）
 * 活动规则：每日签到可获得 10-30 积分，兼容 NE 和 Node.js 环境。
 * 更新时间：2025-08-23
 * 环境变量：HCH_USERID
 * BoxJs订阅：https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json

------------------ Surge 配置 -----------------

[MITM]
hostname = member.mowgz.com

[Script]
花城汇# = type=http-request,pattern=^https:\/\/member\.mowgz\.com\/bus\/getFunc\?busId=Member&methodId=getMember&getPram=gold%2Clevel&compId=\d+?&userId=\w+,requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js

花城汇 = type=cron,cronexp=17 7 * * *,timeout=60,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js,script-update-interval=0

------------------ Loon 配置 ------------------

[MITM]
hostname = member.mowgz.com

[Script]
http-request ^https:\/\/member\.mowgz\.com\/bus\/getFunc\?busId=Member&methodId=getMember&getPram=gold%2Clevel&compId=\d+?&userId=\w+ tag=花城汇#, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js,requires-body=0

cron "17 7 * * *" script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js,tag = 花城汇,enable=true

-------------- Quantumult X 配置 --------------

[MITM]
hostname = member.mowgz.com

[rewrite_local]
^https:\/\/member\.mowgz\.com\/bus\/getFunc\?busId=Member&methodId=getMember&getPram=gold%2Clevel&compId=\d+?&userId=\w+ url script-request-header https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js

[task_local]
17 7 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js, tag=花城汇, img-url=https://raw.githubusercontent.com/FoKit/Scripts/main/images/hch.png, enabled=true

------------------ Stash 配置 -----------------

cron:
  script:
    - name: 花城汇
      cron: '17 7 * * *'
      timeout: 60

http:
  mitm:
    - "member.mowgz.com"
  script:
    - match: ^https:\/\/member\.mowgz\.com\/bus\/getFunc\?busId=Member&methodId=getMember&getPram=gold%2Clevel&compId=\d+?&userId=\w+
      name: 花城汇
      type: request
      require-body: false

script-providers:
  花城汇:
    url: https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/hch_sign.js
    interval: 86400

 */

const $ = new Env('花城汇');
$.is_debug = ($.isNode() ? process.env['IS_DEDUG'] : $.getdata('is_debug')) || 'false';  // 调试模式
$.userList = ($.isNode() ? process.env['HCH_USERID'] : $.getdata('@hch.userid')) || "";  // userIdArr
$.messages = [];

// 主函数
async function main() {
  // 检查变量
  checkEnv();
  for (let i = 0; i < $.userList.length; i++) {
    // 初始化
    $.user_id = $.userList[i];
    $.log(`账号 ${i + 1} 开始执行 \n`);

    // 查询信息
    await userCenter();

    if (!$.user_id) {
      $.log(`账号 ${i + 1} userId 为空，跳过签到任务\n`);
      continue;
    }

    // 领取签到任务
    await userCheckList();

    // 每日签到
    await sign();
  }
}

// 每日签到
async function sign() {
  let msg = '';

  // 构造请求
  let opt = `https://member.mowgz.com/json/getData?appName=IAppUser&funcName=userCheck&data=%7B%22user_id%22%3A%22${$.user_id}%22%2C%22com_id%22%3A%2210018%22%2C%22check_id%22%3A%22%22%2C%22isCheckAuth%22%3Atrue%7D`;

  // 发起请求
  const result = await Request(opt);
  if (result?.status === '1') {
    msg = `🎉签到成功, ${result.error}\n`;
  } else if (result?.status === '0') {
    msg = `❌签到失败, ${result.error}\n`;
  } else {
    msg = `❌每日签到任务失败\n`;
  }
  $.messages.push(msg) && $.log(msg);
}

// 查询信息
async function userCenter() {
  let msg = '';

  // 构造请求
  let opt = `https://member.mowgz.com/bus/getFunc?busId=Member&methodId=getMember&getPram=gold%2Clevel&compId=10018&userId=${$.user_id}`;

  // 发起请求
  const result = await Request(opt);
  if (result?.errcode === 0 && result?.data?.lvInfo) {
    const { nickname, mobile, gold, lvInfo } = result.data;
    var user = hideSensitiveData(mobile, 3, 4) || $.user_id;
    msg = `账号: ${user}  昵称: ${nickname}\n积分: ${gold}  等级: ${lvInfo['lv_now']['name']}`;
  } else {
    msg = `账号: ${$.user_id}\n❌会员信息查询失败\n`;
    $.user_id = null;
    $.log($.toStr(result));
  }
  $.messages.push(msg) && $.log(msg);
}

// 领取签到任务
async function userCheckList() {
  // 构造请求
  let opt = `https://member.mowgz.com/json/getData?appName=IAppUser&funcName=userCheckList&data=%7B%22user_id%22%3A%22${$.user_id}%22%2C%22com_id%22%3A%2210018%22%7D`;

  // 发起请求
  const result = await Request(opt);
  if (result?.list_data?.length > 0) {
    $.log(`✅签到任务领取成功\n`);
  } else {
    $.log(`❌签到任务领取失败\n`);
    $.user_id = null;
  }
}

// 获取小程序数据
function getUserId() {
  try {
    // 检查变量
    checkEnv();
    if ($request.url.indexOf("methodId=getMember") > -1) {
      debug($request.url);
      // 从 $request.url 提取 userId
      $.user_id = $request.url.match(/userId=([\w]+)/)?.[1];
      $.log(`获取到 userId: ${$.user_id}`);
      if (!$.userList.includes($.user_id)) {
        $.userList.push($.user_id);
        // 把获取到的数据写入代理缓存
        $.setdata($.toStr($.userList), '@hch.userid');
        $.msg($.name, ``, `用户 userId 获取成功。 🎉`);
      }
    }
  } catch (err) {
    $.logErr(err);
  }
}

if (typeof $request !== `undefined`) {
  // 获取用户数据
  getUserId();
  $.done();
} else {
  // 脚本执行入口
  !(async () => {
    await main();  // 主函数
  })()
    .catch((e) => $.messages.push(e.message || e) && $.logErr(e))
    .finally(async () => {
      await sendMsg($.messages.join('\n'));  // 推送通知
      $.done();
    })
}

// 检查变量
function checkEnv() {
  // 把字符串转换为数组
  try {
    $.userList = JSON.parse($.userList);
  } catch (e) {
    $.userList = [];
  }
  if ($.userList.length) {
    $.log(`\n检测到 ${$.userList.length} 个账号变量\n`);
  } else {
    $.log(`\n找不到 userId, 请检查变量配置。❌\n`);
  }
}

/**
 * 数据脱敏
 * @param {string} string - 传入字符串
 * @param {number} head_length - 前缀展示字符数，默认为 2
 * @param {number} foot_length - 后缀展示字符数，默认为 2
 * @returns {string} - 返回字符串
 */
function hideSensitiveData(string, head_length = 2, foot_length = 2) {
  try {
    let star = '';
    for (var i = 0; i < string.length - head_length - foot_length; i++) {
      star += '*';
    }
    return string.substring(0, head_length) + star + string.substring(string.length - foot_length);
  } catch (e) {
    return string;
  }
}

/**
 * 请求函数二次封装
 * @param {(object|string)} options - 构造请求内容，可传入对象或 Url *
 * @param {string} method - 请求方式 get / post 等，默认自动判断
 * @param {boolean} onlyBody 仅返回 body 内容，默认为 true
 * @returns {(object|string)} 自动根据内容返回 JSON 对象或字符串
 */
async function Request(options, method, onlyBody = true) {
  try {
    options = options.url ? options : { url: options };
    method = method || ('body' in options ? method = 'post' : method = 'get');
    const _timeout = options?.timeout || 15e3;
    const _http = [
      new Promise((_, reject) => setTimeout(() => reject(new Error(`❌ 请求超时： ${options['url']}`)), _timeout)),
      new Promise((resolve, reject) => {
        debug(options, '[Request]');
        $.http[method.toLowerCase()](options)
          .then((response) => {
            debug(response, '[Response]');
            let res = onlyBody ? response.body : response;
            res = $.toObj(res) || res;
            resolve(res);
          })
          .catch((err) => reject(new Error(err)));
      })
    ];
    return await Promise.race(_http);
  } catch (err) {
    $.logErr(err);
  }
}

// 发送消息
async function sendMsg(message) {
  if (!message) return;
  message = message.replace(/\n+$/, '');  // 清除末尾换行
  try {
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
  } catch (e) {
    $.log(`\n\n----- ${$.name} -----\n${message}`);
  }
}

/**
 * DEBUG
 * @param {*} content - 传入内容
 * @param {*} title - 标题
 */
function debug(content, title = "debug") {
  let start = `\n----- ${title} -----\n`;
  let end = `\n----- ${$.time('HH:mm:ss')} -----\n`;
  if ($.is_debug === 'true') {
    if (typeof content == "string") {
      $.log(start + content + end);
    } else if (typeof content == "object") {
      $.log(start + $.toStr(content) + end);
    }
  }
}

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }

