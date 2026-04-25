/**
 * 脚本名称：Geocaching 助手
 * 活动说明：用于修正 Geocaching 的 GPS 坐标、翻译 log / describe
 * 脚本说明：配置重写和百度翻译 appid 和 API Key 即可使用。
 * 百度翻译：百度翻译开放平台 https://fanyi-api.baidu.com/
 * BoxJs ：https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
 * 仓库地址：https://github.com/FoKit/Scripts
 * 更新日志：2023-11-26 初版，支持修正坐标和翻译功能
 *          2023-12-27 修复单个 cache 详情页 GPS 坐标偏移问题
 *          2023-12-29 支持解锁 Premium 会员
 *          2024-01-06 通知添加 difficulty 和 terrain
 *          2024-02-27 增加翻译和坐标转换开关
 *          2025-02-16 兼容 v2 版本 logs 翻译请求
 *          2026-03-19 优先使用 userCorrectedCoordinates 坐标
 *          2026-04-06 升级百度大模型翻译接口
 *          2026-04-11 解锁 D2/T2.5 缓存APP访问权限
 *          2026-04-12 支持从 web 页面获取 cache 信息
 *          2026-04-13 新增翻译保持功能（Boxjs 配置）
 *          2026-04-21 增加 Adventure Lab 翻译功能
 *          2026-04-26 增加 Adventure Lab 坐标转换
/*
--------------- BoxJS & 重写模块 --------------

https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/geocaching_helper.sgmodule

------------------ Surge 配置 -----------------

[MITM]
hostname = %APPEND% api.groundspeak.com

[Script]
Geocaching cache = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/geocaches\/GC[A-Z0-9]{5}(?:\/(geocachelogs|userwaypoints|additionalwaypoints))?(?:\?.*)?$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Geocaching map = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/map\/search\?adventuresTake,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Geocaching unlock = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/profileview,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
Adventure Lab = type=http-response,pattern=^https:\/\/api\.groundspeak\.com\/adventuresmobile\/v\d\/public\/adventures\/[a-zA-Z0-9-]+,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
------------------ Loon 配置 ------------------

[MITM]
hostname = api.groundspeak.com

[Script]
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/geocaches\/GC[A-Z0-9]{5}(?:\/(geocachelogs|userwaypoints|additionalwaypoints))?(?:\?.*)?$ tag=Geocaching cache, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/map\/search\?adventuresTake tag=Geocaching map, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/profileview tag=Geocaching unlock, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1
http-response ^https:\/\/api\.groundspeak\.com\/adventuresmobile\/v\d\/public\/adventures\/[a-zA-Z0-9-]+ tag=Adventure Lab, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js,requires-body=1

-------------- Quantumult X 配置 --------------

[MITM]
hostname = api.groundspeak.com

[rewrite_local]
^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/geocaches\/GC[A-Z0-9]{5}(?:\/(geocachelogs|userwaypoints|additionalwaypoints))?(?:\?.*)?$ url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/map\/search\?adventuresTake url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/profileview url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/map\/search\?adventuresTake url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
^https:\/\/api\.groundspeak\.com\/adventuresmobile\/v\d\/public\/adventures\/[a-zA-Z0-9-]+ url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js

------------------ Stash 配置 -----------------

http:
  mitm:
    - "api.groundspeak.com"
  script:
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/geocaches\/GC[A-Z0-9]{5}(?:\/(geocachelogs|userwaypoints|additionalwaypoints))?(?:\?.*)?$
      name: Geocaching cache
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/map\/search\?adventuresTake
      name: Geocaching map
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/mobile\/v\d\/profileview
      name: Geocaching unlock
      type: response
      require-body: true
    - match: ^https:\/\/api\.groundspeak\.com\/adventuresmobile\/v\d\/public\/adventures\/[a-zA-Z0-9-]+
      name: Adventure Lab
      type: response
      require-body: true

script-providers:
  Geocaching helper:
    url: https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/geocaching_helper.js
    interval: 86400

*/

const $ = new Env('Geocaching helper');
const appid = $.getdata('BaiDu_APP_ID') || '';  // 百度翻译 appid
const apiKey = $.getdata('BaiDu_API_KEY') || '';  // 百度翻译 API Key
const translateFrom = $.getdata('BAIDU_TRANSLATE_FROM_KEY') || 'en';  // 原始语言
const translateTo = $.getdata('BAIDU_TRANSLATE_TO_KEY') || 'zh';  // 目标语言
const geocaching_translate = $.getdata('geocaching_translate') || 'false';  // Geocaching 翻译
const geocaching_gps_fix = $.getdata('geocaching_gps_fix') || 'true';  // 坐标转换
let body = JSON.parse($response.body);
var GPS = gps_convert();
$.notifyMsg = [];  // 为通知准备的空数组
$.cache = $.getjson('geocaching_temp', {}); // 读取持久化数据 (object格式)
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';

!(async () => {
  if (!$request) throw new Error('❌ 非 cron 类脚本，不支持手动运行');
  if (/map\/search\?adventuresTake/.test($request.url)) {
    let gps_convert_num = 0;
    // 坐标转换
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    $.log("🔁 开始转换坐标");
    // 遍历 geocaches 转换坐标
    body.geocaches.forEach(item => {
      // 获取用户校正的坐标
      const { userCorrectedCoordinates } = item.callerSpecific ?? {};
      if (userCorrectedCoordinates) {
        item.callerSpecific.userCorrectedCoordinates = convertCoordinates(userCorrectedCoordinates);
      }
      // 转换 postedCoordinates
      item.postedCoordinates = convertCoordinates(item.postedCoordinates);
      gps_convert_num += 1;  // 坐标转换数量 +1

      // 判断 difficulty 和 terrain 等级以写入缓存
      if (item?.difficulty >= 2.0 || item?.terrain >= 2.5) {
        $.cache[item.referenceCode] = item;
      }
    });
    $.log(`✅ 坐标转换完成, 修正定位 ${gps_convert_num} 个`);
    $.setjson($.cache, 'geocaching_temp'); // 写入新的缓存信息
  } else if (/geocaches\/GC[A-Z0-9]{5}\/geocachelogs/.test($request.url)) {
    // 翻译 logs
    if (body?.statusCode != 403) {
      await translate_logs();
      // 读取缓存并发送通知
      const { name, hints, difficulty, terrain } = $.cache[body.data[0].geocache.referenceCode];
      $.msg(`${name} (${body.data[0].geocache.referenceCode})`, `难度: D${difficulty}  |  地形: T${terrain}`, `提示: ${hints}`);
    } else {
      $.log($.toStr(body));
    }
  } else if (/\/mobile\/v\d\/profileview/.test($request.url)) {
    // 解锁 Premium
    const membershipTypeId = $.getdata('Geo_membershipTypeId') || '';
    if (membershipTypeId) {
      body['profile']['membershipTypeId'] = parseInt(membershipTypeId);
      $.log(`🔓 MembershipTypeId modify to [${membershipTypeId}].`);
    }
  } else if (/geocaches\/GC[A-Z0-9]{5}$/.test($request.url) && body?.name) {
    // 翻译 cache
    await translate_cache();
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    // 获取用户校正的坐标
    const { userCorrectedCoordinates } = body.callerSpecific ?? {};
    if (userCorrectedCoordinates) {
      body.callerSpecific.userCorrectedCoordinates = convertCoordinates(userCorrectedCoordinates);
    }
    // 转换 postedCoordinates
    body.postedCoordinates = convertCoordinates(body.postedCoordinates);
    $.log("✅ 坐标转换完成");
  } else if (/geocaches\/GC[A-Z0-9]{5}$/.test($request.url) && $response.statusCode == "403") {
    // 构造 cache body
    $.log(`🔧 开始构造 body`);
    const gc_code = /geocaches\/(\w{7})/.exec($request.url)?.[1];
    const { hints, longDescription } = await get_cache_info('https://www.geocaching.com/geocache/' + gc_code);  // 从 web 页面获取 hints & longDescription
    const { referenceCode, name, difficulty, terrain, ianaTimezoneId, favoritePoints, trackableCount, placedDate, owner, dateLastVisited, typeId, containerTypeId, state, postedCoordinates } = $.cache[gc_code];
    debug($.cache[gc_code], '读取缓存')
    body = {
      referenceCode,
      name,
      difficulty,
      terrain,
      ianaTimezoneId,
      "hints": hints || "未知",
      favoritePoints,
      trackableCount,
      placedDate,
      "placedBy": owner.username,
      dateLastVisited,
      "publishDate": placedDate,
      "longDescription": longDescription || "Happy Geocaching!",
      "attributes": [{ "id": 13, "name": "Available 24/7", "isApplicable": true }],
      "type": { "id": typeId },
      "containerType": { "id": containerTypeId },
      "callerSpecific": { "favorited": false, "isUnlocked": true },
      "owner": {
        "code": owner.referenceCode,
        "userName": owner.username,
        "avatarUrl": "",
        "guid": ""
      },
      state,
      postedCoordinates,
      "hasSolutionChecker": false
    }
    $.log(`✅ body 构造完成`);

    // 翻译 cache
    await translate_cache();

  } else if (/geocaches\/GC[A-Z0-9]{5}\/(userwaypoints|additionalwaypoints)/.test($request.url)) {
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    // 转换 userwaypoints/additionalwaypoints 坐标
    if (body?.data && Array.isArray(body.data)) {
      body.data.forEach(item => {
        if (item?.coordinates) {
          item.coordinates = convertCoordinates(item.coordinates);
        }
      });
      $.log("✅ 坐标转换完成");
    }
  } else if (/adventures\/search$/.test($request.url)) {
    let gps_convert_num = 0;
    // Adventure Lab 坐标转换
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    $.log("🔁 开始转换坐标");
    // 遍历 adventures 转换坐标
    body.items.forEach(item => {
      // 转换 location
      item.location = convertCoordinates(item.location);
      gps_convert_num += 1;  // 坐标转换数量 +1
    });
    $.log(`✅ 坐标转换完成, 修正定位 ${gps_convert_num} 个`);
  } else if (/adventures\/[a-zA-Z0-9-]+$/.test($request.url)) {
    // 翻译 Adventure Lab 详情
    await translate_adventures();
    if (geocaching_gps_fix == 'false') throw new Error('⚠️ 未启用转换坐标功能');
    // 转换 location
    body.location = convertCoordinates(body.location);
    // 转换 location for each stage
    body.stageSummaries.forEach(item => {
      if (item.location) {
        item.location = convertCoordinates(item.location);
      }
    });
    $.log("✅ 坐标转换完成");
  } else if (/adventures\/[a-zA-Z0-9-]+\/reviews/.test($request.url)) {
    // 翻译 Adventure Lab reviews
    await translate_logs();
  } else {
    var openUrl = 'https://www.geocaching.com/geocache/' + /geocaches\/(\w{7})/.exec($request.url)?.[1];
    $.msg(`点击跳转到浏览器打开`, ``, openUrl, { $open: openUrl });
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
    debug(body, "body");
    $.done({ status: 'HTTP/1.1 200', body: JSON.stringify(body) });
  })


// 翻译 logs
async function translate_logs() {
  try {
    if (geocaching_translate === 'false' || !appid || !apiKey) throw new Error('⚠️ 未配置翻译功能, 跳过翻译');
    const isItemsMode = !!body?.items;
    const logs = body?.data || body?.items;

    const textField = isItemsMode ? 'reviewText' : 'text';
    $.log(`\n🌏 翻译 logs (共 ${logs.length} 条)`);

    // 批量翻译
    const combinedText = logs.map(item => item[textField]).join("\n\n=====\n\n");
    const translatedCombined = await translateApi(combinedText);

    // 分割译文
    const translatedArr = translatedCombined.split(/\n*=====\n*/).filter(Boolean);

    // 译文数量不匹配时直接返回
    if (translatedArr.length !== logs.length) {
      $.log(`⚠️ 译文数量不匹配: [${logs.length}/${translatedArr.length}]`);
      return;
    }

    $.log(`✅ 译文解析成功`);

    // 批量更新
    const target = isItemsMode ? body.items : body.data;
    translatedArr.forEach((t, i) => {
      const original = logs[i][textField];
      if (t !== original) {
        target[i][textField] = `${t}\n--------------------------------------------------\n${original}`;
      }
    });

  } catch (e) {
    $.log(`❌ 翻译异常: ${e}`);
  }
}

// 翻译 cache
async function translate_cache() {
  try {
    if (geocaching_translate === 'false' || !appid || !apiKey) throw new Error('⚠️ 未配置翻译功能, 跳过翻译');
    $.log("🌏 翻译 cache");
    let { name, hints, longDescription, difficulty, terrain, referenceCode } = body;
    const skipLongDesc = longDescription.length > 2000; // 超过 2000 字符不翻译
    // 拼接所有要翻译的内容
    const combinedText = [name, hints, skipLongDesc ? "" : longDescription].join("\n\n=====\n\n");
    // 调用翻译接口
    const translatedCombined = await translateApi(combinedText);
    // 拆分 3 段译文
    const translatedArr = translatedCombined.split(/=====/g)
      .map(s => s.trim())
      .filter(s => s);
    // 解析并赋值
    if (translatedArr.length >= 2) {
      let _name = translatedArr[0];
      let _hints = translatedArr[1];
      let _longDescription = translatedArr[2] || '';
      if (_name !== name) body.name = _name + ` · ` + name;
      if (_hints !== hints) body.hints = _hints + `\n--------------------------\n` + hints;
      if (!skipLongDesc && _longDescription !== longDescription) {
        body.longDescription = _longDescription + `\n--------------------------------------------------\r\n ` + longDescription;
      } else {
        $.log(`⚠️ longDescription 过长, 跳过翻译`);
      }
      $.log("✅ cache 翻译完成");
    }
    // 把 cache 的信息缓存下来，用作通知调用
    if (!$.cache[referenceCode]) $.cache[referenceCode] = {};
    $.cache[referenceCode].name = body.name;
    $.cache[referenceCode].hints = body.hints.split("\n")[0] || hints;
    $.cache[referenceCode].difficulty = difficulty;
    $.cache[referenceCode].terrain = terrain;
    $.setjson($.cache, 'geocaching_temp');
  } catch (e) {
    $.log(`❌ cache 翻译异常: ${e}`);
  }
}

// 翻译 adventures
async function translate_adventures() {
  try {
    if (geocaching_translate === 'false' || !appid || !apiKey) throw new Error('⚠️ 未配置翻译功能, 跳过翻译');
    $.log("🌏 翻译 adventures");
    let { title, description, stageSummaries } = body;

    // 翻译 title 和 description
    const [newTitle, newDesc] = (await translateApi([title, description].join("\n\n=====\n\n"))).split(/=====/g).map(s => s.trim()).filter(Boolean);
    if (newTitle && newTitle !== title) body.title = newTitle + ` · ` + title;
    if (newDesc && newDesc !== description) body.description = newDesc + `\n--------------------------\n` + description;
    $.log("✅ adventures 翻译完成");

    // 批量翻译 stages
    if (stageSummaries?.length) {
      // 构造翻译列表
      const items = stageSummaries.flatMap((stage, idx) => [
        { text: stage.title, path: [idx, 'title'] },
        { text: stage.description, path: [idx, 'description'] },
        { text: stage.question, path: [idx, 'question'] },
        ...(stage.multiChoiceOptions?.map((opt, optIdx) => ({ text: opt.text, path: [idx, 'multiChoice', optIdx] })) || [])
      ]);

      // 批量翻译
      const translated = (await translateApi(items.map(i => i.text).join("\n\n=====\n\n"))).split(/=====/g).map(s => s.trim()).filter(Boolean);

      // 解析并赋值
      translated.forEach((t, i) => {
        if (t && t !== items[i].text) {
          const [idx, field, optIdx] = items[i].path;
          if (field === 'multiChoice') {
            stageSummaries[idx].multiChoiceOptions[optIdx].text = t + `\n--------------------------\n` + items[i].text;
          } else {
            stageSummaries[idx][field] = t + `\n--------------------------\n` + items[i].text;
          }
        }
      });

      $.log(`✅ stages 翻译完成`);
    }
  } catch (e) {
    $.log(`❌ adventures 翻译异常: ${e}`);
  }
}

// 百度大模型文本翻译 API
async function translateApi(query) {
  try {
    let tags = ['FTF', 'TFTC', 'DNF', 'FP', 'Nano', 'GZ', 'CO', 'EO', 'CITO', 'log', 'logs'];
    const geo_tags = $.getdata('geo_tags') || '';  // 从缓存中读取需要打自定义标签的内容
    tags.push(...geo_tags.split(",")
      .map(i => i.trim().toLowerCase())  // 把所有标签都转为小写
      .filter(Boolean));
    tags = [...new Set(tags)];  // tags 去重避免标签嵌套问题
    for (let tag of tags) {
      if (!tag) continue;
      query = query.replace(new RegExp("[ \t]*\\b" + tag + "\\b[ \t]*", "gi"), "<geo>$&</geo>");
    }
    // debug(query, 'query');
    const opt = {
      url: `https://fanyi-api.baidu.com/ait/api/aiTextTranslate`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        q: query,
        from: translateFrom,
        to: translateTo,
        appid,
        model_type: 'nmt', // 翻译模型, 'llm'-大模型翻译（默认值），'nmt'-机器翻译
        tag_handling: 1, // 标签保持
        ignore_tags: ['geo']  // 自定义标签
      }),
      timeout: 10000
    };

    return new Promise((resolve) => {
      $.post(opt, (err, resp, data) => {
        if (err) {
          $.notifyMsg.push(`❌ 翻译请求失败: ${$.toStr(err)}`);
          return resolve(null);
        }
        const resObj = JSON.parse(data.replace(/\\u003c\/?geo\\u003e|<\/?geo>/gi, ''));  // 去除 geo 标签
        if (!resObj.trans_result) {
          $.log(`⚠️ 未获取到翻译结果: ${$.toStr(resObj)}`);
          $.notifyMsg.push(`❌ 翻译失败: ${resObj?.error_msg}`);
          return resolve(null);
        }
        // 过滤空结果，避免一堆空行干扰分割
        const validList = resObj.trans_result.filter(item => item.dst?.trim());
        const translatedText = validList.map(item => item.dst).join('\n');
        resolve(translatedText || null);
      });
    });
  } catch (e) {
    $.notifyMsg.push(`❌ 翻译异常: ${$.toStr(e)}`);
    resolve(null);
  }
}

// 从 web 页面获取 cache 信息
async function get_cache_info(url) {
  const opt = {
    url,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      "Cookie": ``
    },
    timeout: 15000
  };

  return new Promise((resolve) => {
    $.get(opt, (err, resp, data) => {
      try {
        if (data) {
          // 提取描述
          const longDesc = data.match(/<span[^>]+id="ctl00_ContentBody_LongDescription"[^>]*>([\s\S]*?)<\/span>/i)[0] || '';
          // 提取 hint 内容
          const encryptedHint = data.match(/id="div_hint"[^>]*>([\s\S]*?)<\/div>/i)?.[1].trim() || '';
          // 解密 hint
          const decryptedHint = rot13(encryptedHint);
          resolve({
            hints: decryptedHint,
            longDescription: longDesc
          });
        }
      } catch (e) {
        $.log(`❌ 接口请求失败: ${e}`);
        resolve(null);
      }
    });
  });
}

// ROT13 Hints 解密
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode(
      c.charCodeAt(0) + (c.toUpperCase() <= 'M' ? 13 : -13)
    );
  });
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

// GPS 坐标转换 WGS-84 -> GCJ-02
function convertCoordinates(coord) {
  const result = GPS.gcj_encrypt(coord.latitude, coord.longitude);
  debug(`🔁 ${coord.latitude}, ${coord.longitude} --> ${result.lat}, ${result.lon}`);
  return {
    latitude: result.lat,
    longitude: result.lon
  };
}

/** 坐标转换器
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
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; "POST" === e && (s = this.post); const i = new Promise(((e, i) => { s.call(this, t, ((t, s, o) => { t ? i(t) : e(s) })) })); return t.timeout ? ((t, e = 1e3) => Promise.race([t, new Promise(((t, s) => { setTimeout((() => { s(new Error("请求超时")) }), e) }))]))(i, t.timeout) : i } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.logLevels = { debug: 0, info: 1, warn: 2, error: 3 }, this.logLevelPrefixs = { debug: "[DEBUG] ", info: "[INFO] ", warn: "[WARN] ", error: "[ERROR] " }, this.logLevel = "info", this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null, ...s) { try { return JSON.stringify(t, ...s) } catch { return e } } getjson(t, e) { let s = e; if (this.getdata(t)) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e => { this.get({ url: t }, ((t, s, i) => e(i))) })) } runScript(t, e) { return new Promise((s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = e && e.timeout ? e.timeout : o; const [r, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": r, Accept: "*/*" }, policy: "DIRECT", timeout: o }; this.post(n, ((t, e, i) => s(i))) })).catch((t => this.logErr(t))) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), o = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return s; return o } lodash_set(t, e, s) { return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}), t)[e[e.length - 1]] = s), t } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), o = s ? this.getval(s) : ""; if (o) try { const t = JSON.parse(o); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e), r = this.getval(i), a = i ? "null" === r ? null : r || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, o, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const r = {}; this.lodash_set(r, o, t), s = this.setval(JSON.stringify(r), i) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.cookie && void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } })).then((t => { const { statusCode: i, statusCode: o, headers: r, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: i, response: o } = t; e(i, o, o && s.decode(o.rawBody, this.encoding)) })); break } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let i = require("iconv-lite"); this.initGotEnv(t); const { url: o, ...r } = t; this.got[s](o, r).then((t => { const { statusCode: s, statusCode: o, headers: r, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: s, response: o } = t; e(s, o, o && i.decode(o.rawBody, this.encoding)) })); break } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let i = t[s]; null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", i = "", o = {}) { const r = t => { const { $open: e, $copy: s, $media: i, $mediaMime: o } = t; switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { const r = {}; let a = t.openUrl || t.url || t["open-url"] || e; a && Object.assign(r, { action: "open-url", url: a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; if (n && Object.assign(r, { action: "clipboard", text: n }), i) { let t, e, s; if (i.startsWith("http")) t = i; else if (i.startsWith("data:")) { const [t] = i.split(";"), [, o] = i.split(","); e = o, s = t.replace("data:", "") } else { e = i, s = (t => { const e = { JVBERi0: "application/pdf", R0lGODdh: "image/gif", R0lGODlh: "image/gif", iVBORw0KGgo: "image/png", "/9j/": "image/jpg" }; for (var s in e) if (0 === t.indexOf(s)) return e[s]; return null })(i) } Object.assign(r, { "media-url": t, "media-base64": e, "media-base64-mime": o ?? s }) } return Object.assign(r, { "auto-dismiss": t["auto-dismiss"], sound: t.sound }), r } case "Loon": { const s = {}; let o = t.openUrl || t.url || t["open-url"] || e; o && Object.assign(s, { openUrl: o }); let r = t.mediaUrl || t["media-url"]; return i?.startsWith("http") && (r = i), r && Object.assign(s, { mediaUrl: r }), console.log(JSON.stringify(s)), s } case "Quantumult X": { const o = {}; let r = t["open-url"] || t.url || t.openUrl || e; r && Object.assign(o, { "open-url": r }); let a = t["media-url"] || t.mediaUrl; i?.startsWith("http") && (a = i), a && Object.assign(o, { "media-url": a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; return n && Object.assign(o, { "update-pasteboard": n }), console.log(JSON.stringify(o)), o } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, i, r(o)); break; case "Quantumult X": $notify(e, s, i, r(o)); break; case "Node.js": break }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } debug(...t) { this.logLevels[this.logLevel] <= this.logLevels.debug && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.debug}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } info(...t) { this.logLevels[this.logLevel] <= this.logLevels.info && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.info}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } warn(...t) { this.logLevels[this.logLevel] <= this.logLevels.warn && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.warn}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } error(...t) { this.logLevels[this.logLevel] <= this.logLevels.error && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.error}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.map((t => t ?? String(t))).join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, e, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, e, void 0 !== t.message ? t.message : t, t.stack); break } } wait(t) { return new Promise((e => setTimeout(e, t))) } done(t = {}) { const e = ((new Date).getTime() - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
