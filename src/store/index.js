import Vue from 'vue'
import Vuex from 'vuex'
import map from './modules/map'
import scene from './modules/scene'


Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    map,
    scene,
  },
  strict: debug,
})