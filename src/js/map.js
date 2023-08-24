 /**
 * 地图
 */

import { tileUrl, tileUrlImage } from '../config/config.js'
import Msg from './msg.js'
import { vuexStore, CHANGE_MAP_TILE_TYPE } from './vuexStore.js'
import { movePopupWindow } from './movePopupWindow.js'
import { refreshVillageMarkers } from './marker.js'

let deviceLayer = L.layerGroup();

let tileLayer = new L.supermap.tiledMapLayer(tileUrl);

let tileLayerImage = new L.supermap.tiledMapLayer(tileUrlImage);

let centerLatLng = L.latLng(31.81593418, 117.22300529);

let mapBounds = L.latLngBounds(L.latLng(29.5, 115.0), L.latLng(33.5, 120.0));

let map = new L.Map('map', {
    crs: L.CRS.EPSG4326,
    center: centerLatLng,
    zoom: 12,
    minZoom: 8,
    maxZoom: 18,
    maxBounds: mapBounds,
    layers: [tileLayer],
    attributionControl: false,
    doubleClickZoom: false,
    zoomControl: false
});

map.addLayer(deviceLayer); //设备图层

L.control.scale().addTo(map); //比例尺

//显示经纬度和地图层级
map.addEventListener("mousemove", function (e) {
    showMousePosition(e);
    showMapZoom();
});
map.addEventListener("zoomend", function (e) {
    showMapZoom();
});

//信息弹框位置
map.addEventListener("zoom", function (e) {
    movePopupWindow(map);
});
map.addEventListener("move", function (e) {
    movePopupWindow(map);
});

map.addEventListener("moveend", function (e) {
    refreshVillageMarkers();
});

//复制经纬度
$('#map').on('keydown', function (e) {
    if (e.ctrlKey && e.key == 'c') {
        copyMousePosition();
        Msg.show('经纬度已复制到剪贴板');
    }
});

let mousePositionDiv;
function showMousePosition(e) {
    if (!mousePositionDiv) {
        mousePositionDiv = $('#mouseposition');
    }
    mousePositionDiv.text(e.latlng.lng.toFixed(8) + ", " + e.latlng.lat.toFixed(8));
}

let mapZoomDiv;
function showMapZoom() {
    if (!mapZoomDiv) {
        mapZoomDiv = $('#mapzoom');
    }
    mapZoomDiv.text(map.getZoom().toString());
}

/**
 * 复制经纬度
 */
function copyMousePosition() {
    let str = $("#mouseposition").text();
    navigator.clipboard.writeText(str); //复制到剪贴板
}

/**
 * 底图切换
 */
function switchMap(type) {
    if (type == 1) {
        tileLayerImage.remove();
        map.addLayer(tileLayer);
    }
    if (type == 2) {
        tileLayer.remove();
        map.addLayer(tileLayerImage);
    }
    vuexStore.commit(CHANGE_MAP_TILE_TYPE, type);
}

window.switchMap = switchMap; //用于C#调用js代码

export { map, deviceLayer, switchMap }
