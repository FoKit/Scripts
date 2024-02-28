/**
 * 脚本名称：Geocaching 助手
 * 活动说明：用于修正 Geocaching 的 GPS 坐标、翻译 log / describe
 * 脚本说明：配置重写和百度翻译 appid 和 securityKey 即可使用。
 * BoxJs ：https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
 * 仓库地址：https://github.com/FoKit/Scripts
 * 更新日期：2024-02-27 增加翻译和坐标转换开关
 * 更新日期：2024-01-06 通知添加 difficulty 和 terrain
 * 更新日期：2023-12-30 优化通知
 * 更新日期：2023-12-29 支持解锁 Premium 会员
 * 更新日期：2023-12-27 修复单个 cache 详情页 GPS 坐标偏移问题
 * 更新日期：2023-11-26 初版，支持修正坐标和翻译功能
/*
--------------- BoxJS & 重写模块 --------------

https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/geocaching_helper.sgmodule

------------------ Surge 配置 -----------------

[MITM]
hostname = api.groundspeak.com

[Script]
Geocaching logs = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}\/geocachelogs\?onlyFriendLogs=\w+&skip=\d+&take=20,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Geocaching cache = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Geocaching gps = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v1\/map\/search\?adventuresTake,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Geocaching unlock = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v1\/profileview,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js

------------------ Loon 配置 ------------------

[MITM]
hostname = api.groundspeak.com

[Script]
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}\/geocachelogs\?onlyFriendLogs=\w+&skip=\d+&take=20 tag=Geocaching logs, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}$ tag=Geocaching logs, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/map\/search\?adventuresTake tag=Geocaching cache, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/profileview tag=Geocaching unlock, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1

-------------- Quantumult X 配置 --------------

[MITM]
hostname = api.groundspeak.com

[rewrite_local]
^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}\/geocachelogs\?onlyFriendLogs=\w+&skip=\d+&take=20 url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}$ url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v1\/map\/search\?adventuresTake url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v1\/profileview url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js

------------------ Stash 配置 -----------------

http:
  mitm:
    - "api.groundspeak.com"
  script:
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}\/geocachelogs\?onlyFriendLogs=\w+&skip=\d+&take=20
      name: Geocaching logs
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/geocaches\/[A-Z0-9]{7}$
      name: Geocaching cache
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/map\/search\?adventuresTake
      name: Geocaching gps
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v1\/profileview
      name: Geocaching unlock
      type: response
      require-body: true

script-providers:
  Geocaching helper:
    url: https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
    interval: 86400

*/

const $ = new Env('Geocaching helper');
const appid = $.getdata('BaiDu_APP_ID') || '';  // 百度翻译 appid
const securityKey = $.getdata('BaiDu_SECURITY_KEY') || '';  // 百度翻译 securityKey
const translateTo = $.getdata('BAIDU_TRANSLATE_TO_KEY') || 'zh';  // 翻译后的语言
const geocaching_translate = $.getdata('geocaching_translate') || 'false';  // 百度翻译
const geocaching_gps_fix = $.getdata('geocaching_gps_fix') || 'true';  // 坐标转换
let startTime = new Date().getTime();
let success_num = 0, gps_convert_num = 0;
let obj = JSON.parse($response.body);
var GPS = gps_convert();
$.notifyMsg = [];  // 为通知准备的空数组
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';

!(async () => {
  if (!$request) throw new Error('❌ 非 cron 类脚本，不支持手动运行');
  if (/map\/search\?adventuresTake/.test($request.url)) {
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    $.log("🔁 开始转换坐标");
    // 通过 map 方法创建一个新数组，用于遍历转换坐标
    let coordinatesArr = obj.geocaches.map(item => item.postedCoordinates);
    for (let i = 0; i < coordinatesArr.length; i++) {
      // 提取经纬度变量
      let { latitude, longitude } = coordinatesArr[i];
      // GPS 坐标转换 WGS-84 -> GCJ-02
      let result = GPS.gcj_encrypt(latitude, longitude);
      debug(`🔁 ${latitude}, ${longitude} --> ${result.lat}, ${result.lon}`);
      // 转换后重新赋值到 body 对象对应的 key
      obj['geocaches'][i]['postedCoordinates']['latitude'] = result.lat;
      obj['geocaches'][i]['postedCoordinates']['longitude'] = result.lon;
      // 坐标转换数量 +1
      gps_convert_num += 1;
    }
    $.log(`✔️ 坐标转换完成, 修正定位 ${gps_convert_num} 个`);
    !gps_convert_num && $.notifyMsg.push(`❌ 修正定位失败`);
    // $.notifyMsg.push(`修正定位 ${gps_convert_num} 个, 用时 x.xx 秒 🎉`);
  } else if (/geocachelogs/.test($request.url)) {
    // 翻译 logs
    await translate_logs();

    // 读取持久化数据中的信息 push 到通知
    $.cache = $.getjson('geocaching_temp'); // 读取持久化数据 (object格式)
    if ($.cache) {
      const { name, hints, difficulty, terrain } = $.cache[obj.data[0].geocache.referenceCode];
      $.cache && $.notifyMsg.push(`地点: ${name}\n提示: ${hints} | 难度: ${difficulty} | 地形: ${terrain}`);
    }
    $.error_msg && $.notifyMsg.push(`❌ 翻译失败: ${$.error_msg}`);
    // 翻译耗时
    const costTime = (new Date().getTime() - startTime) / 1000;
    $.log(`翻译: ${success_num} 次, 用时 ${costTime} 秒 🎉`);
  } else if (/\/mobile\/v1\/profileview/.test($request.url)) {
    const membershipTypeId = $.getdata('Geo_membershipTypeId') || '';
    if (membershipTypeId) {
      obj['profile']['membershipTypeId'] = parseInt(membershipTypeId);
      $.log(`🔓 MembershipTypeId modify to [${membershipTypeId}].`);
    }
  } else {
    // 翻译 cache
    await translate_cache();
    $.error_msg && $.notifyMsg.push(`❌ 翻译失败: ${$.error_msg}`);

    // 此页面需要转换当前 cache 坐标，否则会导致定位偏移
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    $.log("🔁 开始转换坐标");
    // 提取经纬度变量
    let { latitude, longitude } = obj.postedCoordinates;
    // GPS 坐标转换 WGS-84 -> GCJ-02
    let result = GPS.gcj_encrypt(latitude, longitude);
    debug(`🔁 ${latitude}, ${longitude} --> ${result.lat}, ${result.lon}`);
    // 转换后重新赋值到 body 对象对应的 key
    obj['postedCoordinates']['latitude'] = result.lat;
    obj['postedCoordinates']['longitude'] = result.lon;
    $.log("✔️ 坐标转换完成");
  }
})()
  .catch((e) => {
    $.log(`❌ ${$.name}, 失败! 原因: ${e}!`);
  })
  .finally(() => {
    // 发送通知
    if ($.notifyMsg.length > 0) {
      $.msg($.name, '', $.notifyMsg.join('\n'));
    }
    // 返回修改后的 body
    $done({ body: JSON.stringify(obj) });
  })

// 翻译 logs
async function translate_logs() {
  let textArr = obj.data.map(item => `${item.text}`);
  // console.log(text);
  $.log(`\n🌏 翻译 logs 数量: ${textArr.length}\n`);
  for (let i = 0; i < textArr.length; i++) {
    $.log(`🌏 翻译第[${i + 1}]条`);
    let result = await translateApi(textArr[i]);
    if (result) {
      obj['data'][i]['text'] = result + `\n--------------------------------------------------\n原文:\n${obj['data'][i]['text']}`;
    }
    await $.wait(50);
  }
}

// 翻译 cache
async function translate_cache() {
  $.log("🌏 开始翻译 cache");
  let { name, hints, longDescription, difficulty, terrain, referenceCode } = obj;  // 标题, 提示, 描述, 难度, 地形, 编码
  let _name = await translateApi(name);
  if (_name) {
    obj['name'] = _name + ` · ` + name;
  }
  let _hints = await translateApi(hints);
  if (_hints) {
    obj['hints'] = _hints + `\n--------------------------\n` + hints;
  }
  let _longDescription = await translateApi(longDescription);
  if (_longDescription) {
    obj['longDescription'] = _longDescription + `\n--------------------------------------------------\r\n原文:\n ` + longDescription;
  }

  // 把 cache 的信息缓存下来，用作通知调用
  $.cache = $.getjson('geocaching_temp', {}); // 读取持久化数据 (object格式)
  $.cache[referenceCode] = {
    name: _name ?? name,
    hints: _hints ?? hints,
    difficulty,
    terrain
  }
  $.setjson($.cache, 'geocaching_temp');
}

// 翻译接口
async function translateApi(query) {
  if (geocaching_translate == 'false' || !appid || !securityKey) {
    $.log(`❌ 未配置百度翻译 appid / securityKey 或未启用, 跳过翻译。`);
    return
  }
  const salt = Date.now();
  query = query.replace(/\r\n/g, "===").replace(/\n/g, "---").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
  const queryObj = {
    q: query,
    from: "auto",
    to: translateTo,
    appid,
    salt,
    sign: MD5(appid + query + salt + securityKey),
  };
  const requestBody = Object.entries(queryObj)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  let opt = {
    url: `https://fanyi-api.baidu.com/api/trans/vip/translate`,
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: requestBody
  }
  debug(opt, "请求");
  return new Promise(resolve => {
    $.post(opt, async (err, resp, data) => {
      try {
        err && $.log(err);
        if (data) {
          debug(data, "响应");
          try {
            let result = JSON.parse(data);
            let dst = result?.trans_result?.[0]?.['dst'];
            if (dst && dst != query) {
              dst = dst.replace(/\-\-\-/g, `\n`).replace(/\=\=\=/g, `\r\n`);
              resolve(dst);
              success_num += 1;
              $.log(`🎉 翻译成功`);
            } else if (result?.error_msg) {
              $.error_msg = result.error_msg;
              $.log(`⚠️ 翻译失败: ${result.error_msg}`);
            } else {
              $.log(`⚠️ 无需翻译: ${query}`);
            }
          } catch (e) {
            $.log(e);
          };
        } else {
          console.log(`翻译接口请求失败`);
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    })
  })
}


// DEBUG
function debug(content, title = "debug") {
  let start = `\n----- ${title} -----\n`;
  let end = `\n----- ${$.time('HH:mm:ss')} -----\n`;
  if ($.is_debug === 'true') {
    if (typeof content == "string") {
      console.log(start + content + end);
    } else if (typeof content == "object") {
      console.log(start + $.toStr(content) + end);
    }
  }
}

/** GPS 坐标转换
 * WGS-84 to GCJ-02 ：gcj_encrypt(lat, lon)
 * GCJ-02 to WGS-84 ：gcj_decrypt(lat, lon)
 * GCJ-02 to WGS-84 exactly : gcj_decrypt_exact(lat, lon)
 * WGS-84 to GCJ-02 to BD-09 : bd_encrypt(lat, lon)
 * BD-09 to GCJ-02 to WGS-84 : bd_decrypt(lat, lon)
 * WGS-84 to Web mercator : mercator_encrypt(lat, lon)
 * Web mercator to WGS-84 : mercator_decrypt(lat, lon)
 * @returns {lat, lon}
 */
function gps_convert() {
  return { PI: 3.141592653589793, x_pi: 52.35987755982988, delta: function (t, a) { var n = 6378245, h = .006693421622965943, i = this.transformLat(a - 105, t - 35), s = this.transformLon(a - 105, t - 35), r = t / 180 * this.PI, o = Math.sin(r); o = 1 - h * o * o; var M = Math.sqrt(o); return { lat: i = 180 * i / (n * (1 - h) / (o * M) * this.PI), lon: s = 180 * s / (n / M * Math.cos(r) * this.PI) } }, gcj_encrypt: function (t, a) { if (this.outOfChina(t, a)) return { lat: t, lon: a }; var n = this.delta(t, a); return { lat: t + n.lat, lon: a + n.lon } }, gcj_decrypt: function (t, a) { if (this.outOfChina(t, a)) return { lat: t, lon: a }; var n = this.delta(t, a); return { lat: t - n.lat, lon: a - n.lon } }, gcj_decrypt_exact: function (t, a) { for (var n, h, i = .01, s = .01, r = t - i, o = a - s, M = t + i, e = a + s, c = 0; ;) { n = (r + M) / 2, h = (o + e) / 2; var l = this.gcj_encrypt(n, h); if (i = l.lat - t, s = l.lon - a, Math.abs(i) < 1e-9 && Math.abs(s) < 1e-9) break; if (i > 0 ? M = n : r = n, s > 0 ? e = h : o = h, ++c > 1e4) break } return { lat: n, lon: h } }, bd_encrypt: function (t, a) { var n = a, h = t, i = Math.sqrt(n * n + h * h) + 2e-5 * Math.sin(h * this.x_pi), s = Math.atan2(h, n) + 3e-6 * Math.cos(n * this.x_pi); return bdLon = i * Math.cos(s) + .0065, bdLat = i * Math.sin(s) + .006, { lat: bdLat, lon: bdLon } }, bd_decrypt: function (t, a) { var n = a - .0065, h = t - .006, i = Math.sqrt(n * n + h * h) - 2e-5 * Math.sin(h * this.x_pi), s = Math.atan2(h, n) - 3e-6 * Math.cos(n * this.x_pi), r = i * Math.cos(s); return { lat: i * Math.sin(s), lon: r } }, mercator_encrypt: function (t, a) { var n = 20037508.34 * a / 180, h = Math.log(Math.tan((90 + t) * this.PI / 360)) / (this.PI / 180); return { lat: h = 20037508.34 * h / 180, lon: n } }, mercator_decrypt: function (t, a) { var n = a / 20037508.34 * 180, h = t / 20037508.34 * 180; return { lat: h = 180 / this.PI * (2 * Math.atan(Math.exp(h * this.PI / 180)) - this.PI / 2), lon: n } }, distance: function (t, a, n, h) { var i = Math.cos(t * this.PI / 180) * Math.cos(n * this.PI / 180) * Math.cos((a - h) * this.PI / 180) + Math.sin(t * this.PI / 180) * Math.sin(n * this.PI / 180); return i > 1 && (i = 1), i < -1 && (i = -1), 6371e3 * Math.acos(i) }, outOfChina: function (t, a) { return a < 72.004 || a > 137.8347 || (t < .8293 || t > 55.8271) }, transformLat: function (t, a) { var n = 2 * t - 100 + 3 * a + .2 * a * a + .1 * t * a + .2 * Math.sqrt(Math.abs(t)); return n += 2 * (20 * Math.sin(6 * t * this.PI) + 20 * Math.sin(2 * t * this.PI)) / 3, n += 2 * (20 * Math.sin(a * this.PI) + 40 * Math.sin(a / 3 * this.PI)) / 3, n += 2 * (160 * Math.sin(a / 12 * this.PI) + 320 * Math.sin(a * this.PI / 30)) / 3 }, transformLon: function (t, a) { var n = 300 + t + 2 * a + .1 * t * t + .1 * t * a + .1 * Math.sqrt(Math.abs(t)); return n += 2 * (20 * Math.sin(6 * t * this.PI) + 20 * Math.sin(2 * t * this.PI)) / 3, n += 2 * (20 * Math.sin(t * this.PI) + 40 * Math.sin(t / 3 * this.PI)) / 3, n += 2 * (150 * Math.sin(t / 12 * this.PI) + 300 * Math.sin(t / 30 * this.PI)) / 3 } };
}

// MD5 (Message-Digest Algorithm)
function MD5(string) { function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); } function AddUnsigned(lX, lY) { var lX4, lY4, lX8, lY8, lResult; lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000); lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000); lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF); if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8); } if (lX4 | lY4) { if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); } else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8); } } else { return (lResult ^ lX8 ^ lY8); } } function F(x, y, z) { return (x & y) | ((~x) & z); } function G(x, y, z) { return (x & z) | (y & (~z)); } function H(x, y, z) { return (x ^ y ^ z); } function I(x, y, z) { return (y ^ (x | (~z))); } function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }; function ConvertToWordArray(string) { var lWordCount; var lMessageLength = string.length; var lNumberOfWords_temp1 = lMessageLength + 8; var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64; var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16; var lWordArray = Array(lNumberOfWords - 1); var lBytePosition = 0; var lByteCount = 0; while (lByteCount < lMessageLength) { lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition)); lByteCount++; } lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition); lWordArray[lNumberOfWords - 2] = lMessageLength << 3; lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29; return lWordArray; }; function WordToHex(lValue) { var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount; for (lCount = 0; lCount <= 3; lCount++) { lByte = (lValue >>> (lCount * 8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2); } return WordToHexValue; }; function Utf8Encode(string) { string = string.replace(/\r\n/g, "\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c); } else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128); } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128); } } return utftext; }; var x = Array(); var k, AA, BB, CC, DD, a, b, c, d; var S11 = 7, S12 = 12, S13 = 17, S14 = 22; var S21 = 5, S22 = 9, S23 = 14, S24 = 20; var S31 = 4, S32 = 11, S33 = 16, S34 = 23; var S41 = 6, S42 = 10, S43 = 15, S44 = 21; string = Utf8Encode(string); x = ConvertToWordArray(string); a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; for (k = 0; k < x.length; k += 16) { AA = a; BB = b; CC = c; DD = d; a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE); a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501); a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE); a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821); a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA); a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8); a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED); a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A); a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C); a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70); a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05); a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665); a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039); a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1); a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1); a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391); a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD); } var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d); return temp.toLowerCase(); }

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }
