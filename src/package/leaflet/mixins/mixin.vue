<script>
  const publicPrefix = 'l-';

  export default {
    created() {
      // console.log(this, this._props);
    },
    methods: {
      //can be overrided
      _initHooks(parent) {
        this.leaflet.addTo(parent)
      },
      addEventHook(l, events) {
        events.forEach((event, index) => {
          let eventName = `${publicPrefix}${event}`;
          l.on(event, (e) => {
            this.$emit(eventName, e);
          })
        })
      },
      mixinPropOption(props, propsOption) {
        let options = Object.assign({}, props['options'] || {})
        let keys = Object.keys(props);
        for (let i = keys.length - 1; i >= 0; i--) {
          let key = keys[i];
          const mixin = propsOption[key] && key !== 'options' && props[key] && !propsOption[key]['except'];
          if (mixin) {
            options[key] = props[key];
          }
        }
        return options;
      },
      trigger(e) {
        this.$emit(`${publicPrefix}${event}`, e);
      },
      transformData(arr,keysArr){
        let _keys = []
        let _data = []
        for(let i = 0 ; i < keysArr.length;i++){
          _keys[keysArr[i].fldname] = keysArr[i].fldalias;
        }
        for(let i =0;i<arr.length;i++){
          let fea = {};
          for(let key in arr[i]){
            if(_keys[key]){
              fea[_keys[key]] = arr[i][key];
            }else{
              fea[key] = arr[i][key];
            }
          }
          _data.push(fea);
        }
        return _data
      }
    }
  }
</script>
