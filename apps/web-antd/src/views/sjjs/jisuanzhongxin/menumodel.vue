<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button,message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {GetMenuDataListPage,InsertRoleMenu} from '#/api';

interface RowType {
  //createTime: string;
  menuId: number;
  //menuName: string;
  //parentId: null | number;
  // menuUrl: number;
}
//数据实例
// const MOCK_TREE_TABLE_DATA = [
//   {
//     date: '2020-08-01',
//     id: 10_000,
//     name: 'Test1',
//     parentId: null,
//     size: 1024,
//     type: 'mp3',
//   },
//   {
//     date: '2021-04-01',
//     id: 10_050,
//     name: 'Test2',
//     parentId: 10_000,
//     size: 0,
//     type: 'mp4',
//   },
// ];

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { type: 'seq', width: 70 },
    { align: 'center', type: 'checkbox' },
    { align: 'left', title: 'ID',field: 'menuId',visible : false},
    { field: 'menuName', minWidth: 300, title: '菜单', treeNode: true },
    { field: 'menuUrl', title: '路由' },
    { field: 'createName', title: '创建人' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
  ],
  checkboxConfig: {
    checkField: 'checked', // 用数据中的字段控制选中状态
  },
  //data: MOCK_TREE_TABLE_DATA,
  pagerConfig: {
    pageSize: 100,
    pageSizes: [10, 20, 50, 100, 500],
    total: 0,
  },
  proxyConfig: {
     ajax: {
      query: async ({ page }) => {
        const response =  await GetMenuDataListPage({
          roleId:data.value.content,
          page: page.currentPage,
          pageSize: page.pageSize,
        });

        const list = Array.isArray(response.data.data) ? response.data.data : [];
        const total = response.data.total ;
        const tableData = {
            items: list, 
            total: total 
        };

        return tableData;
      },
    },
  },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'menuId',
    transform: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const expandAll = () => {
  gridApi.grid?.setAllTreeExpand(true);
};

const collapseAll = () => {
  gridApi.grid?.setAllTreeExpand(false);
};

const data = ref();
const selectedMenuIds = ref<number[]>([]);

const [Modal1, modalApi1] = useVbenModal({
  onCancel() {
    modalApi1.close();
  },
   onConfirm: async () => {
        // 1. 获取表格所有选中的行数据
    const selectedRows = gridApi.grid?.getCheckboxRecords() || [];
    
    // 2. 提取选中行的menuId，形成数组
    selectedMenuIds.value = selectedRows.map(row => row.menuId);
    gridApi.setLoading(true);
    const response = await InsertRoleMenu({
      roleId:data.value.content,
      selectedMenuIds:selectedMenuIds.value,
    });
    if(response.data.code == 0){
        message.success({
          content: `保存成功！`,
        });
      }
    else{
        message.error({
          content: `保存失败：${response.data.error}`,
        });
    }
    gridApi.setLoading(false);
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi1.getData<Record<string, any>>();
    }
  },
});
</script>
<template>
  <Modal1 title="数据共享示例">
    <!-- <div class="flex-col-center">外部传递数据： {{ data }}</div> -->
    <div class="vp-raw h-[300px] w-full">
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="expandAll">展开全部</Button>
        <Button type="primary" @click="collapseAll"> 折叠全部 </Button>
      </template>
    </Grid>
    </div>
  </Modal1>

</template>
