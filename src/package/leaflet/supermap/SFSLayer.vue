<template></template>

<script>
	// import L from 'leaflet'
  import mixin from './../mixins/mixin'
  import axios from 'axios'
  import MapPopup from '@/components/common/MapPopup'
  import Vue from 'vue'

  axios.defaults.withCredentials = true;

  const defaultIcon = L.icon({
    iconUrl:  require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  })

  const props = {
    request: {
      type: String,
      default: 'GETFEATURE'
    },
    requestType: {
      type: String,
      default: 'GET'
    },
    filter: {
      type: String,
      default: '1=1'
    },
    page: {
      type: Number,
      default: 1
    },
    rp: {
      type: Number,
      default: 10
    },
    icon: {
      type: Object,
      default:() => defaultIcon
    },
    visible:{
      type:Boolean
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    zIndex: {
      type: Number,
    }
  }

  let bounds = [];

  export default {
    name: 'LSfsLayer',
    mixins: [mixin],
    props: {
      ...props,
      url: {
        type: String,
      },
      keepInView: {
        type: Boolean,
        default: false
      }
    },
    components: {MapPopup},
    mounted() {
      if (this.$parent._isMounted && this.$parent.$parent._isMounted) {
        if(this.$parent.leaflet instanceof L.Map){
          this._initHooks(this.$parent.leaflet);
        }
        if(this.$parent.$parent.leaflet instanceof L.Map){
          this._initHooks(this.$parent.$parent.leaflet);
        }
      }
    },
    data() {
      return {
        type: ''
      }
    },
    watch: {
      page(val, oldVal) {
        this._initHooks(this.$parent.leaflet);
      },
      rp(val, oldVal) {
        this._initHooks(this.$parent.leaflet);
      },
      visible(val, newVal) {
        let parent = this.$parent.leaflet;
        if (parent) {
          if(val){
            this.leaflet.addTo(parent);
          } else {
            this.leaflet.remove();
          }
        }
      },
      options: {
        handler(val, oldVal) {
          if(this.$parent.leaflet instanceof L.Map){
            this._initHooks(this.$parent.leaflet);
          }
        },
        deep: true
      },
      zIndex(val, newVal) {
        if(this.leaflet){
          this.leaflet.setZIndex(val);
        }
      }
    },
    beforeDestroy() {
      let parent = this.$parent.$parent.leaflet;
      if (parent) {
        parent.removeLayer(this.leaflet);
        this.leaflet = null;
      }
    },
    methods: {
      async _initHooks(parent) {
        // let bounds;
        if (this.leaflet) {
          parent.removeLayer(this.leaflet);
        }
        this.leaflet = await this.fetchData();
        this.leaflet.addTo(parent);
        if (this.keepInView) {
          let bounds;
          switch (this.type) {
            case 'POINT':
              let latLngs = [];
              this.leaflet.eachLayer((layer) => {
                latLngs.push(layer.getLatLng());
              })
              bounds = L.latLngBounds(latLngs);
              break;
            case 'LINE':
            case 'REGION':
              /*this.leaflet.eachLayer((layer) => {
                layer.bindPopup(layer.options);
                bounds = bounds ? bounds.extend(layer.getBounds()) : layer.getBounds();
              })*/
              break;
          }
          //parent.fitBounds(bounds);
        }
      },
      fetchData() {
        return new Promise(async (resolve, reject) => {
          let self = this
          const options = self.mixinPropOption(self._props, props);
          const res = await axios({ type: options.requestType, url: self.url + L.Util.getParamString(options)})
          var tranOption={request:"DESCRIBEFEATURETYPE"}
          const resultKey = await axios({ type: options.requestType, url: self.url + L.Util.getParamString(tranOption)})
          let pointArr, layers;
          const data = res.data;
          if(data.dataType){
            const rows = self.transformData(data.rows,resultKey.data)
            switch(data.dataType.toUpperCase()) {
              case 'POINT':
                self.type = 'POINT';
                layers = [];
                rows.forEach((item, index) => {
                  layers.push(L.marker([item.SMY || item.SmY, item.SMX || item.SmX], {
                    icon: self.icon
                  }).bindPopup((layer) => {
                    return new Vue({
                      render(h) {
                        return ( < MapPopup objData = {item} > </MapPopup>)
                      }
                    }).$mount().$el;
                  }, {
                    minWidth: '400'
                  }));
                })
                break;
              case 'LINE':
                self.type = 'LINE';
                layers = [];
                data.rows.forEach((item1, index) => {
                  item1.points.split('|').forEach((item, index) => {
                    pointArr = [];
                    item.split(';').forEach((item, index) => {
                      pointArr.push([item.split(',')[1], item.split(',')[0]])
                    })
                    layers.push(L.polyline(pointArr).bindPopup((layer) => {
                      return new Vue({
                        render(h) {
                          return ( < MapPopup objData = {item1} > </MapPopup>)
                        }
                      }).$mount().$el;
                    }, {
                      minWidth: '400'
                    }));
                  })
                })
                break;
              case 'REGION':
                self.type = 'REGION';
                layers = [];
                data.rows.forEach((item1, index) => {
                  item1.points.split('|').forEach((item, index) => {
                    pointArr = [];
                    item.split(';').forEach((item, index) => {
                      pointArr.push([item.split(',')[1], item.split(',')[0]])
                    })
                    delete item1.center
                    delete item1.points
                    layers.push(L.polygon(pointArr).bindPopup((layer) => {
                      return new Vue({
                        render(h) {
                          return ( < MapPopup objData = {item1} > </MapPopup>)
                        }
                      }).$mount().$el;
                    }, {
                      minWidth: '400'
                    }));
                  })
                })
                break;
            }
            resolve(L.layerGroup(layers));
          }
        })
      }
    }
  }

</script>
