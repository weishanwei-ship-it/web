<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { Button, message, Upload } from 'ant-design-vue';
import {GetExcelTemplate,downloadFile,ImportTemplate } from '#/api';
import { ref } from 'vue';
import type { UploadFile } from 'ant-design-vue/es/upload/interface';
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


// 下载导入模板（可选）
const downloadTemplate = async () => {
  try {
    console.log('data.value.content ========>',data.value.content);
    const res = await GetExcelTemplate(data.value.content);
    const filePath = typeof res === 'object' && res.data ? res.data : res;
    console.log("filePath ===============>",filePath);
    downloadFile(filePath);
    message.success('模板下载成功');
  } catch (err) {
    message.error('模板下载失败，请重试');
  }
};

// 文件上传前处理
const handleBeforeUpload = async (file:any) => {
  // 1. Excel格式校验
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    message.error('请上传Excel文件（.xlsx/.xls）');
    return false;
  }

  // 2. 文件大小限制（5MB）
  const isLt5M = file.size! / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('文件大小不能超过5MB');
    return false;
  }

  // 3. 调用导入接口
  try {
    //importLoading.value = true;
    const formData = new FormData();
    formData.append('file',file);
    const response = await ImportTemplate(formData);

    if (response.data.code === 0) {
      message.success(`导入成功！共导入${response.data?.total || 0}条数据`);
      //importModalOpen.value = false;
    } else {
      message.error(`导入失败：${response.data.msg || '服务器错误'}`);
    }
  } catch (err) {
    console.error('导入失败：', err);
    message.error('导入失败，请联系管理员');
  } finally {
    //importLoading.value = false;
  }

  return false;
};
</script>
<template>
    <Modal title="数据导入">
      <Upload
        class="upload-demo"
        :before-upload="handleBeforeUpload"
        :show-upload-list="false"
        accept=".xlsx,.xls"
      >
        <Button type="primary" >选择Excel文件</Button>
      </Upload>
      <div class="mt-4 text-gray-500 text-sm">
        <p>支持格式：.xlsx / .xls（最大5MB）</p>
        <p class="mt-1">
          <a @click="downloadTemplate" class="text-primary">点击下载导入模板</a>
        </p>
      </div>
      
    </Modal>
   <!-- <Modal title="数据共享示例">
    <div class="flex-col-center">外部传递数据： {{ data }}</div>
  </Modal>  -->
</template>

<style scoped>
.upload-demo {
  display: flex;
  justify-content: center;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-demo:hover {
  border-color: #1890ff;
}
</style>
