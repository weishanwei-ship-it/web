<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import * as XLSX from 'xlsx';
import {
  Button,
  Card,
  Empty,
  InputSearch,
  Modal,
  Progress,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from 'ant-design-vue';
import {
  CopyOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';

import { DataApi } from '#/api/core/data';

// ============================================================
// 状态
// ============================================================
const loading = ref(false);
const allRows = ref<any[]>([]);
const selectedProduct = ref<string>('');
const productKeyword = ref('');
const paramKeyword = ref('');

// 导入
const importing = ref(false);
const importProgress = ref({ current: 0, total: 0, text: '' });
const fileInputRef = ref<HTMLInputElement | null>(null);

// ============================================================
// 左侧：产品列表
// ============================================================
const productList = computed(() => {
  const map = new Map<string, number>();
  for (const r of allRows.value) {
    const code = String(r.产品编码 || '').trim();
    if (!code) continue;
    map.set(code, (map.get(code) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([code, count]) => ({ code, count }))
    .toSorted((a, b) => a.code.localeCompare(b.code));
});

const filteredProductList = computed(() => {
  const kw = productKeyword.value.trim().toLowerCase();
  if (!kw) return productList.value;
  return productList.value.filter((p) => p.code.toLowerCase().includes(kw));
});

// ============================================================
// 右侧：参数列表
// ============================================================
const currentParams = computed(() => {
  if (!selectedProduct.value) return [];
  return allRows.value
    .filter((r) => r.产品编码 === selectedProduct.value)
    .toSorted((a, b) => (a.排序 || 0) - (b.排序 || 0));
});

const filteredParams = computed(() => {
  const kw = paramKeyword.value.trim().toLowerCase();
  if (!kw) return currentParams.value;
  return currentParams.value.filter((r) =>
    [r.参数编码, r.计算内容, r.符号, r.单位, r.值]
      .map((v) => String(v ?? '').toLowerCase())
      .some((v) => v.includes(kw)),
  );
});

const paramColumns = [
  {
    title: '参数编码',
    dataIndex: '参数编码',
    key: '参数编码',
    width: 120,
    fixed: 'left',
  },
  {
    title: '计算内容',
    dataIndex: '计算内容',
    key: '计算内容',
    width: 220,
    ellipsis: true,
  },
  { title: '符号', dataIndex: '符号', key: '符号', width: 90, align: 'center' },
  { title: '单位', dataIndex: '单位', key: '单位', width: 90, align: 'center' },
  { title: '值', dataIndex: '值', key: '值', width: 200 },
  { title: '操作', key: 'action', width: 70, align: 'center', fixed: 'right' },
];

// ============================================================
// 加载
// ============================================================
async function loadAll() {
  loading.value = true;
  try {
    const BATCH = 2000;
    let page = 1;
    const all: any[] = [];

    // 后端 pageSize 上限 2000，分批拉取
    while (true) {
      const res = await DataApi.getList('设计给定', page, BATCH);
      const items = res.items || [];
      all.push(...items);

      if (items.length < BATCH) break;
      page += 1;
      if (page > 20) break; // 安全上限
    }

    allRows.value = all;

    if (all.length > 0 && !selectedProduct.value) {
      selectedProduct.value = String(all[0].产品编码 || '');
    }
  } catch (e: any) {
    console.error(e);
    message.error('加载失败：' + (e?.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

// ============================================================
// 工具
// ============================================================
function selectProduct(code: string) {
  selectedProduct.value = code;
  paramKeyword.value = '';
}

async function copyValue(v: any) {
  const text = String(v ?? '');
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    message.success(`已复制：${text}`);
  } catch {
    message.error('复制失败');
  }
}

/** X001N010 → 10010 */
function orderOfParam(code: string): number {
  const m = code.match(/^X(\d{3})N(\d+)$/i);
  if (!m) return 999999;
  return parseInt(m[1]!, 10) * 10000 + parseInt(m[2]!, 10);
}

// ============================================================
// 导入 Excel
// ============================================================
function handleImportClick() {
  fileInputRef.value?.click();
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    // 1. 解析 Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const { records, products, paramCount } = parseDesignGivenExcel(workbook);

    if (records.length === 0) {
      message.error('未解析到任何有效数据，请检查 Excel 格式');
      return;
    }

    // 2. 二次确认
    const ok = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: '确认导入',
        content:
          `共解析到 ${products.length} 个产品、${paramCount} 个参数列，` +
          `合计 ${records.length} 条记录。\n\n` +
          `导入将【覆盖】这 ${products.length} 个产品的旧数据，是否继续？`,
        okText: '开始导入',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!ok) return;

    // 3. 开始导入
    importing.value = true;
    importProgress.value = {
      current: 0,
      total: products.length,
      text: '准备中…',
    };

    // 按产品分组
    const byProduct = new Map<string, any[]>();
    for (const rec of records) {
      const list = byProduct.get(rec.产品编码) || [];
      list.push(rec);
      byProduct.set(rec.产品编码, list);
    }

    let done = 0;
    for (const [product, list] of byProduct) {
      importProgress.value.text = `处理产品 ${product}（${done + 1}/${products.length}）`;

      // 3.1 删除该产品旧数据
      try {
        await DataApi.deleteByField('设计给定', '产品编码', [product]);
      } catch (err: any) {
        console.warn(`删除旧数据失败（${product}）:`, err);
        // 继续导入，可能是首次导入
      }

      // 3.2 分批插入
      const BATCH = 1000;
      for (let i = 0; i < list.length; i += BATCH) {
        const chunk = list.slice(i, i + BATCH);
        await DataApi.batchImport('设计给定', chunk);
      }

      done += 1;
      importProgress.value.current = done;
    }

    importProgress.value.text = '导入完成，刷新数据中…';
    message.success(
      `导入完成：${products.length} 个产品 / ${records.length} 条记录`,
    );

    // 4. 刷新
    await loadAll();
  } catch (err: any) {
    console.error('[导入] 失败:', err);
    message.error('导入失败：' + (err?.message || '未知错误'), 8);
  } finally {
    importing.value = false;
    importProgress.value = { current: 0, total: 0, text: '' };
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

function parseDesignGivenExcel(workbook: XLSX.WorkBook) {
  // ★ 默认取第一个 sheet
  const ws = workbook.Sheets[workbook.SheetNames[0]!];

  const rows: any[][] = XLSX.utils.sheet_to_json(ws!, {
    header: 1,
    defval: null,
    raw: true,
    blankrows: false,
  });

  if (rows.length < 7) {
    throw new Error('Excel 结构不符：至少需要 7 行');
  }

  const codeRow = rows[2] || []; // 参数编码  X001N003...
  const nameRow = rows[3] || []; // 计算内容  公称压力...
  const symbolRow = rows[4] || []; // 符号      P...
  const unitRow = rows[5] || []; // 单位      MPa...

  // 参数列：从 AE 列（idx=30）起，第 3 行有 X00xNxxx 编码
  const PARAM_START = 30;
  const paramCols: number[] = [];
  for (let c = PARAM_START; c < codeRow.length; c++) {
    const code = String(codeRow[c] || '')
      .trim()
      .replace(/^\*/, '');
    if (/^X\d{3}N\d+$/i.test(code)) {
      paramCols.push(c);
    }
  }

  if (paramCols.length === 0) {
    throw new Error('未找到参数列（AE 列起应有 X00xNxxx 编码）');
  }

  // ★ 用 Map 去重（防止 Excel 里 X006N003 之类重复出现）
  const recordMap = new Map<string, any>();
  const productSet = new Set<string>();
  const duplicateLog: string[] = [];

  for (let r = 6; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const productCode = String(row[0] || '').trim(); // A 列
    if (productCode.startsWith('=')) {
      throw new Error(
        `A 列（产品编码）读到的是公式：${productCode}\n` +
          `请在 Excel 里：选中 A 列 → 复制 → 右键 → 选择性粘贴 → 值，保存后再导入`,
      );
    }
    if (!productCode) continue;

    productSet.add(productCode);

    for (const c of paramCols) {
      const code = String(codeRow[c]).trim().replace(/^\*/, '');
      const name = nameRow[c] != null ? String(nameRow[c]).trim() : null;
      const symbol = symbolRow[c] != null ? String(symbolRow[c]).trim() : null;
      const unit = unitRow[c] != null ? String(unitRow[c]).trim() : null;
      const raw = row[c];
      const value = raw == null || raw === '' ? null : String(raw);

      const key = `${productCode}|${code}`;
      if (recordMap.has(key)) {
        // 重复：只补空字段，不覆盖已有值
        const prev = recordMap.get(key)!;
        if (prev.值 == null && value != null) prev.值 = value;
        if (prev.计算内容 == null && name != null) prev.计算内容 = name;
        if (prev.符号 == null && symbol != null) prev.符号 = symbol;
        if (prev.单位 == null && unit != null) prev.单位 = unit;

        duplicateLog.push(`${productCode} / ${code}`);
        continue;
      }

      recordMap.set(key, {
        产品编码: productCode,
        参数编码: code,
        计算内容: name,
        符号: symbol,
        单位: unit,
        值: value,
        排序: orderOfParam(code),
      });
    }
  }

  if (duplicateLog.length > 0) {
    console.warn(
      `[导入] 检测到 ${duplicateLog.length} 个重复的 (产品编码, 参数编码)：`,
      duplicateLog,
    );
  }

  return {
    records: Array.from(recordMap.values()),
    products: Array.from(productSet),
    paramCount: paramCols.length,
    duplicateCount: duplicateLog.length,
  };
}

// ============================================================
// 生命周期
// ============================================================
onMounted(loadAll);
</script>

<template>
  <div style="padding: 16px">
    <Card title="设计给定" :body-style="{ padding: 0 }">
      <template #extra>
        <Space>
          <span style="font-size: 12px; color: #888">
            共 {{ productList.length }} 个产品 / {{ allRows.length }} 条参数
          </span>
          <Button :loading="loading" @click="loadAll">
            <ReloadOutlined />刷新
          </Button>
          <Button
            type="primary"
            :loading="importing"
            @click="handleImportClick"
          >
            <UploadOutlined />导入 Excel
          </Button>
        </Space>
      </template>

      <!-- 导入进度 -->
      <div
        v-if="importing"
        style="
          padding: 8px 16px;
          background: #e6f4ff;
          border-bottom: 1px solid #91caff;
        "
      >
        <div style="margin-bottom: 4px; font-size: 12px; color: #1677ff">
          {{ importProgress.text }}
        </div>
        <Progress
          :percent="
            importProgress.total > 0
              ? Math.round(
                  (importProgress.current / importProgress.total) * 100,
                )
              : 0
          "
          size="small"
          :show-info="false"
        />
      </div>

      <Spin :spinning="loading">
        <div style="display: flex; height: calc(100vh - 200px)">
          <!-- 左侧产品列表 -->
          <div
            style="
              display: flex;
              flex-shrink: 0;
              flex-direction: column;
              width: 280px;
              border-right: 1px solid #f0f0f0;
            "
          >
            <div style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0">
              <InputSearch
                v-model:value="productKeyword"
                placeholder="搜索产品编码"
                allow-clear
                size="small"
              />
            </div>

            <div style="flex: 1; padding: 6px; overflow-y: auto">
              <div
                v-for="p in filteredProductList"
                :key="p.code"
                :style="{
                  padding: '8px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  background:
                    selectedProduct === p.code ? '#e6f4ff' : 'transparent',
                  color: selectedProduct === p.code ? '#1677ff' : '#333',
                  fontWeight: selectedProduct === p.code ? 600 : 400,
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }"
                @click="selectProduct(p.code)"
              >
                <span style="flex: 1">{{ p.code }}</span>
                <Tag color="blue" style="margin: 0; font-size: 10px">
                  {{ p.count }}
                </Tag>
              </div>

              <Empty
                v-if="filteredProductList.length === 0"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="暂无产品"
                style="margin-top: 40px"
              />
            </div>
          </div>

          <!-- 右侧参数表格 -->
          <div
            style="display: flex; flex: 1; flex-direction: column; min-width: 0"
          >
            <div
              style="
                display: flex;
                gap: 12px;
                align-items: center;
                padding: 10px 14px;
                background: #fafafa;
                border-bottom: 1px solid #f0f0f0;
              "
            >
              <div style="flex: 1; min-width: 0">
                <div style="font-size: 11px; color: #888">当前产品</div>
                <div
                  style="
                    font-family: Consolas, Monaco, monospace;
                    font-size: 13px;
                    font-weight: 600;
                    color: #1677ff;
                    word-break: break-all;
                  "
                >
                  {{ selectedProduct || '-' }}
                </div>
              </div>

              <InputSearch
                v-model:value="paramKeyword"
                placeholder="搜索参数编码 / 计算内容 / 符号 / 单位 / 值"
                allow-clear
                style="width: 340px"
              />
            </div>

            <div style="flex: 1; overflow: hidden">
              <Table
                :columns!="paramColumns"
                :data-source="filteredParams"
                :pagination="false"
                :scroll="{ y: 'calc(100vh - 330px)', x: 720 }"
                size="small"
                bordered
                :row-key="(r: any) => r.Id || r.参数编码"
                :loading="loading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === '参数编码'">
                    <span
                      style="
                        font-family: Consolas, Monaco, monospace;
                        color: #722ed1;
                      "
                    >
                      {{ record.参数编码 }}
                    </span>
                  </template>

                  <template v-else-if="column.key === '符号'">
                    <Tag color="geekblue" style="margin: 0">
                      {{ record.符号 || '-' }}
                    </Tag>
                  </template>

                  <template v-else-if="column.key === '单位'">
                    <span style="color: #888">{{ record.单位 || '-' }}</span>
                  </template>

                  <template v-else-if="column.key === '值'">
                    <Tooltip :title="String(record.值 ?? '')">
                      <span style="font-weight: 600">{{
                        record.值 ?? '-'
                      }}</span>
                    </Tooltip>
                  </template>

                  <template v-else-if="column.key === 'action'">
                    <Button
                      type="link"
                      size="small"
                      @click="copyValue(record.值)"
                    >
                      <CopyOutlined />
                    </Button>
                  </template>
                </template>
              </Table>
            </div>

            <div
              style="
                display: flex;
                justify-content: space-between;
                padding: 6px 14px;
                font-size: 12px;
                color: #888;
                background: #fafafa;
                border-top: 1px solid #f0f0f0;
              "
            >
              <span>
                当前产品参数：{{ currentParams.length }} 条
                <span v-if="paramKeyword">
                  / 过滤后：{{ filteredParams.length }} 条</span
                >
              </span>
              <span>按【排序】列展示</span>
            </div>
          </div>
        </div>
      </Spin>
    </Card>

    <!-- 隐藏的 file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
:deep(.ant-table-tbody > tr > td) {
  padding: 4px 8px !important;
  font-size: 12px;
}

:deep(.ant-table-thead > tr > th) {
  padding: 6px 8px !important;
  font-size: 12px;
  background: #fafafa !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
