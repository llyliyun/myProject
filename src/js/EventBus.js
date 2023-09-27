// units/bus.js
const install = Vue => {
  const Bus = new Vue({
    methods: {
      on(event, ...args) {
        this.$on(event, ...args);
      },
      emit(event, callback) {
        this.$emit(event, callback);
      },
      off(event, callback) {
        this.$off(event, callback);
      }
    }
  });
  window.EventBus = Bus;
};
export default install;
