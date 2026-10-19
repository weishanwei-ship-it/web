<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import * as XLSX from 'xlsx';

import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { SettingOutlined } from '@ant-design/icons-vue';
import { DataApi } from '#/api/core/data';
import type { ColumnInfo } from '#/api/core/data';

const hasValue = (record: any, column: any) => {
  const val = record[column?.dataIndex as string];
  return val !== null && val !== undefined && val !== '';
};

const getColor = (record: any, column: any) => {
  const val = record[column?.dataIndex as string];
  return statusColor(val); // 你的原有方法
};

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const DescriptionsItem = Descriptions.Item;

const route = useRoute();

// 从路由 meta 拿真实表名
const tableName = computed(() => (route.meta?.table as string) || '');
const pageTitle = computed(() => String(route.meta?.title || '数据管理'));

// ---------- 表结构 ----------
const schema = ref<ColumnInfo[]>([]);

// ---------- 主键 ----------
const primaryKey = computed(
  () => schema.value.find((c) => c.IsPrimaryKey)?.ColumnName || 'Id',
);

// ---------- 表格数据 ----------
const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const pagination = reactive({ current: 1, pageSize: 20 });

// ---------- 弹窗 ----------
const modalVisible = ref(false);
const modalTitle = ref('新增');
const formModel = reactive<Record<string, any>>({});
const editingId = ref<any>(null);
const saving = ref(false);

// ---------- 导入相关 ----------
const importing = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ============================================================
// 类型判断
// ============================================================
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

function isLongText(dt: string, maxLen?: number) {
  const t = (dt || '').toLowerCase();
  return t === 'text' || t === 'ntext' || (maxLen || 0) > 500;
}

function isDateTimeType(dt: string) {
  const t = (dt || '').toLowerCase();
  return (
    t.includes('date') ||
    t.includes('time') ||
    t === 'datetime' ||
    t === 'datetime2' ||
    t === 'smalldatetime'
  );
}

// ============================================================
// 列宽估算
// ============================================================
function estimateColumnWidth(col: ColumnInfo): number {
  const name = col.ColumnName;
  const dt = (col.DataType || '').toLowerCase();

  if (col.IsPrimaryKey) return 80;
  if (name.includes('状态')) return 100;
  if (name.endsWith('ID') || name.endsWith('Id') || name.endsWith('编号'))
    return 90;
  if (isDateTimeType(dt)) return 170;
  if (isNumberType(dt)) return 100;
  if (isLongText(dt, col.MaxLength)) return 240;
  if (name.includes('代码') || name.includes('代号')) return 130;
  if (name.includes('名称')) return 200;
  if (name.includes('说明') || name.includes('备注')) return 200;
  if (name.includes('编码')) return 200;
  const len = col.MaxLength || 50;
  return Math.min(Math.max(len * 8, 100), 220);
}

// ============================================================
// 状态列 Tag 颜色
// ============================================================
function statusColor(value: any) {
  if (value === null || value === undefined || value === '') return 'default';
  const s = String(value);
  if (/现行|有效|启用|合格|正常/.test(s)) return 'green';
  if (/作废|废止|停用|不合格/.test(s)) return 'default';
  if (/即将|待|草稿/.test(s)) return 'blue';
  if (/重新审定|审核|复核/.test(s)) return 'orange';
  return 'default';
}

// ============================================================
// 列显隐
// ============================================================
const checkedKeys = ref<string[]>([]);

const allColumnKeys = computed(() => schema.value.map((c) => c.ColumnName));

watch(
  schema,
  (val) => {
    if (val && val.length > 0 && checkedKeys.value.length === 0) {
      checkedKeys.value = val.map((c) => c.ColumnName);
    }
  },
  { immediate: true },
);

const checkAll = computed(
  () =>
    allColumnKeys.value.length > 0 &&
    checkedKeys.value.length === allColumnKeys.value.length,
);

const indeterminate = computed(
  () =>
    checkedKeys.value.length > 0 &&
    checkedKeys.value.length < allColumnKeys.value.length,
);

function handleCheckAll(e: any) {
  checkedKeys.value = e.target.checked ? [...allColumnKeys.value] : [];
}

// ============================================================
// 列宽状态 + 持久化
// ============================================================
const columnWidths = ref<Record<string, number>>({});

const COL_WIDTH_STORAGE_KEY = computed(() => `col_width_${tableName.value}`);

function initColumnWidths() {
  const saved = localStorage.getItem(COL_WIDTH_STORAGE_KEY.value);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 只保留当前 schema 里存在的字段
      const validNames = new Set(schema.value.map((c) => c.ColumnName));
      const filtered: Record<string, number> = {};
      Object.keys(parsed).forEach((k) => {
        if (validNames.has(k)) filtered[k] = parsed[k];
      });
      // 补齐 schema 里新增但没存的字段
      schema.value.forEach((c) => {
        if (filtered[c.ColumnName] === null) {
          filtered[c.ColumnName] = estimateColumnWidth(c);
        }
      });
      columnWidths.value = filtered;
      return;
    } catch {
      // 解析失败就走默认
    }
  }

  const widths: Record<string, number> = {};
  schema.value.forEach((c) => {
    widths[c.ColumnName] = estimateColumnWidth(c);
  });
  columnWidths.value = widths;
}

function persistColumnWidths() {
  try {
    localStorage.setItem(
      COL_WIDTH_STORAGE_KEY.value,
      JSON.stringify(columnWidths.value),
    );
  } catch {
    // 忽略
  }
}

function resetColumnWidths() {
  localStorage.removeItem(COL_WIDTH_STORAGE_KEY.value);
  const widths: Record<string, number> = {};
  schema.value.forEach((c) => {
    widths[c.ColumnName] = estimateColumnWidth(c);
  });
  columnWidths.value = widths;
}

// ============================================================
// 拖拽
// ============================================================
let dragColKey: string | null = null;
let dragStartX = 0;
let dragStartWidth = 0;

function onResizeStart(colKey: string, e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  dragColKey = colKey;
  dragStartX = e.clientX;
  dragStartWidth = columnWidths.value[colKey] || 120;
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function onResizeMove(e: MouseEvent) {
  if (!dragColKey) return;
  const delta = e.clientX - dragStartX;
  const newWidth = Math.max(60, dragStartWidth + delta);
  columnWidths.value = { ...columnWidths.value, [dragColKey]: newWidth };
}

function onResizeEnd() {
  dragColKey = null;
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  persistColumnWidths();
}

function onResizeDblClick(colKey: string) {
  const col = schema.value.find((c) => c.ColumnName === colKey);
  if (!col) return;
  const newWidth = Math.min(400, Math.max(80, col.ColumnName.length * 14 + 40));
  columnWidths.value = { ...columnWidths.value, [colKey]: newWidth };
  persistColumnWidths();
}

// ============================================================
// 表格列定义
// ============================================================
const tableColumns = computed(() => {
  const cols: any[] = schema.value
    .filter((c) => checkedKeys.value.includes(c.ColumnName))
    .map((c) => ({
      title: c.ColumnName,
      dataIndex: c.ColumnName,
      key: c.ColumnName,
      width: columnWidths.value[c.ColumnName] || estimateColumnWidth(c),
      ellipsis: true,
      fixed: c.IsPrimaryKey ? 'left' : undefined,
      _isStatus: c.ColumnName.includes('状态'),
      _isPrimary: c.IsPrimaryKey,
    }));

  cols.push({
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  });

  return cols;
});

// ============================================================
// 横向滚动
// ============================================================
const tableScrollX = computed(() => {
  const totalWidth = tableColumns.value.reduce(
    (sum, col) => sum + (col.width || 120),
    0,
  );
  return totalWidth > 1200 ? totalWidth : undefined;
});

// ============================================================
// 加载 schema
// ============================================================
async function loadSchema() {
  if (!tableName.value) return;
  schema.value = await DataApi.getSchema(tableName.value);
  checkedKeys.value = schema.value.map((c) => c.ColumnName);
  initColumnWidths();
}

// ============================================================
// 加载数据
// ============================================================
async function loadData() {
  if (!tableName.value) return;
  loading.value = true;
  try {
    const res = await DataApi.getList(
      tableName.value,
      pagination.current,
      pagination.pageSize,
    );
    rows.value = res.items;
    total.value = res.total;
  } catch (e: any) {
    console.error('加载数据失败:', e);
  } finally {
    loading.value = false;
  }
}

// ============================================================
// 新增
// ============================================================
function handleAdd() {
  editingId.value = null;
  modalTitle.value = '新增';
  Object.keys(formModel).forEach((k) => delete formModel[k]);
  schema.value.forEach((col) => {
    if (col.IsIdentity) return;
    formModel[col.ColumnName] = isNumberType(col.DataType) ? null : '';
  });
  modalVisible.value = true;
}

// ============================================================
// 编辑
// ============================================================
function handleEdit(record: any) {
  editingId.value = record[primaryKey.value];
  modalTitle.value = '编辑';
  Object.keys(formModel).forEach((k) => delete formModel[k]);
  schema.value.forEach((col) => {
    if (col.IsIdentity) return;
    formModel[col.ColumnName] = record[col.ColumnName];
  });
  modalVisible.value = true;
}

// ============================================================
// 保存
// ============================================================
async function handleSave() {
  saving.value = true;
  try {
    if (editingId.value === null) {
      await DataApi.create(tableName.value, { ...formModel });
      alert('新增成功');
    } else {
      await DataApi.update(tableName.value, editingId.value, { ...formModel });
      alert('更新成功');
    }
    modalVisible.value = false;
    loadData();
  } catch (e: any) {
    alert(e?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

// ============================================================
// 删除
// ============================================================
async function handleDelete(record: any) {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await DataApi.remove(tableName.value, record[primaryKey.value]);
    alert('删除成功');
    loadData();
  } catch (e: any) {
    alert(e?.message || '删除失败');
  }
}

// ============================================================
// 分页
// ============================================================
function onTableChange(p: any) {
  pagination.current = p.current;
  pagination.pageSize = p.pageSize;
  loadData();
}

// ============================================================
// 下载导入模板
// ============================================================
function downloadTemplate() {
  const headers = schema.value
    .filter((c) => !c.IsIdentity)
    .map((c) => c.ColumnName);

  const sampleRow = headers.map((h) => {
    const col = schema.value.find((c) => c.ColumnName === h);
    if (!col) return '';
    if (isNumberType(col.DataType)) return 1;
    return `示例${h}`;
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  XLSX.writeFile(wb, `${pageTitle.value}_导入模板.xlsx`);
}

// ============================================================
// 触发文件选择
// ============================================================
function handleImportClick() {
  fileInputRef.value?.click();
}

// ============================================================
// Excel 导入
// ============================================================
async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  importing.value = true;
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // ★ 多工作表时让用户显式选择（此前静默读第一个表，选错文件/表会导错数据）
    let sheetName = workbook.SheetNames[0]!;
    if (workbook.SheetNames.length > 1) {
      const pick = prompt(
        `该 Excel 包含 ${workbook.SheetNames.length} 个工作表：\n` +
          workbook.SheetNames.map((n, i) => `${i + 1}. ${n}`).join('\n') +
          `\n\n请输入要导入的工作表名称（直接点确定 = 第一个）：`,
        sheetName,
      );
      if (pick === null) return;
      const chosen = pick.trim();
      if (chosen && workbook.SheetNames.includes(chosen)) {
        sheetName = chosen;
      } else if (chosen) {
        alert(
          `工作表【${chosen}】不存在，请重新导入。可选：${workbook.SheetNames.join('、')}`,
        );
        return;
      }
    }
    const sheet = workbook.Sheets[sheetName];

    const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet!, {
      defval: null,
      raw: false,
    });

    if (jsonRows.length === 0) {
      alert('Excel 没有数据行（第一行是表头，第二行开始才是数据）');
      return;
    }

    const validColumns = schema.value
      .filter((c) => !c.IsIdentity)
      .map((c) => c.ColumnName);

    const excelHeaders = Object.keys(jsonRows[0]!).filter(
      (h) => !h.startsWith('_EMPTY') && h.trim() !== '',
    );

    const unknownHeaders = excelHeaders.filter(
      (h) => !validColumns.includes(h),
    );

    if (unknownHeaders.length > 0) {
      alert(
        `以下列在数据库中不存在：\n${unknownHeaders.join('、')}\n\n` +
          `数据库要求的列名是：\n${validColumns.join('、')}\n\n` +
          `请确保 Excel 第一行就是表头（不要标题行、不要空列），列名完全一致。\n` +
          `建议点"下载模板"重新填写。`,
      );
      return;
    }

    const cleaned = jsonRows.map((row) => {
      const out: Record<string, any> = {};
      for (const col of schema.value) {
        if (col.IsIdentity) continue;
        let v = row[col.ColumnName];
        if (v === '' || v === undefined) v = null;
        if (v !== null && isNumberType(col.DataType)) {
          const n = Number(v);
          v = Number.isNaN(n) ? null : n;
        }
        out[col.ColumnName] = v;
      }
      return out;
    });

    // ★ 导入前摘要：把"计算项分布 / 唯一编码"亮出来，选错文件能当场发现
    let summary = `工作表【${sheetName}】共读取到 ${cleaned.length} 行数据`;
    const firstRow = cleaned[0] || {};
    if ('计算项' in firstRow) {
      const dist: Record<string, number> = {};
      for (const r of cleaned) {
        const k = r['计算项'] === null ? '(空)' : String(r['计算项']);
        dist[k] = (dist[k] || 0) + 1;
      }
      summary +=
        '\n计算项分布：' +
        Object.entries(dist)
          .map(([k, v]) => `${k} × ${v}`)
          .join('，');
    }
    if ('计算页信息唯一编码' in firstRow) {
      const codes = cleaned
        .map((r) => r['计算页信息唯一编码'])
        .filter((v) => v != null && String(v).trim() !== '')
        .map((v) => String(v).trim());
      const uniq = [...new Set(codes)];
      summary += `\n唯一编码共 ${uniq.length} 个，示例：${uniq.slice(0, 6).join('、')}`;
    }
    if (!confirm(`${summary}\n\n确认导入吗？`)) return;

    const res = await DataApi.batchImport(tableName.value, cleaned);
    alert(res.message || '导入成功');
    pagination.current = 1;
    loadData();
  } catch (err: any) {
    console.error('完整错误:', err);
    console.log('response:', err?.response);
    console.log('response.data:', err?.response?.data);

    let msg = '导入失败';
    const data = err?.response?.data;
    if (typeof data === 'string') {
      msg = data;
    } else if (data?.message) {
      msg = data.message;
    } else if (data?.title) {
      msg = data.title;
    } else if (data?.errors) {
      msg = Object.values(data.errors).flat().join('\n');
    } else if (err?.message) {
      msg = err.message;
    }
    alert(msg);
  } finally {
    importing.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  await loadSchema();
  await loadData();
});

watch(
  () => route.path,
  async () => {
    pagination.current = 1;
    checkedKeys.value = [];
    columnWidths.value = {};
    await loadSchema();
    await loadData();
  },
);
</script>

<template>
  <div style="padding: 16px">
    <Card :title="pageTitle">
      <template #extra>
        <Space>
          <Button @click="downloadTemplate">下载模板</Button>
          <Button :loading="importing" @click="handleImportClick">
            批量导入 Excel
          </Button>
          <Button type="primary" @click="handleAdd">新增</Button>

          <Button @click="resetColumnWidths">重置列宽</Button>

          <!-- 列设置 -->
          <Popover trigger="click" placement="bottomRight">
            <template #content>
              <div
                style="min-width: 180px; max-height: 320px; overflow-y: auto"
              >
                <Checkbox
                  :checked="checkAll"
                  :indeterminate="indeterminate"
                  @change="handleCheckAll"
                >
                  全选
                </Checkbox>
                <Divider style="margin: 8px 0" />
                <CheckboxGroup
                  v-model:value="checkedKeys"
                  style="display: block"
                >
                  <div
                    v-for="col in schema"
                    :key="col.ColumnName"
                    style="padding: 2px 0"
                  >
                    <Checkbox :value="col.ColumnName">
                      {{ col.ColumnName }}
                    </Checkbox>
                  </div>
                </CheckboxGroup>
              </div>
            </template>
            <Button>
              <SettingOutlined />
              列设置
            </Button>
          </Popover>
        </Space>
      </template>

      <Table
        :data-source="rows"
        :columns="tableColumns"
        :loading="loading"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        :scroll="{ x: tableScrollX }"
        :row-key="primaryKey"
        size="small"
        @change="onTableChange"
      >
        <!-- 自定义表头：加拖拽手柄 -->
        <template #headerCell="{ column, title }">
          <div class="resizable-header">
            <span class="header-title">{{ title }}</span>
            <span
              v-if="column.key !== 'action'"
              class="resize-handle"
              @mousedown="onResizeStart(column.key as string, $event)"
              @dblclick="onResizeDblClick(column.key as string)"
            ></span>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <Space>
              <a @click="handleEdit(record)">编辑</a>
              <a style="color: #ff4d4f" @click="handleDelete(record)">删除</a>
            </Space>
          </template>

          <!-- 状态列：彩色 Tag -->
          <template v-else-if="(column as any)._isStatus">
            <Tag
              v-if="hasValue(record, column)"
              :color="getColor(record, column)"
            >
              {{ record[column?.dataIndex as string] }}
            </Tag>
            <span v-else>-</span>
          </template>
 
          <!-- 其他列: 截断 + Tooltip -->
          <template v-else>
            <!-- 直接在这里把值取出来，如果是 undefined 就兜底为空字符串 -->
            <template v-slot:default="{ record, column }">
              <Tooltip
                v-if="record[column?.dataIndex as string] !== null && record[column?.dataIndex as string] !== undefined && record[column?.dataIndex as string] !== ''"
                :title="String(record[column?.dataIndex as string])"
                placement="topLeft"
              >
                <span class="ellipsis-text">
                  {{ record[column?.dataIndex as string] }}
                </span>
              </Tooltip>
              <span v-else>-</span>
            </template>
          </template>
        </template>

        <!-- 行展开：显示所有字段 -->
        <template #expandedRowRender="{ record }">
          <Descriptions :column="2" size="small" bordered>
            <DescriptionsItem
              v-for="col in schema"
              :key="col.ColumnName"
              :label="col.ColumnName"
              :span="isLongText(col.DataType, col.MaxLength) ? 2 : 1"
            >
              <template v-if="col.ColumnName.includes('状态')">
                <Tag
                  v-if="
                    record[col.ColumnName] !== null &&
                    record[col.ColumnName] !== undefined &&
                    record[col.ColumnName] !== ''
                  "
                  :color="statusColor(record[col.ColumnName])"
                >
                  {{ record[col.ColumnName] }}
                </Tag>
                <span v-else>-</span>
              </template>
              <template v-else>
                {{
                  record[col.ColumnName] === null ||
                  record[col.ColumnName] === undefined ||
                  record[col.ColumnName] === ''
                    ? '-'
                    : record[col.ColumnName]
                }}
              </template>
            </DescriptionsItem>
          </Descriptions>
        </template>
      </Table>
    </Card>

    <!-- 隐藏的 file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="onFileChange"
    />

    <!-- 新增/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="saving"
      width="600px"
      @ok="handleSave"
    >
      <Form :model="formModel" layout="vertical">
        <FormItem
          v-for="col in schema.filter((c) => !c.IsIdentity)"
          :key="col.ColumnName"
          :label="col.ColumnName"
        >
          <InputNumber
            v-if="isNumberType(col.DataType)"
            v-model:value="formModel[col.ColumnName]"
            style="width: 100%"
          />
          <TextArea
            v-else-if="isLongText(col.DataType, col.MaxLength)"
            v-model:value="formModel[col.ColumnName]"
            :rows="3"
          />
          <Input v-else v-model:value="formModel[col.ColumnName]" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.resizable-header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.header-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -8px;
  bottom: 0;
  z-index: 10;
  width: 8px;
  cursor: col-resize;
  user-select: none;
}

.resize-handle:hover,
.resize-handle:active {
  background: #1677ff;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}
</style>
