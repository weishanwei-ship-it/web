<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { GetEmployeeInfoDataListPage } from '#/api';

interface RowType {
  empName: string;
  empNo: boolean;
  sexName: string;
  productName: string;
  homeAddr: string;
  mobile: string;
  passWord: string;
  empTypeName: string;
  empCurrentStateName: string;
  educationName: string;
  perField4: string;
  special: string;
  qtTypeName: string;
  qtName: string;
  perField7: string;
  companyNo: string;
  quartersNo: string;
  partNo: string;
  idCardAddr: string;
  birthday: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入员工工号',
      },
      fieldName: 'empNo',
      label: '员工工号',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入员工姓名',
      },
      fieldName: 'empName',
      label: '员工姓名',
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
  checkboxConfig: {
    highlight: true,
    labelField: 'empName',
  },
  columns: [
    { title: '序号', type: 'seq', width: 100 },
    // { align: 'left', title: 'ID',field: 'empID',visible : false},提交
    // { title: '身份证号码',field: 'idCardNo',visible : false},
    { align: 'left', title: '员工姓名', field: 'empName', width: 100 },
    { field: 'empNo', title: '员工工号' },
    { field: 'sexName', title: '性别' },
    { field: 'partName', title: '部门' },
    { field: 'homeAddr', title: '居住地址' },
    { field: 'mobile', title: '手机号' },
    { field: 'empTypeName', title: '在职' },
    { field: 'empCurrentStateName', title: '是否离职' },
    { field: 'educationName', title: '学历' },
    { field: 'perField4', title: '毕业院校' },
    { field: 'special', title: '毕业专业' },
    { field: 'qtTypeName', title: '学历类型' },
    { field: 'qtName', title: '职称' },
    { field: 'perField7', formatter: 'formatDateTime', title: '毕业时间' },
    { field: 'companyNo', title: '公司编号' },
    { field: 'quartersNo', title: '岗位编号' },
    { field: 'partNo', title: '部门区域编号' },
    { field: 'idCardAddr', title: '户籍地址' },
    { field: 'birthday', title: '出生日期' },
    //{ field: 'releaseDate', formatter: 'formatDateTime', title: 'DateTime' },
  ],
  keepSource: true,
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100, 500],
    total: 0,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        //message.success(`Query params: ${JSON.stringify(formValues)}`);
        const response = await GetEmployeeInfoDataListPage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        //console.log("response 原始数据:", response); // 可展开的对象，方便查看
        //console.log("response 格式化JSON:", JSON.stringify(response, null, 2)); // 文本格式
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        const total = response.data.total;
        const tableData = {
          items: list,
          total: total,
        };
        //console.log("tableData 真实内容:", list);

        return tableData;
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-expect-error 正式环境时有完整的类型声明
    search: true,
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

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
  <Modal title="数据共享示例">
    <div class="flex-col-center">外部传递数据： {{ data }}</div>
    <Grid />
  </Modal>
</template>
