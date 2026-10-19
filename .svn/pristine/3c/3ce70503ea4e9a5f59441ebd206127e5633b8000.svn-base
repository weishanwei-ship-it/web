<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { Step, Steps,Card,Select,SelectOption,Space,Input,Col,Button,FormItem,Row,Checkbox,Tabs,TabPane } from 'ant-design-vue';
import { ref } from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { VbenFormProps } from '#/adapter/form';
import { SelectFT,SelectFT1,SelectFT2 } from '#/api';
const data = ref();
const datacontent = ref<any>();

const form = ref({

});
const activeKey = ref('1');
// 弹窗配置
const [Modal, modalApi] = useVbenModal({
  title: '设计计算',
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      
      datacontent.value = data.value.content;
      
      form.value = {...datacontent.value};
       //Object.assign(form.value, datacontent.value);
    }
  },
  
});
interface RowType {
  id: number;
  编码:string;
  阀型:string;
  规格:string;
  状态:string;
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: '计算内容', title: '计算内容' , },
    { field: '符号', title: '符号' ,  },
    { field: '公式', title: '公式',  },
    { field: '索引', title: '索引',  },
    { field: '单位', title: '单位',  },
    { editRender: { name: 'input' }, field: '标准参数', title: '标准参数',  },
    { field: '临时版本1', title: '临时版本1',  },
  ],
    keepSource: true,
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
   pagerConfig: {
    enabled: false, // 关闭分页
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        //const response =  await SelectFT();
        let response;
        if (activeKey.value === '1') {
          response = await SelectFT();
        } else if (activeKey.value === '2') {
          response = await SelectFT2();
        } else if (activeKey.value === '3')  {
          response = await SelectFT1();
        }
        else{
                    response = await SelectFT();
        }
        // ✅ 正确取值：从 response.data.list 拿数组
        const list = response.data?.list || [];
        // ✅ 正确取值：从 response.data.total 拿总数
        const total = response.data?.total || 0;
        const tableData = {
            items: list, 
            total: total 
        };

        return tableData;
      },
    },
  },
  showOverflow: false,
};
// 必须暴露给父组件调用
defineExpose({
  modalApi,
});
function handleTabChange() {
  console.log(activeKey);
  gridApi.reload();
}
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <Modal title="试算">
     <div class="w-full p-4">
    <Card title="产品设计计算书" :bordered="false">
      <!-- 顶部信息表格 -->
      <table class="w-full border-collapse border border-gray-300 text-sm">
        <tbody>
        <tr>
          <td class="border border-gray-300 p-2 text-center font-bold" rowspan="2" style="width: 180px;">
            产品设计计算书
          </td>
          <td class="border border-gray-300 p-2 text-center font-bold">产品名称</td>
          <td class="border border-gray-300 p-2 text-center font-bold">产品规格</td>
        </tr>
        <tr>
          <td class="border border-gray-300 p-2 text-center">直通球阀</td>
          <td class="border border-gray-300 p-2 text-center">R1-DN300×dn300 1500Lb</td>
        </tr>
        </tbody>
      </table>

      <!-- 章节1：阀体壁厚校核 -->
      <table class="w-full border-collapse border border-gray-300 text-sm mt-2">
        <tbody>
        <tr>
          <td class="border border-gray-300 p-2 text-center font-bold" style="width: 60px;">一</td>
          <td class="border border-gray-300 p-2 font-bold">阀体壁厚校核</td>
        </tr>
        </tbody>
      </table>

      <!-- 章节2：结构简图 -->
      <table class="w-full border-collapse border border-gray-300 text-sm mt-2">
        <tbody>
        <tr>
          <td class="border border-gray-300 p-2 text-center font-bold" style="width: 100px;">结构简图</td>
          <td class="border border-gray-300 p-2">
            <!-- 图片区域 -->
            <div class="border border-gray-300 p-2 bg-gray-50 min-h-[300px] flex items-center justify-center">
                <img src="/images/V3D_D2060050000005.png"  alt="结构简图" class="max-w-full max-h-[300px] object-contain mx-auto" />

            </div>
          </td>
        </tr>
        </tbody>
      </table>


      <Tabs v-model:activeKey="activeKey" type="card"  @change="handleTabChange" class="text-sm mt-2">
        <TabPane key="1" tab="产品信息">
          <Grid />
            
        </TabPane>
        <TabPane key="2" tab="产品管理">
          <Grid />
        </TabPane>
        <TabPane key="3" tab="阀体壁厚计算">
          <Grid />
        </TabPane>
      </Tabs>


    </Card>
  </div>
  <template #prepend-footer>
    <!-- 关键：mr-auto !important 强制推到最左边 -->
    <div class="flex items-center gap-2 mr-auto !important">
      <label>请确认启用版本：</label>
      <Select style="width: 300px">
        <SelectOption value="临时版本1">临时版本1</SelectOption>
      </Select>
      <Button type="primary">确认</Button>
    </div>
  </template>
  </Modal>
</template>



<style scoped>
table {
  border-collapse: collapse;
}
td, th {
  border: 1px solid #d1d5db;
}
</style>
