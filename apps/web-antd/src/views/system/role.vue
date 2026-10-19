<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { useVbenForm, z } from '#/adapter/form';

import { InsertRole ,GetRoleDataListPage,UpdateRole} from '#/api';

import ExtraModal from './menumodel.vue';
import ExtraModalUser from './usermodel.vue';

const [Modal1, modalApi1] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal(row: RowType)  {
  modalApi1
    .setData({
      content: row.id,
      //payload: '外部传递的数据 payload',
    })
    .open();
}


const [Modal2, modalApi2] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModalUser,
});

function openModaluser(row: RowType)  {
  modalApi2
    .setData({
      content: row.id,
      //payload: '外部传递的数据 payload',
    })
    .open();
}

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
      fieldName: 'roleName',
      // 界面显示的label
      label: '角色名',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'remarks',
      label: '备注(非必填)',
      // rules: z.string().default('默认值').optional(),
    }
  ],
  wrapperClass: 'grid-cols-1',
});

async function onSubmit(values: Record<string, any>) {
  const response = await InsertRole(values);
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
}

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
  roleName: string;
  remarks: string;
}
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { title: 'ID', field: 'id', width: 50 ,visible : false},
    { editRender: { name: 'input' }, field: 'roleName', title: '角色名称' },
    // { editRender: { name: 'input' }, field: 'color', title: 'Color' },
    // {
    //   editRender: { name: 'input' },
    //   field: 'productName',
    //   title: 'Product Name',
    // },
    { editRender: { name: 'input' }, field: 'remarks', title: '备注' },
    { field: 'createName', title: '创建人' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    { slots: { default: 'action' }, title: '操作' },
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
  pagerConfig: {    
    pageSize: 10,
    pageSizes: [10, 20, 50, 100, 500],
    total: 0,},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const response =  await GetRoleDataListPage({
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
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

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
    gridApi.setLoading(false);
    // message.success({
    //   content: `保存成功！category=${row.category}`,
    // });
      const roleId = Number(row.id);
      const response = await UpdateRole({
        id: roleId,
        roleName:row.roleName,
        remarks:row.remarks,
      });
      //console.log("response =====>" + response);
      if(response.data.code == 0){
        message.success({
          content: `修改成功！`,
        });
      }
      else{
        message.error({
          content: `修改失败：${response.data.error}`,
        });
      }
  //}, 600);
}

const cancelRowEvent = (_row: RowType) => {
  gridApi.grid?.clearEdit();
};

const [Modal, modalApi] = useVbenModal();


</script>

<template>

  <div class="vp-raw w-full">
        <Modal1 class="w-[1200px]" title="编辑权限" confirmText="保存"> </Modal1>
        <Modal2 class="w-[1200px]" title="编辑权限" confirmText="保存"> </Modal2>
       <Grid>
      <template #toolbar-tools>
        <VbenButton @click="() => modalApi.open()">创建角色权限</VbenButton>
        <Modal class="w-[600px]" title="新建角色" :footer = false>  <Form /> </Modal>

      </template>
      <template #action="{ row }">

        <template v-if="hasEditStatus(row)">
          <Button type="link" @click="saveRowEvent(row)">保存</Button>
          <Button type="link" @click="cancelRowEvent(row)">取消</Button>
        </template>
        <template v-else>
          <Button type="link" @click="editRowEvent(row)">编辑</Button>
          <Button type="link" @click="openModal(row)">角色权限编辑</Button>

          <Button type="link" @click="openModaluser(row)">绑定人员</Button>
        </template>
      </template>
    </Grid>
  </div>
</template>
