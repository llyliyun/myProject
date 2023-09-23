var APPCONFIG = APPCONFIG || {};
(function () {
  APPCONFIG = {
    analysisPagesize:100,
    wmts : {
      center: {
        x: 110.473274,
        y: 38.906454,
        maxZoom: 18,
        minZoom:8,
        zoom:8,
      },
      url: "https://api.map.baidu.com/api?v=1.0&type=webgl&ak=2rqn9B1yfLro9Mo6atv8dD99OHO5FCZm",//"http://t0.tianditu.gov.cn/img_c/wmts?tk=685315d34dfbdae548cd4a33dffa55c4",
      options: {
        layer: "img",
        style: "default",
        tilematrixSet: "c",
        format: "tiles",
      },
      zjurl:
        "https://api.map.baidu.com/api?v=1.0&type=webgl&ak=2rqn9B1yfLro9Mo6atv8dD99OHO5FCZm",
      //"http://t0.tianditu.gov.cn/cia_c/wmts?tk=685315d34dfbdae548cd4a33dffa55c4",
      zjoptions: {
        layer: "cia",
        style: "default",
        tilematrixSet: "c",
        format: "tiles",
      },
      resolutions: [
        1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125,
        0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125,
        0.001373291015625, 0.0006866455078125, 0.00034332275390625,
        0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125,
        0.000021457672119140625, 0.000010728836059570312,
        0.000005364418029785156, 0.000002682209014892578,
        0.000001341104507446289,
      ],
    },
    baseMapConfig:[
      {
        index: 1,
        name: "矢量",
        img: "./static/img/layimg1.png",
      },
      {
        index: 2,
        name: "影像",
        img: "./static/img/layimg2.png",
        openTime:true,
        historyLayer:[
          {
            layerName:"影像1",
            layerUrl:"",
            layerDate:'2012年2月',
          },{
            layerName:"影像2",
            layerUrl:"",
            layerDate:'2013年5月',
          },{
            layerName:"影像3",
            layerUrl:"",
            layerDate:'2014年7月',
          },
        ]
      },
      {
        index: 3,
        name: "三维",
        img: "./static/img/layimg2.png",
      },
    ],
    projectScheduleDate:[{
      yearArr:[],
      monthArr:[]
    }],
    AnalysisRestUrl:"http://192.168.46.211:8090/iserver/services/spatialAnalysis-XMXZ/restjsr/spatialanalyst",
    SpecialToolConfig:[{
      title:"控制线检测",
      name:"kzxjc",
      checkLayers:[],
      restLayer:[
        {
          url:"http://192.168.46.211:8090/iserver/services/map-XMXZ/rest/maps/xuanzhidikuai",
          name:"生态保护红线"
        },{
          url:"http://192.168.46.211:8090/iserver/services/map-XMXZ/rest/maps/xuanzhidikuai",
          name:"基本农田保护红线"
        },{
          url:"http://192.168.46.211:8090/iserver/services/map-XMXZ/rest/maps/xuanzhidikuai",
          name:"城镇开发边界",
          eraseLayer:true
        }
      ]
  },{
      title:"基本农田分析",
      name:"jbntfx",
      checkLayers:[],
      restLayer:[]
  },{
      title:"ydxzfx",
      name:"用地现状分析",
      checkLayers:[],
      restLayer:[]
  },{
      title:"zdcqfx",
      name:"征地拆迁分析",
      checkLayers:[],
      restLayer:[]
  }],
  FlyToViewer: {
    //启动场景飞行动画节点控制配置
    animation: true, //是否启用动画效果
    startView: {
      //飞行起始位置
      destination: {
        longitude: -130.06913391631326,
        latitude: -13.000652394869265,
        height: 62362314.63237358,
      },
      orientation: {
        heading: 356.3479157193852,
        pitch: -88.76538637532117,
        roll: 0,
      },
    },
    flyOPtions: [
      {
        //飞行第二节点位置信息
        time: 1,
        options: {
          //相机在WGS84世界坐标系中的最终位置,或是自顶向下视图中可见的矩形区域   Viewer.camera.position 参数值转为经纬度后的值
          destination: {
            longitude: 107.58264740073696,
            latitude: 24.302073691641343,
            height: 7544367.818510125,
          },
          //飞行时间 单位 s
          duration: 3.5,
          //包含了方位(direction)、上方向(up)以及方位角(heading)、俯仰角(pitch)、滚动角(roll)属性的对象  roll这个参数同一设为0就行
          //对应的 Viewer.camera.heading  Viewer.camera.pitch  Viewer.camera.roll 为弧度值 转为对应的角度值
          orientation: {
            heading: 356.57979148896317,
            pitch: -79.09025706569628,
            roll: 360,
          },
        },
      },
      {
        time: 1,
        options: {
          destination: {
            longitude: 110.21835524290394,
            latitude: 20.840893081722232,
            height: 3056416.3976397617,
          },
          duration: 1.5,
          orientation: {
            heading: 357.8949888241818,
            pitch: -72.51046575502038,
            roll: 6.106664988409952e-13,
          },
        },
      },
      //项目上针对自己的区域单独配置下面这个点
      {
        time: 1,
        options: {
          destination: {
            longitude: 117.14862182437557,
            latitude: 36.514012225775446,
            height: 286038.0207228119,
          },
          duration: 6,
          orientation: {
            heading: 359.5876966624758,
            pitch: -66.48597001718866,
            roll: 0,
          },
        },
      },
    ],
  },
  }
}())
