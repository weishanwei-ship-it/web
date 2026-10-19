<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import {
  Step,
  Steps,
  Card,
  Select,
  SelectOption,
  Space,
  Input,
  InputNumber,
  Col,
  Button,
  FormItem,
  Row,
  Checkbox,
  CheckboxGroup,
  Form,
} from 'ant-design-vue';
import { ref } from 'vue';

const data = ref();
const datacontent = ref<any>();
const current = ref(0);

const standardOptions = [
  { label: 'API标准', value: 'API' },
  { label: 'TSG规范', value: 'TSG' },
];
const targetOptions = [
  { label: '执行机构', value: 'actuator' },
  { label: '阀本体', value: 'valve' },
];

const form = ref({
  产品型号: '',
  公称通径: '',
  压力等级: '',
  阀门类型: '',
  执行标准: '',
  产品名称: '',
  进口通径: '',
  进口法兰等级: '',
  阀芯通径: '',
  出口通径: '',
  出口法兰等级: '',
  阀体压力等级: '',
  阀体结构: '',
  阀体型式: '',
  阀盖颈部型式: '',
  执行机构型号: '',
  产品材质: '',
  最大关闭压差: '',
  介质流向: '',
  密封等级: '',
  编制年份: '',
  阀体材质: '',
  分组标识: '',
  版本号: '',
  版本状态: '',
  计算书编码: '',
  介质: '',
  操作温度: '',
});

const formselect = ref({
  standardType: 'API',
  calcTarget: 'actuator',
  阀轴连接方式: '键连接',
  填料压板结构: '平板式',
  连接支架形式: '标准',
  强度计算公式: 'GB/T 17213',
  outputTemplate: 'standard',
  drawingOutputType: 'size',
});

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
      form.value = { ...datacontent.value };
    }
  },
});

defineExpose({ modalApi });
</script>

<template>
  <Modal title="设计计算">
    <div class="h-full flex flex-col">
      <Card class="mb-4">
        <Steps v-model:current="current" type="navigation" class="mb-4">
          <Step title="信息录入" />
          <Step title="计算项" />
        </Steps>
      </Card>

      <Card class="mb-4">
        <Space size="large">
          <label>执行标准</label>
          <Select v-model:value="formselect.standardType" style="width: 350px">
            <SelectOption v-for="item in standardOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectOption>
          </Select>
          <label>产品类型</label>
          <Select v-model:value="formselect.calcTarget" style="width: 350px">
            <SelectOption v-for="item in targetOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </SelectOption>
          </Select>
        </Space>
      </Card>

      <div class="flex-1 overflow-auto border rounded-md p-4 bg-white">
        <div v-show="current === 0">
          <Card title="订单/产品基础信息" :bordered="false" class="mb-4">
            <Row :gutter="[16, 16]">
              <Col :span="8">
                <FormItem label="产品型号">
                  <Input v-model:value="form.产品型号" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="公称通径">
                  <Input v-model:value="form.公称通径" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="压力等级">
                  <Input v-model:value="form.压力等级" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="阀门类型">
                  <Input v-model:value="form.阀门类型" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="执行标准">
                  <Input v-model:value="form.执行标准" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="产品名称">
                  <Input v-model:value="form.产品名称" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="介质">
                  <Input v-model:value="form.介质" />
                </FormItem>
              </Col>
              <Col :span="16">
                <FormItem label="操作温度/压力">
                  <Input v-model:value="form.操作温度" />
                </FormItem>
              </Col>
            </Row>
          </Card>
        </div>

        <div v-show="current === 1">
          <Card title="自动匹配计算项" :bordered="false" class="mb-4">
            <label class="mr-2">默认计算项：</label>
            <CheckboxGroup>
              <Checkbox value="1">流量系数Cv</Checkbox>
              <Checkbox value="2">阀杆强度</Checkbox>
              <Checkbox value="3">关闭压差</Checkbox>
              <Checkbox value="4">执行机构推力</Checkbox>
              <Checkbox value="5">密封性能</Checkbox>
            </CheckboxGroup>
          </Card>
        </div>
      </div>

      <div class="mt-4 flex justify-between">
        <div class="flex gap-2">
          <Button :disabled="current === 0" @click="current--">上一步</Button>
          <Button type="primary" @click="current++">下一步</Button>
        </div>
      </div>
    </div>
  </Modal>
</template>