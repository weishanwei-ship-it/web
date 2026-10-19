<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { Button, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { GetU9DataListPage, UpdateU9 } from '#/api';
import { useVbenModal, VbenButton } from '@vben/common-ui';
import ExtraModal from './u9modal.vue';

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi
    .setData({
      content: '零件',
    })
    .open();
}


interface RowType {
  id: number;
  ERP分类码:string;
  大类编码:string;
  大类名称:string;
  大类属性:string;
  中类编码:string;
  中类名称:string;
  中类属性:string;
  小类编码:string;
  小类名称:string;
  小类属性:string;
  财务分类:string;
  修改说明:string;
  交货提交资料包工包料委外:string;
  交货提交资料供料委外自制无需提交资料:string;
  存储合格期:string;
  是否关键物料:string;
  抽样数量:string;
  抽样频次:string;
  常规检验:string;
  尺寸检验:string;
  机械性能:string;
  化学成分:string;
  无损检验:string;
  包装方式:string;
  合理损耗率: number;
  是否承压:string;
  工艺特殊要求1:string;
  工艺特殊要求2:string;
  工艺特殊要求3:string;
  工艺特殊要求4:string;
}

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入ERP分类码',
      },
      fieldName: 'erP分类码',
      label: 'ERP分类码',
    }
  ],
  showCollapseButton: false,
  submitButtonOptions: {
    content: '查询',
  },
  submitOnChange: false,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { editRender: { name: 'input' }, field: 'erP分类码', title: 'ERP分类码' ,  width: 120},
    { editRender: { name: 'input' }, field: '大类编码', title: '大类编码' ,  width: 120},
    { editRender: { name: 'input' }, field: '大类名称', title: '大类名称',  width: 120},
    { editRender: { name: 'input' }, field: '大类属性', title: '大类属性',  width: 120},
    { editRender: { name: 'input' }, field: '中类编码', title: '中类编码',  width: 120},
    { editRender: { name: 'input' }, field: '中类名称', title: '中类名称',  width: 120},
    { editRender: { name: 'input' }, field: '中类属性', title: '中类属性',  width: 120},
    { editRender: { name: 'input' }, field: '小类编码', title: '小类编码',  width: 120},
    { editRender: { name: 'input' }, field: '小类名称', title: '小类名称',  width: 120},
    { editRender: { name: 'input' }, field: '小类属性', title: '小类属性',  width: 120},
    { editRender: { name: 'input' }, field: '财务分类', title: '财务分类',  width: 120},
    { editRender: { name: 'input' }, field: '修改说明', title: '修改说明',  width: 120},
    { editRender: { name: 'input' }, field: '交货提交资料包工包料委外', title: '交货提交资料包工包料委外',  width: 120},
    { editRender: { name: 'input' }, field: '交货提交资料供料委外自制无需提交资料', title: '交货提交资料供料委外自制无需提交资料',  width: 120},
    { editRender: { name: 'input' }, field: '存储合格期', title: '存储合格期',  width: 120},
    { editRender: { name: 'input' }, field: '是否关键物料', title: '是否关键物料',  width: 120},
    { editRender: { name: 'input' }, field: '抽样数量', title: '抽样数量',  width: 120},
    { editRender: { name: 'input' }, field: '抽样频次', title: '抽样频次',  width: 120},
    { editRender: { name: 'input' }, field: '常规检验', title: '常规检验',  width: 120},
    { editRender: { name: 'input' }, field: '尺寸检验', title: '尺寸检验',  width: 120},
    { editRender: { name: 'input' }, field: '机械性能', title: '机械性能',  width: 120},
    { editRender: { name: 'input' }, field: '化学成分', title: '化学成分',  width: 120},
    { editRender: { name: 'input' }, field: '无损检验', title: '无损检验',  width: 120},
    { editRender: { name: 'input' }, field: '包装方式', title: '包装方式',  width: 120},
    { editRender: { name: 'input' }, field: '合理损耗率', title: '合理损耗率',  width: 120},
    { editRender: { name: 'input' }, field: '是否承压', title: '是否承压',width: 120},
    { editRender: { name: 'input' }, field: '工艺特殊要求1', title: '工艺特殊要求1',  width: 120},
    { editRender: { name: 'input' }, field: '工艺特殊要求2', title: '工艺特殊要求2',  width: 120},
    { editRender: { name: 'input' }, field: '工艺特殊要求3', title: '工艺特殊要求3',  width: 120},
    { editRender: { name: 'input' }, field: '工艺特殊要求4', title: '工艺特殊要求4',  width: 120},
    { slots: { default: 'action' },fixed: 'right', title: '操作',  width: 160,},
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
        const response =  await GetU9DataListPage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
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
  try {
    const roleId = Number(row.id);
    const response = await UpdateU9({ ...row });
    if (response.data.code == 0) {
      message.success({ content: `修改成功！` });
    } else {
      message.error({ content: `修改失败：${response.data.error}` });
    }
  } catch (err) {
    message.error({ content: `修改失败：${(err as Error).message}` });
  } finally {
    gridApi.setLoading(false);
  }
}

const cancelRowEvent = (_row: RowType) => {
  gridApi.grid?.clearEdit();
};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-tools>      
        <VbenButton @click="openModal">导入</VbenButton>
        <Modal class="w-[800px]"/>
      </template>
      <template #action="{ row }">
        <template v-if="hasEditStatus(row)">
          <Button type="link" @click="saveRowEvent(row)">保存</Button>
          <Button type="link" @click="cancelRowEvent(row)">取消</Button>
        </template>
        <template v-else>
          <Button type="link" @click="editRowEvent(row)">编辑</Button>
        </template>
      </template>
    </Grid>


  </div>
</template>


