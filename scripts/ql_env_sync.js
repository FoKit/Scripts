/**
 * 脚本名称：青龙变量同步
 * 脚本说明：用于青龙多容器同步环境变量，执行后会清空本地所有JD_COOKIE变量，并获取远程容器所有JD_COOKIE变量写入本地
 * 环境变量：env_sync_ip / env_sync_id / env_sync_key / env_sync_username / env_sync_password / AUTH_CONFIG （账号密码/密钥登录方式二选一）
 * 更新时间：2023/06/27 09:54
 * 脚本作者：@Fokit_Orz
 */

const $ = new Env('青龙变量同步')
const fs = require('fs')
const got = require('got')
const path = require('path')
const api = got.extend()
const ql_host = 'http://localhost:5700'
const authConfig = process.env.AUTH_CONFIG || 'data/config/auth.json'
const authFile = path.join(path.resolve(__dirname, '/ql/'), authConfig)

const env_sync_ip = process.env.env_sync_ip
const env_sync_id = process.env.env_sync_id
const env_sync_key = process.env.env_sync_key
const env_sync_username = process.env.env_sync_username
const env_sync_password = process.env.env_sync_password

!(async () => {
  // 获取Token
  console.log(`\n获取本地Token...`)
  const ql_token = await getToken()  // 本地token
  const remote_token = await get_ql_token() // 远程token
  if (!$.api_type) console.log(`❌ 结束运行。`) && process.exit(0);

  // 获取本地变量
  console.log(`\n开始获取本地变量...`)
  const ql_cookies = await get_ql_JDCookie(ql_host, ql_token)
  console.log(`本地共有 ${ql_cookies.length} 个 JD_COOKIE 环境变量\n`)

  // 清空本地变量
  const del_arr = ql_cookies.map(cookies => cookies.id)
  if (del_arr.length > 0) {
    console.log(`开始清空本地变量...`)
    await ql_delEnv(ql_token, del_arr)
    console.log(`已清空本地环境变量\n`)
  }

  // 获取远程变量
  console.log(`开始获取远程变量...`)
  const remote_cookies = await get_ql_JDCookie(env_sync_ip, remote_token, $.api_type)
  const cookies = remote_cookies.map((item) => {
    if (item.status == 0) {  // 只获取启用变量
      return { name: "JD_COOKIE", value: item.value }
    }
  })
  const jd_cookies = cookies.filter(Boolean);  // 过滤 undefined
  console.log(`成功获取到 ${cookies.length} 个 JD_COOKIE 变量，有效 ${jd_cookies.length} 个，无效 ${cookies.length - jd_cookies.length} 个\n`)

  // 写入本地环境变量
  console.log(`开始写入环境变量...`)
  await ql_addEnv(ql_token, jd_cookies)
  console.log(`成功写入 ${jd_cookies.length} 个环境变量。`)
})().catch((e) => {
  console.log('', `❌ 失败! 原因: ${e}!`, '')
})


/**
 * 删除本地环境变量
 * @param {*} json [123, 456]
 * @returns {object}
 */
async function ql_delEnv(token, json) {
  try {
    return await api({
      method: 'DELETE',
      url: `${ql_host}/api/envs`,
      params: { t: Date.now() },
      body: JSON.stringify(json),
      headers: {
        Accept: 'application/json',
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).json()
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取环境变量
 * @param {*} searchValue
 * @returns {object}
 */
async function get_ql_JDCookie(host, token, apiType = 'api', searchValue = 'JD_COOKIE') {
  try {
    const body = await api({
      url: `${host}/${apiType}/envs`,
      searchParams: {
        searchValue,
        t: Date.now(),
      },
      headers: {
        Accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    }).json()
    return body.data
  } catch (e) {
    console.log(e)
  }
}

/**
 * 新增本地环境变量
 * @param {*} json
 * @returns {object}
 */
async function ql_addEnv(token, json) {
  try {
    return await api({
      method: 'post',
      url: `${ql_host}/api/envs`,
      params: { t: Date.now() },
      body: JSON.stringify(json),
      headers: {
        Accept: 'application/json',
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).json()
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取本地token
 * @returns {string}
 */
async function getToken() {
  const res = getFileContentByName(authFile)
  if (res) {
    const authConfig = JSON.parse(res)
    console.log(`获取成功\n`)
    return authConfig.token
  } else {
    return ''
  }
}

/**
 * 获取文件内容
 * @param fileName 文件路径
 * @returns {string}
 */
function getFileContentByName(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf8')
  }
  return ''
}

/**
 * 获取远程Token
 */
async function get_ql_token() {
  console.log(`获取远程Token...\n${env_sync_ip}`)
  if (env_sync_username && env_sync_password) {
    let response = await api({
      method: 'post',
      url: `${env_sync_ip}/api/user/login`,
      // params: { t: Date.now() },
      body: `username: ${env_sync_username}, password: ${env_sync_password}`,
      headers: {
        Accept: `application/json;charset=UTF-8`,
      },
    }).json()
    // console.log(response)
    if (response.code === 200) {
      $.api_type = 'api';
      // $.remote_token = `Bearer ${response.data.token} `;
      $.log(`登陆成功：${response.data.lastaddr} `);
      $.log(`ip:${response.data.lastip} `);
      return response.data.token
    } else {
      $.log(response);
      $.log(`登陆失败：${response.message} `);
      return ''
    }
  } else if (env_sync_id && env_sync_key) {
    let response = await api({
      method: 'get',
      url: `${env_sync_ip}/open/auth/token?client_id=${env_sync_id}&client_secret=${env_sync_key}`,
      headers: {
        Accept: `application/json;charset=UTF-8`,
      },
    }).json()
    // console.log(response)
    if (response.code === 200) {
      $.api_type = 'open';
      // $.remote_token = `Bearer ${ response.data.token } `;
      $.log(`登陆成功`);
      return response.data.token
    } else {
      $.log(response);
      $.log(`登陆失败：${response.message} `);
      return ''
    }
  }
}


// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }
