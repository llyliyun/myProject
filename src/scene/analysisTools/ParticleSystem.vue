<script>
const snow = "./../../../../static/img/3dscene/snow.png"
const rain = "./../../../../static/img/3dscene/rain.png"
let rainSystem = null;
  export default{
    data(){
      return {
        snow:{
          ySize:1,
          image:snow,
          width: 750,
          lifetime: 40,
          particleLife: 30,
          speed: -30
        },
        rain:{
          ySize:3,
          image: rain,
          width: 80,
          lifetime: 10,
          particleLife: 5,
          speed: 1
        }
      }
    },
    methods:{
      preSetSunday(){
        if(rainSystem){
          Viewer.scene.primitives.remove(rainSystem)
        }
        Viewer.scene.globe.enableLighting = true;
      },
      preSetParticle(type,emissionRate){
        Viewer.scene.globe.enableLighting = false;
        if(rainSystem){
          Viewer.scene.primitives.remove(rainSystem)
        }
        let config = JSON.parse(JSON.stringify(this[type]))
        let scene = Viewer.scene;
        let rainParticleSize = scene.drawingBufferWidth / config.width;
        //降雨范围
        let rainRadius = 4000.0;
        let rainImageSize = new Cesium.Cartesian2(rainParticleSize, rainParticleSize * config.ySize);

        let rainGravityScratch = new Cesium.Cartesian3();
        let rainUpdate = function (particle, dt) {
            rainGravityScratch = Cesium.Cartesian3.normalize(particle.position, rainGravityScratch);
            rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(rainGravityScratch, -40, rainGravityScratch);

            particle.position = Cesium.Cartesian3.add(particle.position, rainGravityScratch, particle.position);

            let distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
            if (distance > rainRadius) {
                particle.endColor.alpha = 0.0;
            } else {
                particle.endColor.alpha = rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
            }
        };

        let options = {
          modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position),
          speed: 1.0,
          lifetime: config.lifetime,
          particleLife: config.particleLife,
          emitter: new Cesium.SphereEmitter(rainRadius),
          startScale: 1.0,
          endScale: 1.0,
          image: config.image,
          emissionRate: emissionRate,
          startColor: new Cesium.Color(1, 1, 1, 0.5),
          endColor: new Cesium.Color(1, 1, 1, 0.2),
          imageSize: rainImageSize,
          updateCallback: rainUpdate,
          performance:false
        }

        if(type == 'snow'){
          delete options.imageSize;
          delete options.particleLife;
          options.minimumImageSize = new Cesium.Cartesian2(rainParticleSize, rainParticleSize)
          options.maximumImageSize = new Cesium.Cartesian2(rainParticleSize * 5, rainParticleSize * 5)
          options.minimumParticleLife = 5
          options.maximumParticleLife = 30
          options.mass = 0.2
        }

        rainSystem = new Cesium.ParticleSystem(options);

        
        scene.primitives.add(rainSystem);
      }
    }
  };
</script>