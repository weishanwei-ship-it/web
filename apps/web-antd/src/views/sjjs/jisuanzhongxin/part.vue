<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as XLSX from 'xlsx';
import {
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Radio,
  Select,
  SelectOption,
  Space,
  Table,
  Tabs,
  TabPane,
  Tag,
  Tooltip,
  message,
} from 'ant-design-vue';

const TextArea = Input.TextArea;
const FormItem = Form.Item;

import { DataApi } from '#/api/core/data';
import type { ColumnInfo } from '#/api/core/data';

const route = useRoute();

const tableName = computed(() => (route.meta?.table as string) || '设计计算书');

// ============================================================
// 表结构
// ============================================================
const schema = ref<ColumnInfo[]>([]);
const pkColumn = computed(() => {
  const pk = schema.value.find((c) => c.IsPrimaryKey);
  return pk?.ColumnName || '出厂编号';
});

function getRowKey(record: any): any {
  return record[pkColumn.value];
}

function isNumberType(dt: string) {
  return [
    'int',
    'bigint',
    'smallint',
    'tinyint',
    'decimal',
    'numeric',
    'float',
    'real',
    'money',
  ].includes((dt || '').toLowerCase());
}

function isLongText(dt: string, maxLen: number) {
  const t = (dt || '').toLowerCase();
  return t === 'text' || t === 'ntext' || maxLen > 500;
}

// ============================================================
// 列表
// ============================================================
const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const pagination = reactive({ current: 1, pageSize: 20 });

// ============================================================
// 基础参数 字段定义
// ============================================================
const baseParamFields = computed(() => [
  {
    label: '阀门型号',
    field: '阀门型号',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '阀体型式',
    field: '阀体型式',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '入口公称通径',
    field: '入口尺寸',
    paramCode: 'X001N008',
    symbol: 'd1',
    default: '',
  },
  {
    label: '入口法兰等级',
    field: '入口法兰等级',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '阀芯尺寸',
    field: '阀芯尺寸',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '出口公称通径',
    field: '出口尺寸',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '出口法兰等级',
    field: '出口法兰等级',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '阀体等级',
    field: '阀体等级',
    paramCode: 'X001N001',
    symbol: 'N',
    default: '',
  },
  {
    label: '上盖或阀颈形式',
    field: '阀盖形式',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '流量特性',
    field: '流量特性',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '填料结构',
    field: '填料结构',
    paramCode: null,
    symbol: null,
    default: '',
  },
  { label: '流向', field: '流向', paramCode: null, symbol: null, default: '' },
  {
    label: '阀体材质',
    field: '阀体材质',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '阀体材料特殊要求',
    field: '阀体材料特殊要求',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '阀内件材质',
    field: '阀内件材质',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '执行机构型号',
    field: '执行机构型号',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '动作形式',
    field: '动作形式',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '作用形式',
    field: '作用形式',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '执行机构规格',
    field: '执行机构规格',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '气源压力',
    field: '气源压力',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '电源电压',
    field: '电源电压',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '弹簧范围',
    field: '弹簧范围',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '行程',
    field: '额定行程',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '手轮机构',
    field: '手轮机构',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '标准体系',
    field: '标准体系',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '发布年份',
    field: '发布年份',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '发布版本',
    field: '发布版本',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '发布状态',
    field: '发布状态',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '泄漏等级',
    field: '泄漏等级',
    paramCode: null,
    symbol: 'm',
    default: '',
  },
  {
    label: '最大压差',
    field: '最大压差',
    paramCode: null,
    symbol: 'pm',
    default: '',
  },
  {
    label: '流量系数',
    field: '流量系数',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '出厂编号',
    field: '出厂编号',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '本体编码',
    field: '本体编码',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '执行机构编码',
    field: '执行机构编码',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '客户名称',
    field: '客户名称',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '工况介质',
    field: '工况介质',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '介质温度',
    field: '介质温度',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '介质状态',
    field: '介质状态',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '故障位置',
    field: '故障位置',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '下单日期',
    field: '下单日期',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '导单人员',
    field: '导单人员',
    paramCode: null,
    symbol: null,
    default: '',
  },
  {
    label: '导单日期',
    field: '导单日期',
    paramCode: null,
    symbol: null,
    default: '',
  },
]);

// ============================================================
// 视图模式
// ============================================================
const VIEW_MODE_KEY = computed(
  () => `design_calc_view_mode_${tableName.value}`,
);
const viewMode = ref<'card' | 'list'>(
  (localStorage.getItem(VIEW_MODE_KEY.value) as 'card' | 'list') || 'list',
);

function toggleViewMode() {
  viewMode.value = viewMode.value === 'list' ? 'card' : 'list';
  localStorage.setItem(VIEW_MODE_KEY.value, viewMode.value);
}

const cardFields = computed(() =>
  schema.value.filter((c) =>
    [
      '阀门名称',
      '阀门型号',
      '产品规格',
      '入口尺寸',
      '出口尺寸',
      '阀体等级',
      '执行标准',
      '客户名称',
      '工况介质',
      '介质温度',
      '出厂编号',
      '阀体材质',
    ].includes(c.ColumnName),
  ),
);

async function loadSchema() {
  if (!tableName.value) return;
  try {
    schema.value = await DataApi.getSchema(tableName.value);
  } catch (e) {
    console.error('[loadSchema] 失败', e);
    schema.value = [];
  }
}

async function loadData() {
  if (!tableName.value) return;
  loading.value = true;
  try {
    const res = await DataApi.getList(
      tableName.value,
      pagination.current,
      pagination.pageSize,
      activeSearch.column || undefined,
      activeSearch.keyword || undefined,
    );
    rows.value = res.items;
    total.value = res.total;
  } catch (e: any) {
    console.error('加载数据失败:', e);
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onTableChange(p: any) {
  pagination.current = p.current;
  pagination.pageSize = p.pageSize;
  loadData();
}

function onCardPageChange(p: number, ps: number) {
  pagination.current = p;
  pagination.pageSize = ps;
  loadData();
}

function onCardPageSizeChange(_p: number, ps: number) {
  pagination.current = 1;
  pagination.pageSize = ps;
  loadData();
}

// ============================================================
// 高级查询
// ============================================================
const DEFAULT_SEARCH_COLUMN = '出厂编号';
const advancedQuery = reactive({
  column: DEFAULT_SEARCH_COLUMN as string | undefined,
  keyword: '',
});
const activeSearch = reactive({ column: '' as string, keyword: '' as string });
const advQueryVisible = ref(false);

function openAdvQuery() {
  advancedQuery.column = DEFAULT_SEARCH_COLUMN;
  advancedQuery.keyword = '';
  advQueryVisible.value = true;
}

function submitAdvQuery() {
  if (!advancedQuery.column) {
    message.warning('请选择查询选项');
    return;
  }
  if (!advancedQuery.keyword.trim()) {
    message.warning('请输入查询内容');
    return;
  }
  activeSearch.column = advancedQuery.column;
  activeSearch.keyword = advancedQuery.keyword.trim();
  pagination.current = 1;
  advQueryVisible.value = false;
  loadData();
}

function resetAdvQuery() {
  advancedQuery.column = DEFAULT_SEARCH_COLUMN;
  advancedQuery.keyword = '';
  activeSearch.column = '';
  activeSearch.keyword = '';
  pagination.current = 1;
  advQueryVisible.value = false;
  loadData();
}

// ============================================================
// 配置弹窗
// ============================================================
const configModalVisible = ref(false);
const configActiveTab = ref('1');
const configRecord = ref<any>(null);
const configForm = reactive<Record<string, any>>({});

const configFormSelect = reactive({
  standardType: 'API',
  calcTarget: 'actuator',
  阀轴连接方式: '键连接',
  填料压板结构: '平板式',
  连接支架形式: '标准',
  强度计算公式: 'GB/T 17213',
});

const configCheckbox = reactive({
  defaultItems: ['1', '2'] as string[],
  optionalItems: [] as string[],
});

// ============================================================
// 动态章节 + 计算结果
// ============================================================
const comboList = ref<any[]>([]);
const selectedComboCode = ref<string>('');

const designGivenCodes = ref<string[]>([]);
const selectedDesignGivenCode = ref<string>('');
// ★ 打开弹窗时由后端按规则拼出的编码（用于实时计算时的三级匹配）
const builtRuleCode = ref<string>(''); // 9 段规则码（设计给定口径）
const builtFullCode = ref<string>(''); // 完整组合码

const designGivenParamsMap = ref<Record<string, string>>({});
const designGivenLoading = ref(false);

const configChapters = ref<any[]>([]);
const chapterResults = ref<Record<string, any[]>>({});
const calculating = ref(false);
const structureImages = ref<Record<string, string>>({});

const checkResult = ref<{
  qualified: boolean;
  message: string;
  chapters: Array<{
    chapterCode: string;
    chapterName: string;
    passed: boolean;
    message: string;
    details: Array<{
      name: string;
      passed: boolean;
      skipped?: boolean;
      message: string;
      expression?: string;
    }>;
  }>;
} | null>(null);

// 大图预览
const imagePreviewVisible = ref(false);
const imagePreviewSrc = ref('');
function openImagePreview(src?: string) {
  if (!src) return;
  imagePreviewSrc.value = src;
  imagePreviewVisible.value = true;
}

const bookColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '计算内容',
    dataIndex: 'content',
    key: 'content',
    width: 180,
    align: 'left',
    fixed: 'left',
  },
  {
    title: '符号',
    dataIndex: 'symbol',
    key: 'symbol',
    width: 80,
    align: 'center',
  },
  {
    title: '公式',
    dataIndex: 'formula',
    key: 'formula',
    width: 320,
    align: 'left',
  },
  {
    title: '索引',
    dataIndex: 'reference',
    key: 'reference',
    width: 220,
    align: 'left',
  },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: 70, align: 'center' },
  {
    title: '计算值',
    dataIndex: 'value',
    key: 'value',
    width: 130,
    align: 'center',
    fixed: 'right',
  },
];

async function loadComboList() {
  try {
    const res: any = await DataApi.getList('产品组合', 1, 500);
    comboList.value = res.items || [];
    if (comboList.value.length > 0 && !selectedComboCode.value) {
      selectedComboCode.value = comboList.value[0].组合代号;
    }
  } catch {
    comboList.value = [];
  }
}

async function loadDesignGivenCodes() {
  try {
    const BATCH = 2000;
    let page = 1;
    const set = new Set<string>();

    while (page <= 20) {
      const res = await DataApi.getList('设计给定', page, BATCH);
      const items = res.items || [];
      for (const row of items) {
        const c = String(row.产品编码 || '').trim();
        if (c) set.add(c);
      }
      if (items.length < BATCH) break;
      page += 1;
    }

    designGivenCodes.value = Array.from(set).toSorted();
    console.log(
      '[loadDesignGivenCodes] 共',
      designGivenCodes.value.length,
      '个产品编码',
    );
  } catch (e) {
    console.error('[loadDesignGivenCodes] 失败', e);
    designGivenCodes.value = [];
  }
}

async function loadDesignGivenParams(code: string) {
  if (!code) {
    designGivenParamsMap.value = {};
    return;
  }
  designGivenLoading.value = true;
  try {
    const BATCH = 2000;
    let page = 1;
    const map: Record<string, string> = {};

    while (page <= 20) {
      const res = await DataApi.getList('设计给定', page, BATCH);
      const items = res.items || [];
      const filtered = items.filter(
        (r: any) => String(r.产品编码 || '').trim() === code,
      );
      for (const r of filtered) {
        const val = r.值 == null ? '' : String(r.值);
        if (r.参数编码) map[String(r.参数编码).trim()] = val;
        if (r.符号) map[String(r.符号).trim()] = val;
      }
      if (items.length < BATCH) break;
      page += 1;
    }

    designGivenParamsMap.value = map;
    console.log(
      `[loadDesignGivenParams] ${code} 加载 ${Object.keys(map).length} 个 key`,
    );
  } catch (e) {
    console.error('[loadDesignGivenParams] 失败', e);
    designGivenParamsMap.value = {};
  } finally {
    designGivenLoading.value = false;
  }
} 

watch(selectedDesignGivenCode, (newVal) => {
  loadDesignGivenParams(newVal);
});

function onComboChange(_code: string) {
  configChapters.value = [];
  chapterResults.value = {};
  checkResult.value = null;
  structureImages.value = {};
}

// ============================================================
// 基础参数取值
// ============================================================
function getBaseParamValue(item: any): any {
  if (item.paramCode) {
    const v = designGivenParamsMap.value[item.paramCode];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  if (item.symbol) {
    const v = designGivenParamsMap.value[item.symbol];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  const v1 = configForm[item.field];
  if (v1 !== undefined && v1 !== null && v1 !== '') return v1;
  const v2 = configRecord.value?.[item.field];
  if (v2 !== undefined && v2 !== null && v2 !== '') return v2;
  return item.default ?? '-';
}

// ============================================================
// 打开配置弹窗
// ============================================================
async function openConfigModal(record: any) {
  configRecord.value = record;
  configActiveTab.value = '1';

  // 清空上次的遗留
  selectedDesignGivenCode.value = '';
  builtRuleCode.value = '';
  builtFullCode.value = '';

  Object.keys(configForm).forEach((k) => delete configForm[k]);
  Object.keys(record).forEach((k) => {
    configForm[k] = record[k] ?? '';
  });
  schema.value.forEach((col) => {
    if (!(col.ColumnName in configForm)) {
      configForm[col.ColumnName] = '';
    }
  });

  configFormSelect.standardType = record['执行标准'] === 'TSG' ? 'TSG' : 'API';
  configFormSelect.calcTarget = 'actuator';
  configFormSelect.阀轴连接方式 = '键连接';
  configFormSelect.填料压板结构 = '平板式';
  configFormSelect.连接支架形式 = '标准';
  configFormSelect.强度计算公式 = 'GB/T 17213';

  configCheckbox.defaultItems = ['1', '2'];
  configCheckbox.optionalItems = [];

  if (!selectedComboCode.value && comboList.value.length > 0) {
    selectedComboCode.value = comboList.value[0].组合代号;
  }

  configChapters.value = [];
  chapterResults.value = {};
  checkResult.value = null;
  structureImages.value = {};

  // ============================================================
  // ★★★ 重点：动态请求后端拼接编码 ★★★
  // ============================================================
  try {
    const res: any = await DataApi.buildProductCode(record);
    console.log('[openConfigModal] 拼接接口原始返回 =', res);

      let codeStr = '';
      let ruleCode = '';
      let exists = false;
      const candidatesList: string[] = [];

      if (typeof res === 'string') {
        codeStr = res; // 直接返回了字符串
      } else if (res?.data && typeof res.data === 'string') {
        codeStr = res.data; // { data: "P2A..." }
      } else if (res?.data?.data) {
        codeStr = res.data.data; // 多层嵌套
      }

      // ★ 新口径：9 段规则码（设计给定表用的编码）
      const raw = (res?.data && typeof res.data === 'object'
        ? res.data
        : res) as any;
      ruleCode = String(raw?.ruleCode || '').trim();
      exists = !!raw?.exists;
      for (const c of raw?.candidates || []) {
        if (c) candidatesList.push(String(c));
      }

      builtFullCode.value = codeStr;
      builtRuleCode.value = ruleCode;

      if (ruleCode) {
        console.log(
          '[openConfigModal] 9 段规则码 =',
          ruleCode,
          '| 设计给定存在 =',
          exists,
          '| 兜底候选 =',
          candidatesList.length,
        );
      }

      // ★ 优先用规则码（设计给定口径）；不存在时用兜底候选的第一个
      if (ruleCode && exists) {
        selectedDesignGivenCode.value = ruleCode;
      } else if (candidatesList.length === 1) {
        selectedDesignGivenCode.value = candidatesList[0]!;
        console.warn(
          '[openConfigModal] 规则码无对应数据，改用唯一候选：',
          candidatesList[0],
        );
      } else if (codeStr) {
        selectedDesignGivenCode.value = codeStr;
        console.warn('[openConfigModal] 动态生成编码成功 =', codeStr);
      } else {
        console.warn('[openConfigModal] 动态生成编码失败，解析后为空');
      }
  } catch (e) {
    console.error('[openConfigModal] 请求拼接编码接口异常 =', e);
  }

  if (selectedDesignGivenCode.value) {
    await loadDesignGivenParams(selectedDesignGivenCode.value);
  }

  // 打开弹窗就加载结构简图
  try {
    const 产品结构编码 = extractProductCode(record);
    if (产品结构编码) {
      const imgRes: any = await DataApi.getStructureImages(产品结构编码);
      const imgData: any = imgRes?.data ?? imgRes;
      const rows01 = Array.isArray(imgData) ? imgData : imgData?.data || [];
      const imgMap: Record<string, string> = {};
      rows01.forEach((row: any) => {
        if (!row.图片路径) return;
        if (row.计算项) imgMap[String(row.计算项).trim()] = row.图片路径;
        if (row.计算项目) imgMap[String(row.计算项目).trim()] = row.图片路径;
        if (row.图纸编号) imgMap[String(row.图纸编号).trim()] = row.图片路径;
      });
      structureImages.value = imgMap;
      console.log('[openConfigModal] 结构简图映射 =', imgMap);
    }
  } catch (e) {
    console.warn('[openConfigModal] 加载结构简图失败', e);
  }

  configModalVisible.value = true;
}

// ============================================================
// 保存
// ============================================================
async function saveConfig() {
  try {
    const payload = { ...configForm };
    if (!payload['出厂编号']) {
      message.error('缺少【出厂编号】，无法保存');
      return;
    }
    await DataApi.updateByKey(tableName.value, payload);
    message.success('保存成功');
    configModalVisible.value = false;
    loadData();
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  }
}

async function tempSaveConfig() {
  try {
    console.log('临时保存数据：', {
      ...configForm,
      configFormSelect,
      configCheckbox,
    });
    message.success('临时保存成功');
  } catch (e: any) {
    message.error(e?.message || '临时保存失败');
  }
}

async function saveNewVersion() {
  try {
    console.log('存入新版本数据：', {
      ...configForm,
      configFormSelect,
      configCheckbox,
    });
    message.success('新版本已存入');
    configModalVisible.value = false;
    loadData();
  } catch (e: any) {
    message.error(e?.message || '存入新版本失败');
  }
}

// ============================================================
// 提取产品结构编码
// ============================================================
function extractProductCode(record: any): string {
  if (selectedComboCode.value && selectedComboCode.value.length >= 6) {
    return selectedComboCode.value.slice(0, 6);
  }
  if (!record) return '';
  if (record['产品结构编码']) return String(record['产品结构编码']).trim();
  if (record['结构编码']) return String(record['结构编码']).trim();
  if (record['组合代号']) return String(record['组合代号']).trim().slice(0, 6);
  const bodyCode = record['本体编码'];
  if (bodyCode && typeof bodyCode === 'string' && bodyCode.length >= 6) {
    return bodyCode.slice(0, 6);
  }
  return '';
}

// ============================================================
// 从记录中提取计算参数
// ============================================================
function extractCalcParams(record: any): Record<string, any> {
  if (!record) return {};

  // ★ 只传设计给定表里没有的、或需要临时覆盖的字段
  //   其它 X001Nxxx 全部由后端从设计给定表读取（权威数据）

  const params: Record<string, any> = {};

  // 阀体等级（字符串，用于后端判断标准体系，X001N001）
  const x001 = record['阀体等级'];
  if (x001 !== undefined && x001 !== null && x001 !== '') {
    params['X001N001'] = String(x001);
  }

  return params;
}

// ============================================================
// 计算值编辑
// ============================================================
function onValueEdit(record: any) {
  record._edited = true;
  if (record.value === '' || record.value == null) {
    record._edited = false;
  }
}

function resetCurrentChapterEdits() {
  const chapterCode = configActiveTab.value;
  const list = chapterResults.value[chapterCode] || [];
  let count = 0;
  for (const row of list) {
    if (row._edited) {
      if (row._originalValue !== undefined && row._originalValue !== null) {
        row.value = row._originalValue;
      }
      row._edited = false;
      count++;
    }
  }
  if (count > 0) {
    message.success(`已重置 ${count} 条手动编辑（已恢复为公式计算结果）`);
  } else {
    message.info('当前章节没有手动编辑的记录');
  }
}

// ============================================================
// 实时计算
// ============================================================
async function realtimeCalc() {
  if (!configRecord.value) {
    message.warning('请先从列表打开一条计算书记录');
    return;
  }
  const 阀门型号 = configRecord.value['阀门型号'];
  if (!阀门型号) {
    message.warning('当前记录缺少【阀门型号】，无法计算');
    return;
  }

  calculating.value = true;
  try {
    const autoParams = extractCalcParams(configRecord.value);
    const formParams: Record<string, any> = { ...configForm };
    Object.assign(formParams, configFormSelect);
    const params = { ...autoParams, ...formParams };

    // ★ 后端已按需填充默认值，这里不再乱设 X001Nxxx 默认值
    //   只保证 X001N001 一定存在
    if (params['X001N001'] === undefined || params['X001N001'] === null) {
      params['X001N001'] = 'Class150'; // 兜底，按实际业务调整
    }

    const 执行标准 = String(
      configRecord.value['执行标准'] || 'API',
    ).toUpperCase();
    let 标准体系 = 'A';
    if (
      执行标准.includes('GB') ||
      执行标准.includes('TSG') ||
      执行标准.includes('JB') ||
      执行标准.includes('HG') ||
      执行标准.includes('SH')
    ) {
      标准体系 = 'T';
    }

    const rawDate = configRecord.value['下单日期'];
    let 下单日期 = '';
    if (rawDate) {
      const d = new Date(rawDate);
      下单日期 = !isNaN(d.getTime())
        ? d.toISOString().slice(0, 10)
        : String(rawDate).slice(0, 10);
    } else {
      下单日期 = new Date().toISOString().slice(0, 10);
    }

    console.log('=== 计算入参 ===');
    console.log(
      '阀门型号 =',
      阀门型号,
      ', 标准体系 =',
      标准体系,
      ', 下单日期 =',
      下单日期,
    );
    console.log('params =', params);

    const 产品结构编码 = extractProductCode(configRecord.value);
    console.log('产品结构编码 =', 产品结构编码);

    // ★ 出厂编号：【设计计算书】取数（最大压差/泄漏等级/执行机构输出力 Fn1/Fn2）的钥匙，
    //   后端 ApplyDesignBookSourcesAsync 没有它就直接跳过注入 → 17/18 行恒为 '-'
    const 出厂编号 = String(
      configRecord.value['出厂编号'] ?? '',
    ).trim();
    console.log('出厂编号 =', 出厂编号);

    let designGivenCode = selectedDesignGivenCode.value;
    const codes = designGivenCodes.value;

    // ① 所选编码如果已经不在【设计给定】里（重新导入后编码换代）→ 失效
    if (designGivenCode && !codes.includes(designGivenCode)) {
      console.warn(
        '[realtimeCalc] 所选设计给定编码已不存在，重新匹配：',
        designGivenCode,
      );
      designGivenCode = '';
    }

    // ② 精确匹配：后端按规则拼出的 9 段规则码
    if (!designGivenCode && builtRuleCode.value && codes.includes(builtRuleCode.value)) {
      designGivenCode = builtRuleCode.value;
      console.log('[realtimeCalc] 命中规则码 =', designGivenCode);
    }

    // ②½ 规则码本身不匹配（如某段代号口径不一致 / 该规格暂未录入设计给定）
    //    → 取与规则码"公共前缀最长"的候选（同系列最近的一条），并提示
    if (!designGivenCode && builtRuleCode.value) {
      const scored = codes
        .map((c) => {
          let n = 0;
          const max = Math.min(c.length, builtRuleCode.value.length);
          while (n < max && c[n] === builtRuleCode.value[n]) n += 1;
          return { code: c, n };
        })
        .filter((x) => x.n >= 8)
        .toSorted((a, b) => b.n - a.n);
      if (scored.length > 0) {
        designGivenCode = scored[0]!.code;
        console.log(
          '[realtimeCalc] 规则码未精确命中，按最长公共前缀匹配 =',
          designGivenCode,
          `(公共 ${scored[0]!.n} 位，规则码 ${builtRuleCode.value})`,
        );
        message.warning(
          `设计给定里没有 ${builtRuleCode.value} 这条编码，已改用最接近的 ${designGivenCode}（请确认规格是否一致）`,
          6,
        );
      }
    }

    // ③ 前缀匹配：设计给定码 = 组合码的前缀，取最长的一条
    if (!designGivenCode && builtFullCode.value) {
      const hits = codes.filter((c) => builtFullCode.value.startsWith(c));
      if (hits.length > 0) {
        designGivenCode = hits.toSorted((a, b) => b.length - a.length)[0]!;
        console.log('[realtimeCalc] 按组合码前缀最长匹配 =', designGivenCode);
      }
    }

    // ④ 兜底：按阀门型号前缀取第一个候选
    if (!designGivenCode) {
      const model = String(configRecord.value['阀门型号'] || '').trim();
      designGivenCode = codes.find((c) => c.startsWith(model)) || '';
      if (designGivenCode) {
        console.log('[realtimeCalc] 兜底匹配设计给定编码 =', designGivenCode);
      }
    }

    if (designGivenCode && designGivenCode !== selectedDesignGivenCode.value) {
      selectedDesignGivenCode.value = designGivenCode;
    }
    console.log('设计给定产品编码 =', designGivenCode);

    const [bookRes, ruleRes, imgRes] = await Promise.all([
      DataApi.generateBook({
        阀门型号,
        标准体系,
        下单日期,
        设计给定产品编码: designGivenCode || undefined,
        出厂编号: 出厂编号 || undefined,
        params,
      }),
      DataApi.ruleCalc({
        阀门型号,
        设计给定产品编码: designGivenCode || undefined,
        出厂编号: 出厂编号 || undefined,
        params,
      }),
      产品结构编码
        ? DataApi.getStructureImages(产品结构编码)
        : Promise.resolve({ code: 0, data: [] }),
    ]);

    const imgData: any = (imgRes as any)?.data ?? imgRes;
    const imgMap: Record<string, string> = {};
    const rows01 = Array.isArray(imgData) ? imgData : imgData?.data || [];
    rows01.forEach((row: any) => {
      if (!row.图片路径) return;
      if (row.计算项) imgMap[String(row.计算项).trim()] = row.图片路径;
      if (row.计算项目) imgMap[String(row.计算项目).trim()] = row.图片路径;
      if (row.图纸编号) imgMap[String(row.图纸编号).trim()] = row.图片路径;
    });
    structureImages.value = imgMap;
    console.log('=== 结构简图映射 ===', imgMap);

    console.log('=== bookRes 原始响应 ===', bookRes);
    console.log('=== ruleRes 原始响应 ===', ruleRes);

    const bookData: any = (bookRes as any)?.chapters
      ? bookRes
      : ((bookRes as any)?.data ?? bookRes);
    const ruleData: any = (ruleRes as any)?.计算结果可读
      ? ruleRes
      : ((ruleRes as any)?.data ?? ruleRes);

    console.log('=== bookData.chapters 数量 ===', bookData?.chapters?.length);

    const chapters = bookData?.chapters || [];
    if (chapters.length === 0) {
      message.error(
        '未能生成章节，请检查【公式库】或【计算项与公式和日期关联规则】配置',
      );
      return;
    }

    const resultMap: Record<string, string> = {};

    if (ruleData) {
      const 计算结果可读 = ruleData.计算结果可读 || {};
      const 执行日志 = ruleData.执行日志 || [];

      (执行日志 || []).forEach((log: any) => {
        if (log.error) return;
        const val = log.valueDisplay ?? log.value;
        if (val === undefined || val === null) return;

        if (log.symbol) resultMap[String(log.symbol).trim()] = String(val);
        if (log.item) resultMap[String(log.item).trim()] = String(val);
        if (log.itemName) resultMap[String(log.itemName).trim()] = String(val);
      });

      Object.entries(计算结果可读).forEach(([k, v]) => {
        if (!resultMap[k]) resultMap[k] = String(v);
      });
    }

    console.log('=== rule-calc 结果映射 ===', resultMap);

    const previousEdits = new Map<
      string,
      { value: string; original: string; edited: boolean }
    >();
    for (const ch of Object.values(chapterResults.value)) {
      for (const row of ch) {
        if (row.code) {
          previousEdits.set(row.code, {
            value: row.value,
            original: row._originalValue ?? row.value,
            edited: !!row._edited,
          });
        }
      }
    }

    for (const ch of chapters) {
      for (const row of ch.rows || []) {
        const sym = (row.symbol || '').trim();
        const code = (row.code || '').trim();
        const content = (row.content || '').trim();

        const prev = code ? previousEdits.get(code) : null;
        if (prev && prev.edited) {
          row.value = prev.value;
          row._originalValue = prev.original;
          row._edited = true;
          continue;
        }

        const newVal = resultMap[sym] ?? resultMap[code] ?? resultMap[content];
        if (newVal !== undefined) {
          row.value = newVal;
          row._originalValue = newVal;
          row.err = null;
        } else if (!row.value) {
          row.value = '-';
          row._originalValue = '-';
        }
        row._edited = false;
      }
    }

    configChapters.value = chapters.map((ch: any) => ({
      章节编码: ch.chapterCode,
      章节名称: ch.chapterName,
      章节序号: ch.chapterOrder,
    }));

    const map: Record<string, any[]> = {};
    chapters.forEach((ch: any) => {
      map[ch.chapterCode] = ch.rows || [];
    });
    chapterResults.value = map;

    if (ruleData && ruleData.合格 !== undefined) {
      checkResult.value = {
        qualified: !!ruleData.合格,
        message: ruleData.判定结论 || (ruleData.合格 ? '合格' : '不合格'),
        chapters: ruleData.合格判定 || [], // ★ 按章节分组
      };
      configActiveTab.value = 'result';
      if (ruleData.合格) {
        message.success(`计算完成：${阀门型号}，判定合格`);
      } else {
        message.error(
          `计算完成：${阀门型号}，判定不合格：${ruleData.判定结论 || ''}`,
          8,
        );
      }
    } else {
      checkResult.value = null;
      if (configChapters.value.length > 0) {
        configActiveTab.value = configChapters.value[0].章节编码;
      }
      message.success(`计算完成：${阀门型号}，共 ${chapters.length} 个章节`);
    }
  } catch (e: any) {
    console.error('计算失败', e);
    const data = e?.response?.data;
    let msg = '未知错误';
    if (data?.message) msg = data.message;
    else if (data?.title) msg = data.title;
    else if (e?.message) msg = e.message;
    message.error('计算失败：' + msg, 8);
  } finally {
    calculating.value = false;
  }
}

// ============================================================
// 宽松匹配章节结构简图
// ============================================================
function getChapterImage(ch: any): string {
  if (!ch) return '';

  const name = String(ch.章节名称 || '').trim();
  const code = String(ch.章节编码 || '').trim();

  if (name && structureImages.value[name]) {
    return structureImages.value[name];
  }
  if (code && structureImages.value[code]) {
    return structureImages.value[code];
  }
  for (const key of Object.keys(structureImages.value)) {
    const k = String(key).trim();
    if (!k) continue;
    if (name && (name.includes(k) || k.includes(name))) {
      return structureImages.value[k]!;
    }
  }
  const keys = Object.keys(structureImages.value);
  if (keys.length === 1) {
    return structureImages.value[keys[0]!]!;
  }
  return '';
}

// 基础参数 Tab 左侧显示的图
const baseParamImage = computed(() => {
  const first = configChapters.value[0];
  if (first) {
    const img = getChapterImage(first);
    if (img) return img;
  }
  const keys = Object.keys(structureImages.value);
  if (keys.length > 0) return structureImages.value[keys[0]!];
  return '/images/V3D_D2060050000005.png';
});

// ============================================================
// 公式详情弹窗
// ============================================================
const formulaModalVisible = ref(false);
const formulaModalTitle = ref('公式详情');
const formulaModalContent = ref('');

function showFormula(record: any) {
  formulaModalTitle.value = `公式详情 - ${record.content || ''}`;
  const lines: string[] = [];

  if (record.formulaDisplay && record.formulaDisplay !== record.formula) {
    lines.push('【本次命中公式】');
    lines.push(record.formulaDisplay || '(空)');
    lines.push('');
    lines.push('【原始完整公式】');
    lines.push(record.formula || '(空)');
  } else {
    lines.push(record.formula || '(空)');
  }

  formulaModalContent.value = lines.join('\n');
  formulaModalVisible.value = true;
}

// ============================================================
// 预览
// ============================================================
const previewModalVisible = ref(false);
const previewRecord = ref<any>(null);

function openPreviewModal(record: any) {
  previewRecord.value = record;
  previewModalVisible.value = true;
}

// ============================================================
// 新增产品
// ============================================================
const productModalVisible = ref(false);
const productText = ref('');
const productSaving = ref(false);

function openProductModal() {
  productText.value = '';
  productModalVisible.value = true;
}

async function submitProduct() {
  const raw = productText.value.trim();
  if (!raw) {
    message.warning('请输入产品编号');
    return;
  }

  const codes = raw
    .split(/[\r\n,，;；\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (codes.length === 0) {
    message.warning('未识别到有效的产品编号');
    return;
  }

  productSaving.value = true;
  try {
    const res: any = await DataApi.addProducts(codes);
    console.log('[submitProduct] 原始响应 =', res);

    const d: any =
      res?.data && typeof res.data === 'object' && 'inserted' in res.data
        ? res.data
        : res;

    if (
      !d ||
      (d.code !== undefined && d.code !== 0) ||
      (d.inserted === undefined &&
        d.skipped === undefined &&
        d.failed === undefined)
    ) {
      message.error(d?.message || res?.message || '新增失败');
      return;
    }

    const inserted = d.inserted?.length || 0;
    const skipped = d.skipped?.length || 0;
    const failedCount = d.failed?.length || 0;

    if (failedCount > 0) {
      message.warning(
        `新增完成：成功 ${inserted} 条，跳过（已存在）${skipped} 条，失败 ${failedCount} 条`,
        8,
      );
      console.warn('失败明细：', d.failed);
    } else {
      message.success(
        `新增完成：成功 ${inserted} 条，跳过（已存在）${skipped} 条`,
      );
    }

    productModalVisible.value = false;
    pagination.current = 1;
    loadData();
  } catch (e: any) {
    console.error('[submitProduct] 异常 =', e);
    message.error(e?.message || '新增产品失败');
  } finally {
    productSaving.value = false;
  }
}

// ============================================================
// 新增项目
// ============================================================
const projectModalVisible = ref(false);
const projectModel = reactive<Record<string, any>>({});
const projectSaving = ref(false);

function openProjectModal() {
  Object.keys(projectModel).forEach((k) => delete projectModel[k]);
  schema.value.forEach((col) => {
    if (col.IsIdentity) return;
    projectModel[col.ColumnName] = isNumberType(col.DataType) ? null : '';
  });
  projectModalVisible.value = true;
}

async function submitProject() {
  projectSaving.value = true;
  try {
    await DataApi.create(tableName.value, { ...projectModel });
    message.success('新增项目成功');
    projectModalVisible.value = false;
    pagination.current = 1;
    loadData();
  } catch (e: any) {
    message.error(e?.message || '新增项目失败');
  } finally {
    projectSaving.value = false;
  }
}

// ============================================================
// 导出
// ============================================================
const exportModalVisible = ref(false);
const exportFormat = ref<'pdf' | 'xlsx'>('xlsx');
const exporting = ref(false);

function openExportModal() {
  exportFormat.value = 'xlsx';
  exportModalVisible.value = true;
}

async function submitExport() {
  exporting.value = true;
  try {
    if (exportFormat.value === 'xlsx') exportXlsx();
    else exportPdf();
    exportModalVisible.value = false;
  } catch (e: any) {
    message.error(e?.message || '导出失败');
  } finally {
    exporting.value = false;
  }
}

function exportXlsx() {
  const headers = schema.value.map((c) => c.ColumnName);
  const dataRows = rows.value.map((row) => headers.map((h) => row[h] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = headers.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '设计计算书');
  const title = String(route.meta?.title || '设计计算书');
  XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  message.success('已导出 XLSX');
}

function exportPdf() {
  message.info('即将打开打印对话框，请选择"另存为 PDF"');
  setTimeout(() => window.print(), 300);
}

// ============================================================
// 编辑 / 删除
// ============================================================
const editModalVisible = ref(false);
const editModel = reactive<Record<string, any>>({});
const editKey = ref<any>(null);
const editSaving = ref(false);

function handleEdit(record: any) {
  const key = getRowKey(record);
  if (key == null || key === '') {
    message.error(`未取到主键值（主键列：${pkColumn.value}）`);
    return;
  }
  editKey.value = key;
  Object.keys(editModel).forEach((k) => delete editModel[k]);
  schema.value.forEach((col) => {
    if (col.IsIdentity) return;
    editModel[col.ColumnName] = record[col.ColumnName];
  });
  editModalVisible.value = true;
}

async function submitEdit() {
  editSaving.value = true;
  try {
    await DataApi.updateByKey(tableName.value, { ...editModel });
    message.success('修改成功');
    editModalVisible.value = false;
    loadData();
  } catch (e: any) {
    message.error(e?.message || '修改失败');
  } finally {
    editSaving.value = false;
  }
}

async function handleDelete(record: any) {
  const key = getRowKey(record);
  if (key == null || key === '') {
    message.error(`未取到主键值（主键列：${pkColumn.value}）`);
    return;
  }

  const display = record['出厂编号'] ?? key;

  if (!confirm(`确定删除【${display}】这条记录吗？`)) return;

  try {
    await DataApi.removeByPk(tableName.value, String(key));
    message.success('删除成功');
    loadData();
  } catch (e: any) {
    message.error(e?.message || '删除失败');
  }
}

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  try {
    await loadSchema();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadData();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadComboList();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadDesignGivenCodes();
  } catch (e) {
    console.error(e);
  }
});

watch(
  () => route.path,
  async () => {
    pagination.current = 1;
    activeSearch.column = '';
    activeSearch.keyword = '';
    viewMode.value =
      (localStorage.getItem(VIEW_MODE_KEY.value) as 'card' | 'list') || 'list';
    try {
      await loadSchema();
    } catch (e) {
      console.error(e);
    }
    try {
      await loadData();
    } catch (e) {
      console.error(e);
    }
  },
);
</script>

<template>
  <div style="padding: 16px">
    <Card :title="route.meta?.title || '设计计算书'">
      <template #extra>
        <Space>
          <Button @click="toggleViewMode">
            {{ viewMode === 'list' ? '卡片视图' : '列表视图' }}
          </Button>
          <Button type="primary" @click="openProductModal">新增产品</Button>
          <Button type="primary" @click="openProjectModal">新增项目</Button>
          <Button type="primary" @click="openExportModal">导出设计书</Button>
          <Button type="primary" @click="openAdvQuery">高级查询</Button>
        </Space>
      </template>

      <div
        v-if="activeSearch.column && activeSearch.keyword"
        style="
          padding: 8px 12px;
          margin-bottom: 12px;
          background: #f5f5f5;
          border-radius: 4px;
        "
      >
        当前查询：
        <strong>{{ activeSearch.column }}</strong>
        包含
        <strong>{{ activeSearch.keyword }}</strong>
        <a style="margin-left: 12px; color: #ff4d4f" @click="resetAdvQuery"
          >清除</a
        >
      </div>

      <Table
        v-if="viewMode === 'list'"
        :data-source="rows"
        :columns="[
          ...schema.map((col) => ({
            title: col.ColumnName,
            dataIndex: col.ColumnName,
            key: col.ColumnName,
            ellipsis: true,
            width: col.IsPrimaryKey ? 50 : undefined,
          })),
          { title: '操作', key: 'action', width: 180, fixed: 'right' },
        ]"
        :loading="loading"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        :row-key="pkColumn"
        :scroll="{ x: 'max-content' }"
        size="small"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <a @click="openConfigModal(record)">配置</a>
              <a @click="openPreviewModal(record)">预览</a>
              <a @click="handleEdit(record)">编辑</a>
              <a style="color: #ff4d4f" @click="handleDelete(record)">删除</a>
            </Space>
          </template>
        </template>
      </Table>

      <div v-else>
        <div
          v-if="loading"
          style="padding: 40px; color: #999; text-align: center"
        >
          加载中…
        </div>

        <div
          v-else-if="rows.length === 0"
          style="padding: 40px; color: #999; text-align: center"
        >
          暂无数据
        </div>

        <div
          v-else
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 12px;
          "
        >
          <Card
            v-for="record in rows"
            :key="record[pkColumn]"
            size="small"
            hoverable
            :title="record['阀门名称'] || record['阀门型号'] || '-'"
          >
            <template #extra>
              <Tag color="blue">{{ record['阀门型号'] || '-' }}</Tag>
            </template>

            <div
              style="
                display: grid;
                grid-template-columns: 88px 1fr;
                gap: 4px 8px;
                margin-bottom: 8px;
                font-size: 12px;
              "
            >
              <template v-for="col in cardFields" :key="col.ColumnName">
                <div style="color: #888">{{ col.ColumnName }}</div>
                <div style="word-break: break-all">
                  {{ record[col.ColumnName] ?? '-' }}
                </div>
              </template>
            </div>

            <div
              style="
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                padding-top: 8px;
                font-size: 12px;
                border-top: 1px solid #f0f0f0;
              "
            >
              <a @click.stop="openConfigModal(record)">配置</a>
              <a @click.stop="openPreviewModal(record)">预览</a>
              <a @click.stop="handleEdit(record)">编辑</a>
              <a style="color: #ff4d4f" @click.stop="handleDelete(record)"
                >删除</a
              >
            </div>
          </Card>
        </div>

        <div
          v-if="!loading && rows.length > 0"
          style="margin-top: 16px; text-align: right"
        >
          <Pagination
            :current="pagination.current"
            :page-size="pagination.pageSize"
            :total="total"
            :show-size-changer="true"
            :page-size-options="['12', '20', '40', '80']"
            :show-total="(t: number) => `共 ${t} 条`"
            @change="onCardPageChange"
            @showSizeChange="onCardPageSizeChange"
          />
        </div>
      </div>
    </Card>

    <!-- 配置弹窗 -->
    <Modal
      v-model:open="configModalVisible"
      title="产品配置"
      :footer="null"
      :width="'100vw'"
      wrap-class-name="config-fullscreen-modal"
      :style="{ top: 0, paddingBottom: 0 }"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          overflow: hidden;
        "
      >
        <div
          style="
            display: flex;
            flex-shrink: 0;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            padding: 10px 16px;
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
          "
        >
          <span style="font-weight: bold; white-space: nowrap">产品组合：</span>
          <Select
            v-model:value="selectedComboCode"
            style="width: 280px"
            placeholder="请选择产品组合"
            show-search
            @change="(val) => onComboChange(val as string)"
          >
            <SelectOption
              v-for="c in comboList"
              :key="c.组合代号"
              :value="c.组合代号"
            >
              {{ c.组合代号 }} - {{ c.阀门型号 }} {{ c.阀体毛坯类型 }}
            </SelectOption>
          </Select>

          <span
            style="margin-left: 16px; font-weight: bold; white-space: nowrap"
          >
            设计给定产品编码：
          </span>
          <Select
            v-model:value="selectedDesignGivenCode"
            style="width: 400px"
            placeholder="请选择（用于取设计给定表参数）"
            show-search
            allow-clear
            :options="designGivenCodes.map((c) => ({ label: c, value: c }))"
          />

          <span
            v-if="configChapters.length > 0"
            style="margin-left: 12px; font-size: 12px; color: #999"
          >
            共 {{ configChapters.length }} 个计算章节
          </span>
          <span v-else style="margin-left: 12px; font-size: 12px; color: #bbb">
            点击下方【实时计算】后加载章节
          </span>
        </div>

        <Tabs
          v-model:activeKey="configActiveTab"
          type="card"
          style="
            display: flex;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
          "
          class="config-tabs"
        >
          <!-- 参数录入 -->
          <TabPane key="1" tab="参数录入">
            <div style="padding: 12px">
              <div style="display: flex; gap: 24px; margin-bottom: 12px">
                <div style="display: flex; gap: 8px; align-items: center">
                  <label style="white-space: nowrap">执行标准</label>
                  <Select
                    v-model:value="configFormSelect.standardType"
                    style="width: 260px"
                  >
                    <SelectOption value="API">API标准</SelectOption>
                    <SelectOption value="TSG">TSG规范</SelectOption>
                  </Select>
                </div>
                <div style="display: flex; gap: 8px; align-items: center">
                  <label style="white-space: nowrap">产品类型</label>
                  <Select
                    v-model:value="configFormSelect.calcTarget"
                    style="width: 260px"
                  >
                    <SelectOption value="actuator">执行机构</SelectOption>
                    <SelectOption value="valve">阀本体</SelectOption>
                  </Select>
                </div>
              </div>

              <Card
                title="订单/产品基础信息"
                :bordered="false"
                style="margin-bottom: 12px"
              >
                <div
                  style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px 16px;
                  "
                >
                  <FormItem label="出口通径"
                    ><Input v-model:value="configForm['出口尺寸']"
                  /></FormItem>
                  <FormItem label="出口法兰等级"
                    ><Input v-model:value="configForm['出口法兰等级']"
                  /></FormItem>
                  <FormItem label="阀体压力等级"
                    ><Input v-model:value="configForm['阀体等级']"
                  /></FormItem>
                  <FormItem label="阀体结构"
                    ><Input v-model:value="configForm['阀体结构']"
                  /></FormItem>
                  <FormItem label="阀体型式"
                    ><Input v-model:value="configForm['阀体型式']"
                  /></FormItem>
                  <FormItem label="阀盖/颈部型式"
                    ><Input v-model:value="configForm['阀盖形式']"
                  /></FormItem>
                  <FormItem label="执行机构型号"
                    ><Input v-model:value="configForm['执行机构型号']"
                  /></FormItem>
                  <FormItem label="产品材质"
                    ><Input v-model:value="configForm['产品材质']"
                  /></FormItem>
                  <FormItem label="最大关闭压差"
                    ><Input v-model:value="configForm['最大压差']"
                  /></FormItem>
                  <FormItem label="介质流向"
                    ><Input v-model:value="configForm['流向']"
                  /></FormItem>
                  <FormItem label="密封等级"
                    ><Input v-model:value="configForm['泄漏等级']"
                  /></FormItem>
                  <FormItem label="编制年份"
                    ><Input v-model:value="configForm['编制年份']"
                  /></FormItem>
                  <FormItem label="阀体材质">
                    <Select v-model:value="configForm['阀体材质']">
                      <SelectOption value="CS-碳钢">CS-碳钢</SelectOption>
                      <SelectOption value="SS-不锈钢">SS-不锈钢</SelectOption>
                      <SelectOption value="YC-硬质合金"
                        >YC-硬质合金</SelectOption
                      >
                      <SelectOption value="PL-内衬材质"
                        >PL-内衬材质</SelectOption
                      >
                      <SelectOption value="QT-球墨铸铁"
                        >QT-球墨铸铁</SelectOption
                      >
                    </Select>
                  </FormItem>
                  <FormItem label="分组标识"
                    ><Input v-model:value="configForm['分组标识']"
                  /></FormItem>
                  <FormItem label="版本号"
                    ><Input v-model:value="configForm['版本号']"
                  /></FormItem>
                </div>
              </Card>

              <Card
                title="结构与公式选择"
                :bordered="false"
                style="margin-bottom: 12px"
              >
                <div
                  style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px 16px;
                  "
                >
                  <FormItem label="阀轴连接方式">
                    <Select
                      v-model:value="configFormSelect.阀轴连接方式"
                      style="width: 100%"
                    >
                      <SelectOption value="键连接">键连接</SelectOption>
                      <SelectOption value="销连接">销连接</SelectOption>
                      <SelectOption value="法兰连接">法兰连接</SelectOption>
                    </Select>
                  </FormItem>
                  <FormItem label="填料压板结构">
                    <Select
                      v-model:value="configFormSelect.填料压板结构"
                      style="width: 100%"
                    >
                      <SelectOption value="平板式">平板式</SelectOption>
                      <SelectOption value="法兰式">法兰式</SelectOption>
                    </Select>
                  </FormItem>
                  <FormItem label="连接支架形式">
                    <Select
                      v-model:value="configFormSelect.连接支架形式"
                      style="width: 100%"
                    >
                      <SelectOption value="标准">标准</SelectOption>
                      <SelectOption value="加长">加长</SelectOption>
                    </Select>
                  </FormItem>
                  <FormItem label="强度计算公式">
                    <Select
                      v-model:value="configFormSelect.强度计算公式"
                      style="width: 100%"
                    >
                      <SelectOption value="GB/T 17213">GB/T 17213</SelectOption>
                      <SelectOption value="ASME B16.34"
                        >ASME B16.34</SelectOption
                      >
                    </Select>
                  </FormItem>
                </div>
              </Card>

              <Card title="自动匹配计算项" :bordered="false">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                  "
                >
                  <label style="width: 100px; color: #333; white-space: nowrap"
                    >默认计算项：</label
                  >
                  <CheckboxGroup v-model:value="configCheckbox.defaultItems">
                    <Checkbox value="1">流量系数Cv</Checkbox>
                    <Checkbox value="2">阀杆强度</Checkbox>
                    <Checkbox value="3">关闭压差</Checkbox>
                    <Checkbox value="4">执行机构推力</Checkbox>
                    <Checkbox value="5">密封性能</Checkbox>
                    <Checkbox value="6">自定义扩展</Checkbox>
                  </CheckboxGroup>
                </div>
                <div style="display: flex; align-items: center">
                  <label style="width: 100px; color: #333; white-space: nowrap"
                    >可选计算项：</label
                  >
                  <CheckboxGroup v-model:value="configCheckbox.optionalItems">
                    <Checkbox value="1">流量系数Cv</Checkbox>
                    <Checkbox value="2">阀杆强度</Checkbox>
                    <Checkbox value="3">关闭压差</Checkbox>
                    <Checkbox value="4">执行机构推力</Checkbox>
                    <Checkbox value="5">密封性能</Checkbox>
                    <Checkbox value="6">自定义扩展</Checkbox>
                  </CheckboxGroup>
                </div>
              </Card>
            </div>
          </TabPane>

          <!-- 基础参数（左侧结构简图 + 右侧参数表） -->
          <TabPane key="base" tab="产品组合">
            <div
              style="
                box-sizing: border-box;
                display: flex;
                gap: 12px;
                height: 100%;
                padding: 12px;
              "
            >
              <!-- 左侧：结构简图 -->
              <div
                style="
                  box-sizing: border-box;
                  display: flex;
                  flex: 0 0 360px;
                  flex-direction: column;
                  padding: 8px;
                  background: #fafafa;
                  border: 1px solid #f0f0f0;
                  border-radius: 4px;
                "
              >
                <div
                  style="
                    display: flex;
                    flex: 1;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    overflow: hidden;
                    cursor: zoom-in;
                  "
                  @click="openImagePreview(baseParamImage)"
                >
                  <img
                    :src="baseParamImage"
                    alt="结构简图"
                    style="
                      max-width: 100%;
                      max-height: 100%;
                      object-fit: contain;
                    "
                  />
                </div>

                <div
                  style="flex-shrink: 0; margin-top: 8px; text-align: center"
                >
                  <Button
                    size="small"
                    @click="openImagePreview(baseParamImage)"
                  >
                    查看原图
                  </Button>
                </div>
              </div>

              <!-- 右侧：参数表 -->
              <div style="flex: 1; min-width: 0; overflow: auto">
                <div
                  v-if="designGivenLoading"
                  style="
                    padding: 4px 12px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #1677ff;
                    background: #e6f4ff;
                  "
                >
                  正在加载设计给定参数…
                </div>

                <table
                  style="
                    width: 100%;
                    font-size: 13px;
                    table-layout: fixed;
                    border-collapse: collapse;
                  "
                >
                  <colgroup>
                    <col style="width: 240px" />
                    <col />
                  </colgroup>
                  <tbody>
                    <tr v-for="(item, idx) in baseParamFields" :key="idx">
                      <td
                        style="
                          padding: 6px 12px;
                          font-weight: 500;
                          color: #333;
                          text-align: center;
                          background: #fafafa;
                          border: 1px solid #d9d9d9;
                        "
                      >
                        {{ item.label }}
                      </td>
                      <td
                        style="
                          padding: 6px 12px;
                          color: #333;
                          word-break: break-all;
                          background: #fff;
                          border: 1px solid #d9d9d9;
                        "
                      >
                        {{ getBaseParamValue(item) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabPane>

          <!-- 图纸信息 -->
          <TabPane key="2" tab="图纸信息">
            <div style="padding: 12px">
              <table
                style="
                  width: 100%;
                  margin-bottom: 12px;
                  font-size: 13px;
                  border-collapse: collapse;
                "
              >
                <tbody>
                  <tr>
                    <td
                      rowspan="2"
                      style="
                        width: 180px;
                        padding: 8px;
                        font-weight: bold;
                        text-align: center;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      产品设计计算书
                    </td>
                    <td
                      style="
                        width: 220px;
                        padding: 6px 12px;
                        font-weight: bold;
                        text-align: center;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      产品名称
                    </td>
                    <td
                      style="
                        padding: 6px 12px;
                        font-weight: bold;
                        text-align: center;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      产品规格
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 6px 12px;
                        text-align: center;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      {{ configRecord?.阀门名称 || '-' }}
                    </td>
                    <td
                      style="
                        padding: 6px 12px;
                        text-align: center;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      {{ configRecord?.产品规格 || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                style="
                  width: 100%;
                  margin-bottom: 12px;
                  font-size: 13px;
                  border-collapse: collapse;
                "
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 60px;
                        padding: 6px 12px;
                        font-weight: bold;
                        text-align: center;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      一
                    </td>
                    <td
                      style="
                        padding: 6px 12px;
                        font-weight: bold;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      阀体壁厚校核
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                style="width: 100%; font-size: 13px; border-collapse: collapse"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        width: 100px;
                        padding: 12px;
                        font-weight: bold;
                        vertical-align: middle;
                        text-align: center;
                        background: #fafafa;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      结构简图
                    </td>
                    <td
                      style="
                        padding: 12px;
                        vertical-align: middle;
                        border: 1px solid #d9d9d9;
                      "
                    >
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          min-height: 360px;
                          background: #fafafa;
                        "
                      >
                        <img
                          src="/images/V3D_D2060050000005.png"
                          alt="结构简图"
                          style="
                            max-width: 100%;
                            max-height: 500px;
                            object-fit: contain;
                          "
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabPane>

          <!-- 计算结果 Tab -->
          <TabPane key="result" tab="计算结果">
            <div style="padding: 12px">
              <div
                v-if="!checkResult"
                style="
                  padding: 60px 20px;
                  font-size: 14px;
                  color: #999;
                  text-align: center;
                "
              >
                点击下方【实时计算】按钮生成计算结果
              </div>

              <div v-else>
                <!-- 总体结论 -->
                <div
                  style="
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 16px;
                  "
                >
                  <Tag
                    :color="checkResult.qualified ? 'green' : 'red'"
                    style="
                      padding: 4px 16px;
                      font-size: 16px;
                      line-height: 26px;
                    "
                  >
                    {{ checkResult.qualified ? '合格' : '不合格' }}
                  </Tag>
                  <span style="font-size: 14px; font-weight: 500; color: #333">
                    {{ checkResult.message }}
                  </span>
                </div>

                <!-- ★ 按章节展示：每页计算书只出一条结论（不展示判定明细） -->
                <div
                  v-for="ch in checkResult.chapters"
                  :key="ch.chapterCode"
                  style="
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    padding: 10px 16px;
                    margin-bottom: 8px;
                    border: 1px solid #f0f0f0;
                    border-radius: 4px;
                    background: #fafafa;
                  "
                >
                  <strong style="font-size: 14px; min-width: 160px">{{
                    ch.chapterName
                  }}</strong>
                  <Tag :color="ch.passed ? 'green' : 'red'" style="margin: 0">
                    {{ ch.passed ? '合格' : '不合格' }}
                  </Tag>
                  <span
                    v-if="!ch.passed"
                    style="font-size: 13px; color: #ff4d4f"
                  >
                    {{ ch.message }}
                  </span>
                  <span
                    v-else
                    style="margin-left: auto; font-size: 12px; color: #999"
                  >
                    本章节各项判定通过
                  </span>
                </div>
              </div>
            </div>
          </TabPane>

          <!-- 动态章节：左右布局（右侧撑满高度） -->
          <TabPane
            v-for="ch in configChapters"
            :key="ch.章节编码"
            :tab="`${ch.章节序号}. ${ch.章节名称}`"
          >
            <div
              style="
                box-sizing: border-box;
                display: flex;
                gap: 12px;
                align-items: stretch;
                height: 100%;
                padding: 12px;
              "
            >
              <!-- 左侧：结构简图 -->
              <div
                v-if="getChapterImage(ch)"
                style="
                  box-sizing: border-box;
                  display: flex;
                  flex: 0 0 360px;
                  flex-direction: column;
                  padding: 8px;
                  background: #fafafa;
                  border: 1px solid #f0f0f0;
                  border-radius: 4px;
                "
              >
                <div
                  style="
                    display: flex;
                    flex: 1;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    overflow: hidden;
                    cursor: zoom-in;
                  "
                  @click="openImagePreview(getChapterImage(ch))"
                >
                  <img
                    :src="getChapterImage(ch)"
                    :alt="`${ch.章节名称} 结构简图`"
                    style="
                      max-width: 100%;
                      max-height: 100%;
                      object-fit: contain;
                    "
                  />
                </div>

                <div
                  style="flex-shrink: 0; margin-top: 8px; text-align: center"
                >
                  <Button
                    size="small"
                    @click="openImagePreview(getChapterImage(ch))"
                  >
                    查看原图
                  </Button>
                </div>
              </div>

              <!-- 右侧：计算表格（flex 撑满高度） -->
              <div
                style="
                  display: flex;
                  flex: 1;
                  flex-direction: column;
                  min-width: 0;
                  height: 100%;
                "
              >
                <!-- 工具栏 -->
                <div
                  style="
                    display: flex;
                    flex-shrink: 0;
                    gap: 8px;
                    align-items: center;
                    justify-content: flex-end;
                    margin-bottom: 6px;
                  "
                >
                  <span style="font-size: 12px; color: #999">
                    提示：计算值可直接编辑，黄色圆点 = 已手动修改
                  </span>
                  <Button size="small" @click="resetCurrentChapterEdits">
                    重置手动编辑
                  </Button>
                </div>

                <!-- 表格容器：flex:1 撑满剩余空间 -->
                <div style="flex: 1; min-height: 0; overflow: auto">
                  <Table
                    :columns="bookColumns as any"
                    :data-source="chapterResults[ch.章节编码] || []"
                    :pagination="false"
                    bordered
                    size="small"
                    :row-key="(r: any) => r.code || r.index"
                    :scroll="{ x: 900 }"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'formula'">
                        <Tooltip
                          v-if="record.formulaDisplay || record.formula"
                          :title="record.formula"
                          placement="topLeft"
                          overlay-class-name="formula-tooltip"
                        >
                          <div
                            class="ellipsis-2-lines"
                            style="cursor: pointer"
                            @click="showFormula(record)"
                          >
                            {{ record.formulaDisplay || record.formula }}
                          </div>
                        </Tooltip>
                        <span v-else>-</span>
                      </template>

                      <template v-else-if="column.key === 'reference'">
                        <Tooltip
                          v-if="record.reference"
                          :title="record.reference"
                          placement="topLeft"
                        >
                          <div class="ellipsis-1-line">
                            {{ record.reference }}
                          </div>
                        </Tooltip>
                        <span v-else>-</span>
                      </template>

                      <template v-else-if="column.key === 'value'">
                        <div style="position: relative">
                          <Input
                            v-model:value="record.value"
                            size="small"
                            :bordered="false"
                            :style="{
                              color:
                                record.value === '合格'
                                  ? '#52c41a'
                                  : record.value === '不合格'
                                    ? '#ff4d4f'
                                    : '',
                              fontWeight:
                                record.value === '合格' ||
                                record.value === '不合格'
                                  ? 'bold'
                                  : 'normal',
                              padding: '0 4px',
                              background: record._edited
                                ? '#fffbe6'
                                : 'transparent',
                            }"
                            @change="onValueEdit(record)"
                          />
                          <Tooltip
                            v-if="record._edited"
                            title="已手动修改，重新计算时会保留"
                          >
                            <span
                              style="
                                position: absolute;
                                top: -2px;
                                right: -2px;
                                display: inline-block;
                                width: 6px;
                                height: 6px;
                                background: #faad14;
                                border-radius: 50%;
                              "
                            ></span>
                          </Tooltip>
                        </div>
                      </template>
                    </template>
                  </Table>
                </div>
              </div>
            </div>
          </TabPane>

          <!-- 其他 -->
          <TabPane key="99" tab="其他">
            <div style="padding: 12px">
              <p><strong>执行标准：</strong>{{ configRecord?.执行标准 }}</p>
              <p>
                <strong>是否为标准产品：</strong
                >{{ configRecord?.是否为标准产品 }}
              </p>
              <p><strong>故障位置：</strong>{{ configRecord?.故障位置 }}</p>
              <p><strong>产品规格：</strong>{{ configRecord?.产品规格 }}</p>
            </div>
          </TabPane>
        </Tabs>

        <!-- 底部按钮 -->
        <div
          style="
            display: flex;
            flex-shrink: 0;
            gap: 8px;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 16px;
            overflow-x: auto;
            white-space: nowrap;
            border-top: 1px solid #f0f0f0;
          "
        >
          <Button type="primary" @click="tempSaveConfig">临时保存</Button>
          <Button type="primary" @click="saveNewVersion">存入新版本</Button>
          <Button type="primary" :loading="calculating" @click="realtimeCalc"
            >实时计算</Button
          >
          <Button type="primary" @click="saveConfig">保存配置</Button>
          <Button @click="configModalVisible = false">关闭</Button>
        </div>
      </div>
    </Modal>

    <!-- 大图预览 -->
    <Modal
      v-model:open="imagePreviewVisible"
      title="结构简图"
      :footer="null"
      :width="'auto'"
      :style="{ top: '5vh', maxWidth: '90vw' }"
      centered
      wrap-class-name="structure-image-modal"
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          max-height: 80vh;
          padding: 4px;
          overflow: auto;
        "
      >
        <img
          :src="imagePreviewSrc"
          alt="结构简图"
          style="
            display: block;
            max-width: 90vw;
            max-height: 78vh;
            object-fit: contain;
          "
        />
      </div>
    </Modal>

    <!-- 公式详情 -->
    <Modal
      v-model:open="formulaModalVisible"
      :title="formulaModalTitle"
      :footer="null"
      width="800px"
    >
      <pre
        style="
          max-height: 60vh;
          padding: 12px;
          margin: 0;
          overflow: auto;
          font-size: 12px;
          line-height: 1.6;
          word-break: break-all;
          white-space: pre-wrap;
          background: #fafafa;
          border-radius: 4px;
        "
        >{{ formulaModalContent }}</pre
      >
    </Modal>

    <!-- 预览 -->
    <Modal
      v-model:open="previewModalVisible"
      title="预览"
      :footer="null"
      :width="'100vw'"
      wrap-class-name="config-fullscreen-modal"
      :style="{ top: 0, paddingBottom: 0 }"
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
        "
      >
        <div
          style="
            padding: 12px 16px;
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
          "
        >
          <Space size="large" wrap>
            <span
              ><strong>出厂编号：</strong>{{ previewRecord?.[pkColumn] }}</span
            >
            <span
              ><strong>阀门名称：</strong>{{ previewRecord?.阀门名称 }}</span
            >
            <span
              ><strong>产品规格：</strong>{{ previewRecord?.产品规格 }}</span
            >
            <span
              ><strong>阀门型号：</strong>{{ previewRecord?.阀门型号 }}</span
            >
          </Space>
        </div>

        <div style="flex: 1; padding: 16px; overflow: auto">
          <div
            style="
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            "
          >
            <div
              v-for="col in schema"
              :key="col.ColumnName"
              style="
                padding: 10px 12px;
                background: #fafafa;
                border: 1px solid #f0f0f0;
                border-radius: 4px;
              "
            >
              <div style="margin-bottom: 4px; font-size: 12px; color: #888">
                {{ col.ColumnName }}
              </div>
              <div style="font-size: 14px; word-break: break-all">
                {{ previewRecord?.[col.ColumnName] ?? '-' }}
              </div>
            </div>
          </div>
        </div>

        <div
          style="
            padding: 12px;
            text-align: right;
            border-top: 1px solid #f0f0f0;
          "
        >
          <Space
            ><Button @click="previewModalVisible = false">关闭</Button></Space
          >
        </div>
      </div>
    </Modal>

    <!-- 高级查询 -->
    <Modal
      v-model:open="advQueryVisible"
      title="高级查询"
      :footer="null"
      width="560px"
    >
      <Form layout="vertical">
        <FormItem label="查询选项">
          <Select
            v-model:value="advancedQuery.column"
            placeholder="请选择要查询的列"
            style="width: 100%"
            allow-clear
            show-search
            option-filter-prop="children"
          >
            <SelectOption
              v-for="col in schema"
              :key="col.ColumnName"
              :value="col.ColumnName"
              >{{ col.ColumnName }}</SelectOption
            >
          </Select>
        </FormItem>

        <FormItem label="查询内容">
          <TextArea
            v-model:value="advancedQuery.keyword"
            :rows="3"
            placeholder="请输入查询内容（支持模糊匹配）"
            style="width: 100%"
          />
        </FormItem>

        <div style="margin-top: 16px; text-align: right">
          <Space>
            <Button @click="advQueryVisible = false">取消</Button>
            <Button @click="resetAdvQuery">重置</Button>
            <Button type="primary" @click="submitAdvQuery">高级检索</Button>
          </Space>
        </div>
      </Form>
    </Modal>

    <!-- 新增产品 -->
    <Modal
      v-model:open="productModalVisible"
      title="新增产品"
      :confirm-loading="productSaving"
      width="600px"
      ok-text="确定"
      cancel-text="取消"
      @ok="submitProduct"
    >
      <TextArea
        v-model:value="productText"
        :rows="8"
        placeholder="请输入产品内容（可换行）"
        style="width: 100%"
      />
    </Modal>

    <!-- 新增项目 -->
    <Modal
      v-model:open="projectModalVisible"
      title="新增项目"
      :confirm-loading="projectSaving"
      width="800px"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitProject"
    >
      <Form :model="projectModel" layout="vertical">
        <FormItem
          v-for="col in schema.filter((c) => !c.IsIdentity)"
          :key="col.ColumnName"
          :label="col.ColumnName"
          style="margin-bottom: 2px"
        >
          <InputNumber
            v-if="isNumberType(col.DataType)"
            v-model:value="projectModel[col.ColumnName]"
            style="width: 100%"
          />
          <TextArea
            v-else-if="isLongText(col.DataType, col.MaxLength)"
            v-model:value="projectModel[col.ColumnName]"
            :rows="3"
          />
          <Input v-else v-model:value="projectModel[col.ColumnName]" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 导出 -->
    <Modal
      v-model:open="exportModalVisible"
      title="导出设计书"
      :confirm-loading="exporting"
      width="480px"
      ok-text="导出"
      cancel-text="取消"
      @ok="submitExport"
    >
      <div style="padding: 8px 0">
        <div style="margin-bottom: 12px; color: #666">请选择导出格式：</div>
        <Radio.Group v-model:value="exportFormat">
          <Radio value="xlsx">XLSX（Excel）</Radio>
          <Radio value="pdf">PDF</Radio>
        </Radio.Group>
      </div>
    </Modal>

    <!-- 编辑 -->
    <Modal
      v-model:open="editModalVisible"
      title="编辑"
      :confirm-loading="editSaving"
      width="900px"
      ok-text="保存"
      cancel-text="取消"
      wrap-class-name="edit-compact-modal"
      @ok="submitEdit"
    >
      <Form :model="editModel" layout="vertical">
        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px"
        >
          <FormItem
            v-for="col in schema.filter((c) => !c.IsIdentity)"
            :key="col.ColumnName"
            :label="col.ColumnName"
            style="margin-bottom: 4px"
          >
            <InputNumber
              v-if="isNumberType(col.DataType)"
              v-model:value="editModel[col.ColumnName]"
              style="width: 100%"
              size="small"
            />
            <TextArea
              v-else-if="isLongText(col.DataType, col.MaxLength)"
              v-model:value="editModel[col.ColumnName]"
              :rows="2"
              size="small"
            />
            <Input
              v-else
              v-model:value="editModel[col.ColumnName]"
              size="small"
            />
          </FormItem>
        </div>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
:deep(.config-fullscreen-modal) {
  top: 0 !important;
  max-width: 100vw;
  padding-bottom: 0 !important;
}

:deep(.config-fullscreen-modal .ant-modal) {
  top: 0;
  width: 100vw !important;
  max-width: 100vw;
  padding-bottom: 0;
  margin: 0;
}

:deep(.config-fullscreen-modal .ant-modal-content) {
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-radius: 0;
}

.config-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.config-tabs :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow: auto;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-top: none;
}

.config-tabs :deep(.ant-tabs-content) {
  height: 100%;
}

.config-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
}

.config-tabs :deep(.ant-card-head) {
  min-height: 28px;
  padding: 0 12px;
  font-size: 13px;
}

.config-tabs :deep(.ant-card-head-title) {
  padding: 6px 0;
  font-size: 13px;
}

.config-tabs :deep(.ant-card-body) {
  padding: 8px 12px;
}

.config-tabs :deep(.ant-form-item) {
  margin-bottom: 4px;
}

.config-tabs :deep(.ant-form-item-label) {
  padding-bottom: 0;
  line-height: 1;
}

.config-tabs :deep(.ant-form-item-label > label) {
  height: 18px;
  font-size: 12px;
  line-height: 18px;
}

.config-tabs :deep(.ant-input),
.config-tabs :deep(.ant-input-affix-wrapper),
.config-tabs :deep(.ant-select-single),
.config-tabs :deep(.ant-select-single .ant-select-selector) {
  height: 22px !important;
  font-size: 12px;
}

.config-tabs
  :deep(.ant-select-single .ant-select-selector .ant-select-selection-item),
.config-tabs
  :deep(
    .ant-select-single .ant-select-selector .ant-select-selection-placeholder
  ) {
  font-size: 12px;
  line-height: 20px !important;
}

.config-tabs :deep(.ant-select-single .ant-select-arrow) {
  top: 50%;
  margin-top: -5px;
  font-size: 10px;
}

.config-tabs :deep(.ant-input) {
  padding: 0 6px;
  line-height: 20px;
}

.config-tabs :deep(textarea.ant-input) {
  height: auto !important;
  padding: 2px 6px;
  line-height: 18px;
}

.config-tabs :deep(.ant-input-number) {
  height: 22px !important;
  font-size: 12px;
}

.config-tabs :deep(.ant-input-number-input) {
  height: 20px !important;
  font-size: 12px;
  line-height: 20px !important;
}

.config-tabs :deep(.ant-space) {
  gap: 12px !important;
}

.config-tabs :deep(.ant-checkbox-wrapper) {
  margin-right: 12px;
  font-size: 12px;
}

.config-tabs :deep(.ant-checkbox) {
  top: 2px;
}

.config-tabs :deep([style*='grid-template-columns']) {
  gap: 8px 12px !important;
}

/* 表格撑满容器 */
.config-tabs :deep(.ant-table-wrapper) {
  height: 100%;
}

.config-tabs :deep(.ant-spin-nested-loading) {
  height: 100%;
}

.config-tabs :deep(.ant-spin-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-tabs :deep(.ant-table) {
  flex: 1;
  min-height: 0;
}

.config-tabs :deep(.ant-table-container) {
  height: 100%;
}

.ellipsis-1-line {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  line-clamp: 1; 
  white-space: nowrap;
  -webkit-box-orient: vertical;
}

.ellipsis-2-lines {
  display: -webkit-box;
  max-height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2; 
  line-height: 1.4;
  word-break: break-all;
  -webkit-box-orient: vertical;
}
</style>

<style>
.formula-tooltip .ant-tooltip-inner {
  max-width: 600px;
  max-height: 400px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}

.edit-compact-modal .ant-modal-body {
  padding: 6px 12px;
}

.edit-compact-modal .ant-form-item {
  padding: 0 !important;
  margin-bottom: 4px !important;
}

.edit-compact-modal .ant-form-item-label {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1 !important;
}

.edit-compact-modal .ant-form-item-label > label {
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 12px !important;
  line-height: 16px !important;
}

.edit-compact-modal .ant-form-item-label > label::after {
  display: none !important;
}

.edit-compact-modal .ant-form-item-control,
.edit-compact-modal .ant-form-item-control-input {
  min-height: 0 !important;
}

.edit-compact-modal .ant-form-item-row {
  display: block !important;
}

.edit-compact-modal .ant-input,
.edit-compact-modal .ant-input-affix-wrapper,
.edit-compact-modal .ant-input-number {
  height: 22px !important;
  min-height: 22px !important;
  padding: 0 6px !important;
  font-size: 12px !important;
  line-height: 22px !important;
}

.edit-compact-modal .ant-input-number-input {
  height: 20px !important;
  padding: 0 4px !important;
  font-size: 12px !important;
  line-height: 20px !important;
}

.edit-compact-modal .ant-input-number-handler-wrap {
  display: none !important;
}

.edit-compact-modal textarea.ant-input {
  height: auto !important;
  min-height: 32px !important;
  padding: 2px 6px !important;
  line-height: 16px !important;
}

.edit-compact-modal .ant-form > div {
  gap: 4px 12px !important;
}
</style>
