/*
脚本名称：找不同8000关+
脚本说明：修改体力和道具数量为99999
使用方法：上传存档 -> 下载存档

[rewrite_local]
^https://api\.gzgame99\.cn/zc/user/setGameData url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/zbt.js

[MITM]
hostname = api.gzgame99.cn
*/

$done({ body: $request.body.replace(/"curStrength":\d+,/g, `"curStrength":99999`).replace(/"1":\d+/g, `"curStrength":99999`) });
