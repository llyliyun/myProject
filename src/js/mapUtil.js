const MAPRADIUS = 6371000; //默认地球半径

const convertMeterToRealLength = (meter, CRS) => {
	//平面坐标系无获取单位方法
	if (!CRS.projection.getUnits || CRS.projection.getUnits() == 'meter') {
		return meter;
	} else {
		//米转度
		return meter / (Math.PI * 2 * MAPRADIUS / 360);
	}
}

const getLayerSubdomains = (item) => {
  if (!item || !item.url) {
    return item;
  }
  item.options = item.options || {};
  if (item.url.indexOf('geoesb/proxy') > -1 && APPCONFIG.MuleSubdomains && APPCONFIG.MuleSubdomains.length) {
    let originDomin = item.url.split(/\//)[2];
    item.urlTemplate = item.url.replace(originDomin, '{s}');
    item.url = item.url.replace(originDomin, APPCONFIG.MuleSubdomains[0]);
    item.options.subdomains = APPCONFIG.MuleSubdomains;
  }
  return item;
}

const unitTran = (num, unitValue, limit) =>{
  let parseNum = 0
  switch(unitValue){
    case '亩':parseNum = num/666.6666667
      break;
    case '公顷':parseNum = num/10000
      break;
    case '万亩':parseNum = num/6666666.667
      break;
    case '千米':parseNum = num/1000
      break;
    case '英里':parseNum = num/1609.344
      break;
    default:parseNum = num
  }
  return parseFloat(parseNum.toFixed(limit || 2))
}

function loadScript(urls) {
  return Promise.all(urls.map(url => new Promise((resolve, reject) => {
    const parent = document.head || document.body || document.documentElement;
    let script = null;
    if(url.endsWith('css')){
      script = document.createElement('link');
      script.href = url;
      script.rel = "stylesheet"
    } else if(url.endsWith('js')){
      script = document.createElement('script');
      script.async = true;
      script.src = url;
    }
    const loadend = () => {
      script.onerror = null;
      script.onload = null;
    };
    script.onerror = () => {
      const err = new Error(`Failed to load script: ${url}`);
      err.url = url;
      loadend();
      reject(err);
    };
    script.onload = () => {
      loadend();
      resolve(url);
    };
    parent.appendChild(script);
  })));
}
export {
  convertMeterToRealLength,
  getLayerSubdomains,
  unitTran,
  loadScript
}
