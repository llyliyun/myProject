var APPCONFIG = APPCONFIG || {};
(function () {
  APPCONFIG = {
    wmts : {
      center: {
        x: 110.473274,
        y: 38.906454,
        maxZoom: 18,
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
        img: layimg1,
      },
      {
        index: 2,
        name: "影像",
        img: layimg2,
        layers:[
          {
            layerName:"影像1",
            layerUrl:"",
            layerDate:'2012',
          },{
            layerName:"影像2",
            layerUrl:"",
            layerDate:'2013',
          },{
            layerName:"影像3",
            layerUrl:"",
            layerDate:'2014',
          },
        ]
      },
      {
        index: 3,
        name: "三维",
        img: layimg2,
      },
    ]
  }
}())
