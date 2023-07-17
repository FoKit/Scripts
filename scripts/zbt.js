/*
脚本名称：找不同8000关+
脚本说明：修改体力和道具数量为99999
使用方法：上传存档 -> 下载存档

[rewrite_local]
^https:\/\/api\.gzgame99\.cn\/zc\/user\/setGameData url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/zbt.js
^https:\/\/api\.gzgame99\.cn\/zc\/user\/getGameData url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/zbt.js

[MITM]
hostname = api.gzgame99.cn
*/


let str = '';

if ($request.url.indexOf("setGameData") > -1) {
  str = $request.body;
  console.log('上传存档');
} else if ($request.url.indexOf("getGameData") > -1) {
  str = $response.body;
  console.log('下载存档');
}

if (str) {
  let str2 = str.replace(/"curStrength":\d+,/g, `"curStrength":99999,`).replace(/"1":\d+,/g, `"1":99999,`);
  if (str != str2) {
    console.log('修改成功');
  } else {
    console.log('修改失败')
  }

  $done({ body: str2 });
} else {
  console.log('空数据');
  $done({});
}
