/**
 * flash回调----街景视口方位变换后的回调
 * @param {*} loadedId 街景id
 * @param {*} tmpPan 
 * @param {*} tmpTilt 
 * @param {*} tmpfov 
 * @param {*} latitude 纬度
 * @param {*} longitude 经度
 * @param {*} direction 方位角
 */
function viewChanged(loadedId, tmpPan, tmpTilt, tmpfov, latitude, longitude, direction) {
  let _pan = (360 - tmpPan - direction + 90) % 360
  if (_pan < 0) _pan += 360;
  EventBus.$emit("MiniViewChanged", _pan)
}

/**
 * flash回调----街景位置变换后的回调
 * @param {*} id 街景id
 * @param {*} latitude 纬度
 * @param {*} longitude 经度
 * @param {*} direction 方位角
 */
function panoChanged(id, latitude, longitude, direction) {
  EventBus.$emit("MiniPanoChanged", { lat: latitude, lng: longitude })
}