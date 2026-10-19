<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
const data = ref();

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    console.info('onConfirm');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
    }
  },
});

</script>
<template>
  <Modal title="图纸可视化">
    <!-- 图片：自适应全屏显示 -->
    <div class="w-full h-full flex items-center justify-center overflow-auto">
      <img 
        src="/images/V3D_D2060050000005.png" 
        alt="图纸" 
        class="max-w-full max-h-[70vh] object-contain"
      >
    </div>
  </Modal>
</template>

<style scoped>
/* 弹窗内容铺满 */
:deep(.vben-modal-content) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.vben-modal-body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}
</style>

