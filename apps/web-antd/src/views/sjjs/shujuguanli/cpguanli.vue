<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { Selectcpguanli } from '#/api';
import { useVbenModal, VbenButton } from '@vben/common-ui';

interface RowType {
  id: number;
  型号: string;
  名称: string;
  DN: string;
  PN: string;
}
const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入型号',
      },
      fieldName: 'code',
      label: '型号',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { editRender: { name: 'input' }, field: '型号', title: '型号' },
    { editRender: { name: 'input' }, field: '名称', title: '名称' },
    { editRender: { name: 'input' }, field: 'DN', title: 'DN' },
    { editRender: { name: 'input' }, field: 'PN', title: 'PN' },
    { slots: { default: 'action' }, fixed: 'right', title: '操作' },
  ],
  keepSource: true,
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100, 500],
    total: 0,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const response = await Selectcpguanli({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });

        // ✅ 正确取值：从 response.data.list 拿数组
        const list = response.data?.list || [];
        // ✅ 正确取值：从 response.data.total 拿总数
        const total = response.data?.total || 0;
        const tableData = {
          items: list,
          total: total,
        };

        return tableData;
      },
    },
  },
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function hasEditStatus(row: RowType) {
  return gridApi.grid?.isEditByRow(row);
}

function editRowEvent(row: RowType) {
  gridApi.grid?.setEditRow(row);
}

async function saveRowEvent(row: RowType) {
  await gridApi.grid?.clearEdit();

  gridApi.setLoading(true);
  //setTimeout(() => {

  // message.success({
  //   content: `保存成功！category=${row.category}`,
  // });
  // const roleId = Number(row.id);
  // const response = await UpdateU9ZJ({
  //    ...row
  // });
  // //console.log("response =====>" + response);
  // if(response.data.code == 0){
  //   message.success({
  //     content: `修改成功！`,
  //   });
  // }
  // else{
  //   message.error({
  //     content: `修改失败：${response.data.error}`,
  //   });
  // }
  gridApi.setLoading(false);
  //}, 600);
}

const cancelRowEvent = (_row: RowType) => {
  gridApi.grid?.clearEdit();
};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-tools>
        <VbenButton class="mr-2" @click="">新增</VbenButton>
        <VbenButton class="mr-2" @click="">导出Excel</VbenButton>
      </template>
      <template #action="{ row }">
        <template v-if="hasEditStatus(row)">
          <Button type="link" @click="saveRowEvent(row)">保存</Button>
          <Button type="link" @click="cancelRowEvent(row)">取消</Button>
        </template>
        <template v-else>
          <Button type="link" @click="editRowEvent(row)">编辑</Button>
          <Button type="link" @click="">删除</Button>
        </template>
      </template>
    </Grid>
  </div>
</template>
