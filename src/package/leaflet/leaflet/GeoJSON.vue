<template>

</template>

<script>
    //import L from 'leaflet'
    import mixin from './../mixins/mixin'

    const events = [
        'layeradd',
        'layerremove',
        'add',
        'remove',
        'popupopen',
        'popupclose',
        'tooltipopen',
        'tooltipclose',
        'bindTooltip',
        'openTooltip',
        'mouseover',
        'mouseout'
    ]

    const props = {
        pointToLayer: {
            type: Function
        },
        /*style: {
            type: Function
        },*/
        onEachFeature: {
            type: Function
        },
        filter: {
            type: Function
        },
        coordsToLatLng: {
            type: Function
        },
        options: {
            type: Object
        },
        keepInView: {
            type: Boolean,
            default: false
        },
        popFunction: {
            type: Function
        }
    }

    export default {
        name: 'LGeojson',
        mixins: [mixin],
        props: {
            ...props,
            data: {
                type: [Object, Array],
                // required: true
            },
        },
        mounted() {
            let geojsonOptions = this. mixinPropOption(this._props, props);

           // this.leaflet = L.GeoJSON(this.data, geojsonOptions);

            this.leaflet = L.geoJSON(this.data,geojsonOptions)

            this.addEventHook(this.leaflet, events);

            if (this.$parent._isMounted) {
                this._initHooks(this.$parent.leaflet);
            }
        },
        watch: {
            data: {
                handler(val, oldVal) {
                    this.leaflet.clearLayers();
                    this.leaflet.addData(val);
                    if (this.keepInView) {
                        this.leaflet._map.fitBounds(this.leaflet.getBounds());
                    }
                }
            },
        },
        methods: {
            _initHooks(parent) {
                if (this.popFunction) {
                    this.leaflet.bindPopup(this.popFunction, {
                        minWidth: '400'
                    });
                }
                this.leaflet.addTo(parent);
                
            },
        }
    }
</script>
