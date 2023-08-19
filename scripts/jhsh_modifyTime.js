let time = '';
let json = JSON.parse($response.body);

if (json?.data?.SYSTEM_TIME) {
  if (json?.data?.MSPS_ENTITY?.EFFECT_PERIOD_START) {
    time = json.data.MSPS_ENTITY.EFFECT_PERIOD_START.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5:$6');
  } else if (json?.data?.ACT_START_DTM) {
    time = json.data.ACT_START_DTM;
  } else if (json?.data?.KHHK_ENTITY?.DcCp_Avy_StTm) {
    time = json?.data?.SYSTEM_TIME.replace(/(\d{2}):(\d{2}):(\d{2})$/, json.data.KHHK_ENTITY.DcCp_Avy_StTm.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1:$2:$3'));
  }

  if (time) {
    if (Date.now() < Date.parse(time)) {
      json['data']['SYSTEM_TIME'] = time;
    }
    console.log(`SYSTEM_TIME: ${json['data']['SYSTEM_TIME']}`);
  }
} else {
  console.log($response.body);
}

$done({ body: JSON.stringify(json) });
