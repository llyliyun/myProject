<template>
</template>
<script>
  export default {
    created() {
      EventBus.$on('printScene', this.printScene);
    },
    beforeDestroy(){
      EventBus.$off('printScene', this.printScene);
    },
    methods: {
      printScene(){
        let self = this
        let promise = Viewer.scene.outputSceneToFile()
        Cesium.when(promise, async (buffer) => {
          self.printing(buffer)
        })
      },
      printing(img) {
        let self = this
        let printWindow = window.open("")
        let strHeader = '<!DOCTYPE html><html lang="zh" dir="ltr"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/><meta name="viewport" content="initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=no"><title>场景打印</title></head>'
        let strScript = '<script type="text/javascript">'+ '\n' +'function printDiv(){var newuiPrint = document.getElementsByClassName("newuiPrint")[0];newuiPrint.style.display = "none";window.print();newuiPrint.style.display = "block";}<\/script>'
        let strBody = '<body><div class="print-header"><div id="superft"><div class="printClose"><input type="button" class="newuiPrint" onclick="printDiv()" value="打印"></div></div></div><img id="printMap" /></body></html>'
        let strHTML = strHeader + strScript + strBody
        printWindow.document.write(strHTML)
        // printWindow.document.getElementById("printMap").style.background = 'url('+ img +')'
        printWindow.document.getElementById("printMap").src = img
        printWindow.document.close();
      }
    }
  }
</script>