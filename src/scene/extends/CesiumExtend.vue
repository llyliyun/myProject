<script>
  import $ from 'jquery';
  (function(){
    var n = 0,maxN = 9;
    let activeSpeet = 1000,time;
    let extend = function(V){
      /**
       * 重新entities的removeAll方法，支持选择性的清除
       *
       */
      let viewer = V;
      (Cesium)&&(Cesium.STATE = new Object());
      Viewer.entities.constructor.prototype.removeAll = function(){
        if(time&&new Date().getTime()-time<activeSpeet)return;
        time = new Date().getTime();
        let entities = this.values;
        if(entities&&entities.length){
          for(var i=entities.length-1;i>=0;i--){
            if(!entities[i].notClear){
              if(entities[i].remove){
                entities[i].remove();
              }else{
                let id = entities[i]._id;
                try{this.removeById(id);}catch(e){};
              };
            }
          }
        }
      };
      Cesium.clearDatasourceBy = function(key,value){
        try{
          let tempObjs = Viewer.dataSources._dataSources.filter(temp=>temp[key]==value);
          if(tempObjs&&tempObjs.length){
            tempObjs.forEach(n=>{if(Viewer.dataSources.remove)try{Viewer.dataSources.remove(n);}catch(e){}});
          }
        }catch(e){};
      }
      /*****绘制动态流动墙体******/
      Cesium.drawWall = function(positions,materialImage,viewer) {
        var alp = 1;
        var num = 0;
        viewer = viewer||V;
        materialImage = materialImage||'';
        //绘制墙
        var wyoming = viewer.entities.add({
          name: "动态立体墙",
          id:'my-wall',
          wall:{
            show:true,
            positions:Cesium.Cartesian3.fromDegreesArrayHeights(positions),
            material: new Cesium.ImageMaterialProperty({
              image:materialImage,
              transparent:true,
              color:new Cesium.CallbackProperty(function () {
                if ((num % 2) === 0){
                  alp -=0.01;
                }else {
                  alp +=0.01;
                }
                if (alp <= 0.3){
                  num++;
                }else if (alp >= 1){
                  num++;
                }
                return  Cesium.Color.WHITE.withAlpha(alp)
              },false)
            })
          }
        });
        //viewer.zoomTo(wyoming);//相机到entity的位置
      };
      /********叠加geojson数据到场景***********/
      Cesium.superpositionGeoJsonData = function(datas,options){
        let that = this;
        if(!datas)return;
        let getExecStrs = function(str){
          var reg = /\$\{(.+?)\}/g
          var list = []
          var result = null
          do {
            result = reg.exec(str)
            result && list.push({"0":result[0],"1":result[1]})
          } while (result)
          return list
        };
        let exeCodeStrs = function(str){
          var list = [];
          let temps = str.split("##");
          if(temps.length>2){
            temps.forEach((n,i)=>{
              if((i+1)%2==0){
                let result = '';
                try{result = eval("(function(){return "+n+"})()")}catch(e){};
                str = str.replace("\"##"+n+"##\"",JSON.stringify(result));
              };
            });
          };
          return str
        };
        let getResFileStrs = function(str){
          var reg = /\.\#\{(.+?)\}/g
          var list = []
          var result = null
          do {
            result = reg.exec(str)
            result && list.push({"0":result[0],"1":result[1]})
          } while (result)
          return list
        };
        options = options||{};
        let optionsStr = JSON.stringify(options);
        let tempObjs = Viewer.dataSources._dataSources.filter(temp=>temp['name']==options.name);
        if(tempObjs&&tempObjs.length){
          tempObjs.forEach(n=>{if(Viewer.dataSources.remove)try{Viewer.dataSources.remove(n);}catch(e){}});
        }
        let promise = Cesium.GeoJsonDataSource.load(datas,Object.assign({clampToGround:true,name:"defaultName"},options));
        promise.then(async function(dataSource) {
          dataSource.name = options.name||"";
          (Viewer)&&(Viewer.dataSources.add(dataSource));
          let entities = dataSource.entities.values;
          let temp2 = getResFileStrs(optionsStr);
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i],tempOptionsStr=optionsStr;
            let properties = entity.properties;
            //加载异步文件
            if(optionsStr.indexOf(".#{")!=-1){
              temp2.forEach(n=>{
                try{
                  $.ajax({
                    url:n[1],
                    dataType:"text",
                    async: false,
                    success:function(res){
                      res = res.replace(/\"/g,"'");
                      res = res.replace(/[\r\n]/g,"");
                      let HTMLEncode = function(html) {
                        var temp = document.createElement("div");
                        (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
                        var output = temp.innerHTML;
                        temp = null;
                        return output;
                      };
                      tempOptionsStr = tempOptionsStr.replace(n[0],HTMLEncode(res.trim()));
                    }
                  });
                }catch(e){}
              });
            }
            let temp = getExecStrs(tempOptionsStr);
            //替换字段值
            if(tempOptionsStr.indexOf("${")!=-1){
              temp.forEach(n=>{
                var tr = "\\"+(n[0].split('').join("\\"));
                var r = RegExp(tr,"gm");
                tempOptionsStr = properties[n[1]]?tempOptionsStr.replace(n[0],properties[n[1]]._value):tempOptionsStr;
              });
            }
            tempOptionsStr = exeCodeStrs(tempOptionsStr);
            options = Object.assign(options,JSON.parse(tempOptionsStr.trim()));
            if(!Cesium.defined(entity.position)&&Cesium.defined(entity.polygon)){
              var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
              var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
              polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
              entity.position = polyCenter;
            };
            for(var n in options){
              try{
                if(n=="billboard"&&options[n]&&options[n].template){
                  let resKey = n;
                  entity.show = false;
                  let image = new Image();
                  image.entity = entity;
                  let HTMLDecode = function(text) {
                    var temp = document.createElement("div");
                    temp.innerHTML = text;
                    var output = temp.innerText || temp.textContent;
                    temp = null;
                    return output;
                  }
                  let res = HTMLDecode(options[n].template);
                  let loadImage = function(url,image) {
                    return new Promise(function(resolve, reject) {
                      image.src = url;
                      image.crossOrigin = 'Anonymous';
                      image.onload = function() {
                        resolve(this);
                      };
                      image.onerror = function(err) {
                        reject(err);
                      };
                    });
                  }
                  loadImage('data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(res.trim()))),image).then(img=>{
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var context = canvas.getContext("2d");
                    // 2.根据base64格式的svg生成canvas
                    context.drawImage(img, 0, 0);
                    var base64 = canvas.toDataURL('image/webp',1);
                    let image2 = new Image();
                    image2.src = base64;
                    options[resKey].width = img.width;
                    options[resKey].height = img.height;
                    options[resKey].image =  options[resKey].image&&typeof options[resKey].image=='function'?options[resKey].image(image2,entity,V):image2;
                    let tempBillboard = new Cesium.BillboardGraphics(options[resKey]);
                    img.entity[resKey] = tempBillboard;
                    img.entity.show = true;
                  });
                };
                entity[n] = Object.assign((entity[n]||{}),options[n]);
                if(options.callBack&&typeof options.callBack=="function")options.callBack(entity);
              }catch(e){
                console.log(e);
              };
            };
            //添加支杆效果
            if(Cesium.defined(entity.position)&&!Cesium.defined(entity.polyline)&&options.showPointLine){
              var ellipsoid=Viewer.scene.globe.ellipsoid;
              var cartographic=ellipsoid.cartesianToCartographic(entity.position._value);
              var lat = Cesium.Math.toDegrees(cartographic.latitude);
              var lng = Cesium.Math.toDegrees(cartographic.longitude);
              var alt=cartographic.height;
              entity.position = Cesium.Cartesian3.fromDegrees( lng,lat,options.height||alt);
              entity.polyline = {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([lng, lat,1.102,lng,lat,(options.height||0)]),
                width: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                  color: Cesium.Color.WHITE
                })
              };
            };
          };
        });
      };
      (function(_v){
        if(!_v)return;
        if(!Cesium)return;
        Cesium.defaultCursor = Cesium.clone(_v._element.style.cursor);
        function createTooltip(frameDiv){
          let _this=this;
          let tooltip = function(frameDiv) {
            var div = document.createElement('DIV');
            div.className = "twipsy right";
            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);
            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);
            this._div = div;
            this._title = title;
            this.message = '';
            frameDiv.appendChild(div);
            var that = this;
            div.onmousemove = function(evt){
              that.showAt({x : evt.clientX,y : evt.clientY},that.message);
            };
          };
          tooltip.prototype.setVisible = function(visible) {
            this._div.style.display = visible ? 'block' : 'none';
          };
          tooltip.prototype.showAt = function(position, message) {
            if(position && message) {
              this.setVisible(true);
              this._title.innerHTML = message;
              var left =position.x+ 10+"px";
              //if(_this.isShowMult)
              // left= position.x + 10+Viewer.canvas.clientWidth + "px";
              this._div.style.left =left;
              this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
              this.message = message;
            }
          };
          let tooltipTemp = new tooltip(frameDiv);
          return tooltipTemp;
        };
        let tooltipShowAt = function(windowPosition,contentStr){
          if(!Cesium.tooltip){Cesium.tooltip = Cesium.tooltip||createTooltip(document.body);};
          Cesium.tooltip.showAt(windowPosition,contentStr);
        };
        let tooltipMove = function(windowPosition,tipMeg){

          windowPosition.x = windowPosition.endPosition.x;
          windowPosition.y = windowPosition.endPosition.y;
          if(windowPosition.x < 210 && windowPosition.y < 120){
            if(Cesium.tooltip&&Cesium.tooltip.setVisible)Cesium.tooltip.setVisible(false);
            return ;
          }
          tooltipShowAt(windowPosition,tipMeg);
        };
        let cancelDraw = function(){
          try{Cesium.userScreenSpaceEvent.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);}catch(e){};
          try{Cesium.userScreenSpaceEvent.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE );}catch(e){};
          if(Cesium.tooltip&&Cesium.tooltip.setVisible)Cesium.tooltip.setVisible(false);
          try{Cesium.STATE.ISDRAWING = false;}catch(e){};
          //try{(Cesium.USERHANDEL&&Cesium.USERHANDEL.clear)&&(Cesium.USERHANDEL.clear());}catch(e){};
          try{(Cesium.USERHANDEL&&Cesium.USERHANDEL.cancel)&&(Cesium.USERHANDEL.cancel())}catch(e){};
          //try{(Cesium.USERHANDEL&&Cesium.USERHANDEL.deactivate)&&(Cesium.USERHANDEL.deactivate());Cesium.USERHANDEL = null;}catch(e){};
          Viewer.enableCursorStyle = true;
          Viewer._element.style.cursor = Cesium.defaultCursor||'';
          Cesium.TIPSTR = '';
        };
        _v.scene.postRender.addEventListener(function(){
          if(Cesium.STATE&&Cesium.STATE.ISDRAWING){
            Cesium.userScreenSpaceEvent = Cesium.userScreenSpaceEvent||new Cesium.ScreenSpaceEventHandler(_v.scene.canvas);
            if(Cesium.TIPSTR){
              Cesium.tooltip = Cesium.tooltip||createTooltip(document.body);
              Cesium.userScreenSpaceEvent.setInputAction(function(e){tooltipMove(e,Cesium.TIPSTR)},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }else{
              try{Cesium.tooltip.setVisible(false);}catch(e){};
            }
            Cesium.userScreenSpaceEvent.setInputAction(cancelDraw,Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            _v.enableCursorStyle = false;
            _v._element.style.cursor = "crosshair";
          }else{
            cancelDraw();
          }
        });
      })(viewer)
    };
    window.reExtender = setInterval(function(){
      if(n>=maxN||window.Viewer){
        try{window.clearInterval(window.reExtender);window.reExtender.remove();}catch(e){};
        if(window.Viewer&&window.Viewer instanceof Cesium.Viewer)extend(window.Viewer);
      };n++;
    },1000);
  })();
  export default{};
</script>
