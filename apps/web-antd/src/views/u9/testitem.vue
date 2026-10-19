<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Button } from 'ant-design-vue';
import { SelectJYX } from '#/api';
import { ref } from 'vue';
interface RowType {
  id: number;
  工序号: string;
  工序名称: string;
  工序编码: string;
  检验项类型: string;
  检验项描述: string;
  检验项编码: string;
  检验内容公称值: number;
  上限值: number;
  下限值: number;
  单位: string;
  实测值: string;
  判定结果: string;
  作业员: string;
}

// 表单配置
const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入物料编码',
      },
      fieldName: 'code',
      label: '物料编码',
    },
  ],
  showCollapseButton: false,
  submitOnChange: false,
  submitOnEnter: false,

  submitButtonOptions: {
    content: '查询焊接',
  },
};
// 表格配置
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: '工序号', title: '工序号' },
    { field: '工序名称', title: '工序名称' },
    { field: '工序编码', title: '工序编码' },
    { field: '检验项类型', title: '检验项类型' },
    { field: '检验项描述', title: '检验项描述' },
    { field: '检验项编码', title: '检验项编码' },
    { field: '检验内容公称值', title: '检验内容公称值' },
    { field: '上限值', title: '上限值' },
    { field: '下限值', title: '下限值' },
    { field: '单位', title: '单位' },
    { field: '实测值', title: '实测值' },
    { field: '判定结果', title: '判定结果' },
    { field: '作业员', title: '作业员' },
  ],
  keepSource: true,
  editConfig: { mode: 'row', trigger: 'click' },
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const code = formValues.code;
        const currentType = queryType.value;
        queryType.value = 1;
        const response = await SelectJYX(code, currentType);
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        const total = response.data.total;
        return { items: list, total };
      },
    },
  },
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
// 按钮方法
const queryType = ref(1);
//查询热处理
const handleSelectRCL = () => {
  queryType.value = 2;
  gridApi.reload();
};
//查询PT
const handleSelectPT = () => {
  queryType.value = 3;
  gridApi.reload();
};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #submit-before>
        <Button class="primary" type="primary" @click="handleSelectRCL">
          查询热处理
        </Button>
        <Button class="primary" type="primary" @click="handleSelectPT">
          查询PT
        </Button>
      </template>
    </Grid>
  </div>
</template>
