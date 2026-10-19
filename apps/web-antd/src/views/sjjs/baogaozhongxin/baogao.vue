<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Button } from 'ant-design-vue';
import { SelectBaoGao } from '#/api';
import { ref } from 'vue';
interface RowType {
  id: number;
  文件编号: string;
  型号: string;
  日期: string;
  设计: string;
  库类型: string;
  结果: string;
}

// 表单配置
const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入型号/编码/设计人员',
      },
      fieldName: 'code',
      label: '型号',
    },
  ],
  showCollapseButton: false,
  submitOnChange: false,
  submitOnEnter: false,
};
// 表格配置
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: '文件编号', title: '文件编号' },
    { field: '型号', title: '型号' },
    { field: '日期', title: '日期' },
    { field: '设计', title: '设计' },
    { field: '库类型', title: '库类型' },
    { field: '结果', title: '结果' },
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
        const response = await SelectBaoGao({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        // ✅ 正确取值：从 response.data.list 拿数组
        const list = response.data?.list || [];
        // ✅ 正确取值：从 response.data.total 拿总数
        const total = response.data?.total || 0;
        return { items: list, total };
      },
    },
  },
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
// 按钮方法
const queryType = ref(1);
</script>

<template>
  <div class="vp-raw w-full">
    <Grid> </Grid>
  </div>
</template>
