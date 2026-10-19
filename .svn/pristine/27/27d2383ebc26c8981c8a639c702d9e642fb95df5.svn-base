<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';

import { InsertMenu,GetMenuDataListPage } from '#/api';

import { ref } from 'vue';


const currentMenu = ref<number>(0);

const [Form] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  scrollToFirstError: true,
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入',
      },
      // 字段名
      fieldName: 'menuname',
      // 界面显示的label
      label: '菜单名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'menuUrl',
      label: '菜单路由',
      // rules: z.string().default('默认值').optional(),
    }
  ],
  wrapperClass: 'grid-cols-1',
});

async function onSubmit(values: Record<string, any>){
  const submitData = {
    ...values, 
    parentId: currentMenu.value, 
  };
  gridApi.setLoading(true);
  const response = await InsertMenu(submitData);
  if(response.data.code == 0){
    message.success({
      content: `添加成功！`,
    });
  }
  else{
    message.error({
      content: `添加失败：${response.data.error}`,
    });
  }
  gridApi.setLoading(false);
}

interface RowType {
  //createTime: string;
  menuId: number;
  //menuName: string;
  //parentId: null | number;
  // menuUrl: number;
}

// // 数据实例
// const MOCK_TREE_TABLE_DATA = [
//   {
//     id:1,
//     date: '2020-08-01',
//     menuid: 10_000,
//     name: 'Test1',
//     parentId: null,
//     size: 1024,
//     type: 'mp3',
//   },
//   {
//     id:2,
//     date: '2021-04-01',
//     menuid: 10_050,
//     name: 'Test2',
//     parentId: 10_000,
//     size: 0,
//     type: 'mp4',
//   },
// ];

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { type: 'seq', width: 70 },
    { align: 'left', title: 'ID',field: 'menuId',visible : false},
    { field: 'menuName', minWidth: 300, title: '菜单', treeNode: true },
    { field: 'menuUrl', title: '路由' },
    { field: 'createName', title: '创建人' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    { slots: { default: 'action' }, title: '操作' },
  ],
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
          roleId:99999,//单纯不想看见红色报错
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

// async function InsertChildrenMenu(row: RowType) {
//       const menuid = Number(row.menuid);
//       const response = await InsertMenu({
//         parentId:menuid,
//       });
//       if(response.data.code == 0){
//         message.success({
//           content: `添加成功！`,
//         });
//       }
//       else{
//         message.error({
//           content: `添加失败：${response.data.error}`,
//         });
//       }
// }
// 创建顶级菜单
const handleCreateTopMenu = () => {
  currentMenu.value = 0;
  modalApi.open();
};

// 添加子菜单
const handleAddSubMenu = (row: RowType) => {
  currentMenu.value = row.menuId;
  modalApi.open();
};

const [Modal, modalApi] = useVbenModal();
</script>

<template>
  <div class="vp-raw h-[300px] w-full">
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="expandAll">
          展开全部
        </Button>
        <Button type="primary" class="mr-2" @click="collapseAll"> 折叠全部 </Button>
        <Button type="primary" class="mr-2" @click="handleCreateTopMenu()">创建顶级菜单</Button>
        <Modal class="w-[600px]" title="新建角色" :footer = false>  <Form /> </Modal>
      </template>
      <template #action="{ row }">
          <Button type="link" @click="handleAddSubMenu(row)">添加子菜单</Button>
      </template>
    </Grid>
  </div>
</template>
