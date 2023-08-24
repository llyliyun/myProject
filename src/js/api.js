import { request } from './loadHtml.js'
import { isEmptyString, isNotEmptyString } from './utils.js'
import Msg from './msg.js'

let villageListMap = new Map();

export async function getVillageList(keyword) {
    let encryptData = await request('data/villageListJson.txt');

    let jsonStr = CryptoJS.DES.decrypt(encryptData, CryptoJS.enc.Utf8.parse('123456'), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);

    let list = [];
    for (let item of JSON.parse(jsonStr).data) {
        if (isNotEmptyString(item.jd) && isNotEmptyString(item.wd)) {
            let villageInfo = {
                id: item.id,
                name: item.xqmc,
                address: item.xxdz,
                imgUrl: item.tp,
                noImg: isEmptyString(item.tp) ? true : false,
                lng: parseFloat(item.jd),
                lat: parseFloat(item.wd),
                state: Math.random() < 0.02 ? 1 : 0 //小区状态:0正常1异常,设置一个随机值,用于测试
            };

            if (isEmptyString(keyword)) {
                list.push(villageInfo);
            } else {
                if (isNotEmptyString(item.xqmc) && item.xqmc.indexOf(keyword) >= 0) {
                    list.push(villageInfo);
                }
            }
        }
    }
    list.push({
        id: 20220416001,
        name: '御景城2',
        address: '习友路御景城',
        imgUrl: undefined,
        noImg: true,
        lng: 117.18157589,
        lat: 31.81698805,
        state: Math.random() < 0.02 ? 1 : 0 //小区状态:0正常1异常,设置一个随机值,用于测试
    });

    if (isEmptyString(keyword)) {
        for (let item of list) {
            if (!villageListMap.has(item.id)) {
                villageListMap.set(item.id, item);
            }
        }
    }

    return list;
}

export async function getVillageDetails(id) {
    if (villageListMap.has(parseInt(id))) {
        return villageListMap.get(parseInt(id));
    } else if (villageListMap.has(id)) {
        return villageListMap.get(id);
    } else {
        Msg.show('错误：根据id找不到小区');
    }
}

export async function getDeviceList(id) {
    let rnd = Math.random();
    if (rnd < 0.33) {
        return [{
            id: 11,
            name: '设备11',
            lng: 117.18577623,
            lat: 31.82677885,
            type: 1,
            typeName: '人脸抓拍',
            state: 0
        }, {
            id: 12,
            name: '设备12',
            lng: 117.18732119,
            lat: 31.83015161,
            type: 2,
            typeName: '门禁',
            state: 0
        }, {
            id: 13,
            name: '设备13',
            lng: 117.18266487,
            lat: 31.82626837,
            type: 3,
            typeName: '车辆抓拍',
            state: 0
        }, {
            id: 14,
            name: '设备14',
            lng: 117.18276487,
            lat: 31.82626937,
            type: 3,
            typeName: '车辆抓拍',
            state: 0
        }]
    } else if (rnd < 0.66) {
        return [{
            id: 21,
            name: '设备21',
            lng: 117.19328642,
            lat: 31.82349714,
            type: 1,
            typeName: '人脸抓拍',
            state: 0
        },
        {
            id: 22,
            name: '设备22',
            lng: 117.19560385,
            lat: 31.82154628,
            type: 2,
            typeName: '门禁',
            state: 0
        }, {
            id: 23,
            name: '设备23',
            lng: 117.19528198,
            lat: 31.82748987,
            type: 3,
            typeName: '车辆抓拍',
            state: 1
        }, {
            id: 24,
            name: '设备24',
            lng: 117.19538198,
            lat: 31.82749287,
            type: 3,
            typeName: '车辆抓拍',
            state: 0
        }]
    } else if (rnd < 1) {
        return [{
            id: 31,
            name: '设备31',
            lng: 117.17487574,
            lat: 31.83104491,
            type: 1,
            typeName: '人脸抓拍',
            state: 0
        }, {
            id: 32,
            name: '设备32',
            lng: 117.17359900,
            lat: 31.83191997,
            type: 2,
            typeName: '门禁',
            state: 1
        }, {
            id: 33,
            name: '设备33',
            lng: 117.17216134,
            lat: 31.83381592,
            type: 3,
            typeName: '车辆抓拍',
            state: 0
        }, {
            id: 34,
            name: '设备34',
            lng: 117.17226134,
            lat: 31.83381692,
            type: 3,
            typeName: '车辆抓拍',
            state: 0
        }]
    }
}

export async function getDeviceDetails(id) {
    return {
        id: 11,
        name: '设备1',
        code: 'S0018245324593063946825',
        lng: 117.18577623,
        lat: 31.82677885,
        type: 1,
        typeName: '设备类型1',
        state: 0
    };
}
