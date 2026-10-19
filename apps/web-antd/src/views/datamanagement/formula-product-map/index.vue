<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  Button,
  Card,
  Input,
  Select,
  SelectOption,
  Space,
  Spin,
  message,
} from 'ant-design-vue';
import { DataApi } from '#/api/core/data';

// ============================================================
// 状态
// ============================================================
const chapters = ref<any[]>([]);
const combos = ref<any[]>([]);
const allFormulas = ref<any[]>([]);
const allMappings = ref<any[]>([]);

const currentChapter = ref<string>('');
const keyword = ref('');
const loading = ref(false);
const saving = ref(false);

const checkState = reactive<Record<string, boolean>>({});

// ============================================================
// 计算属性
// ============================================================
const formulas = computed(() =>
  allFormulas.value
    .filter((f: any) => f.章节编码 === currentChapter.value)
    .sort((a: any, b: any) => (a.章节内序号 || 0) - (b.章节内序号 || 0)),
);

const currentChapterName = computed(() => {
  const c = chapters.value.find((x) => x.章节编码 === currentChapter.value);
  return c?.章节名称 || '';
});

const filteredCombos = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return combos.value;
  return combos.value.filter((c) =>
    String(c.组合代号 || '').toLowerCase().includes(kw),
  );
});

// ============================================================
// 一次性拉全部数据
// ============================================================
async function fetchAll(table: string): Promise<any[]> {
  const all: any[] = [];
  let p = 1;
  while (p <= 50) {
    const res: any = await DataApi.getList(table, p, 500);
    const list = res.items || [];
    all.push(...list);
    if (list.length < 500) break;
    p++;
  }
  return all;
}

async function initAllData() {
  loading.value = true;
  try {
    const [ch, co, fo, ma] = await Promise.all([
      fetchAll('章节库'),
      fetchAll('产品组合'),
      fetchAll('公式库'),
      fetchAll('产品计算项映射'),
    ]);
    chapters.value = ch;
    combos.value = co;
    allFormulas.value = fo;
    allMappings.value = ma;

    if (chapters.value.length > 0 && !currentChapter.value) {
      currentChapter.value = chapters.value[0].章节编码;
    }

    const tmp: Record<string, boolean> = {};
    for (const m of allMappings.value) {
      tmp[`${m.组合ID}_${m.公式ID}`] = true;
    }
    Object.assign(checkState, tmp);
  } catch (e: any) {
    message.error('加载失败：' + (e?.message || ''));
  } finally {
    loading.value = false;
  }
}

// ============================================================
// 勾选
// ============================================================
function isChecked(comboId: number, formulaId: number) {
  return !!checkState[`${comboId}_${formulaId}`];
}

function onCheckboxChange(
  e: Event,
  comboId: number,
  formulaId: number,
) {
  const checked = (e.target as HTMLInputElement).checked;
  const key = `${comboId}_${formulaId}`;
  if (checked) checkState[key] = true;
  else delete checkState[key];
}

// ============================================================
// 批量
// ============================================================
function selectAll() {
  for (const c of filteredCombos.value) {
    for (const f of formulas.value) {
      checkState[`${c.组合ID}_${f.公式ID}`] = true;
    }
  }
  message.success('已全选当前筛选结果');
}

function clearAll() {
  for (const c of filteredCombos.value) {
    for (const f of formulas.value) {
      delete checkState[`${c.组合ID}_${f.公式ID}`];
    }
  }
  message.success('已清空当前筛选结果');
}

// ============================================================
// 保存
// ============================================================
async function handleSave() {
  if (!currentChapter.value) {
    message.warning('请先选择章节');
    return;
  }
  saving.value = true;
  try {
    const formulaIds = new Set(formulas.value.map((f: any) => f.公式ID));
    const toDelete = allMappings.value.filter((m: any) =>
      formulaIds.has(m.公式ID),
    );
    for (const m of toDelete) {
    await DataApi.removeByPk('产品计算项映射', m.映射ID);
    }
    const toInsert: any[] = [];
    for (const c of combos.value) {
      for (const f of formulas.value) {
        if (checkState[`${c.组合ID}_${f.公式ID}`]) {
          toInsert.push({ 组合ID: c.组合ID, 公式ID: f.公式ID, 是否生成: 1 });
        }
      }
    }
    if (toInsert.length > 0) {
      await DataApi.batchImport('产品计算项映射', toInsert);
    }
    message.success(`保存成功，共 ${toInsert.length} 条映射`);
    allMappings.value = await fetchAll('产品计算项映射');
  } catch (e: any) {
    message.error('保存失败：' + (e?.message || ''));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  initAllData();
});
</script>

<template>
  <div style="padding: 16px">
    <Card title="产品-公式映射维护">
      <template #extra>
        <Space>
          <Select
            v-model:value="currentChapter"
            style="width: 220px"
            placeholder="选择章节"
          >
            <SelectOption
              v-for="c in chapters"
              :key="c.章节编码"
              :value="c.章节编码"
            >
              {{ c.章节编码 }} - {{ c.章节名称 }}
            </SelectOption>
          </Select>

          <Input
            v-model:value="keyword"
            placeholder="搜索组合代号"
            style="width: 200px"
            allow-clear
          />

          <Button @click="selectAll">全选当前</Button>
          <Button @click="clearAll">清空当前</Button>

          <Button type="primary" :loading="saving" @click="handleSave">
            保存
          </Button>
        </Space>
      </template>

      <Spin :spinning="loading">
        <div v-if="formulas.length > 0" class="matrix-wrapper">
          <table class="matrix-table">
            <thead>
              <tr>
                <th colspan="8" class="corner-cell">
                  <span class="corner-text">应用产品</span>
                </th>
                <th
                  v-for="(f, idx) in formulas"
                  :key="`h1_${f.公式ID}`"
                  class="h-seq"
                >
                  {{ idx + 1 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">关键计算项</th>
                <th v-for="f in formulas" :key="`h2_${f.公式ID}`" class="h-cell h-chapter">
                  {{ currentChapterName }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">关键计算项目编码</th>
                <th v-for="f in formulas" :key="`h3_${f.公式ID}`" class="h-cell h-code">
                  {{ currentChapter }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">计算内容</th>
                <th
                  v-for="f in formulas"
                  :key="`h4_${f.公式ID}`"
                  class="h-cell h-content"
                >
                  {{ f.计算内容 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">符号</th>
                <th
                  v-for="f in formulas"
                  :key="`h5_${f.公式ID}`"
                  class="h-cell h-symbol"
                >
                  {{ f.符号 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">计算公式</th>
                <th
                  v-for="f in formulas"
                  :key="`h6_${f.公式ID}`"
                  class="h-cell h-formula"
                >
                  {{ f.计算公式 || '设计给定' }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">索引标准</th>
                <th v-for="f in formulas" :key="`h7_${f.公式ID}`" class="h-cell h-ref">
                  {{ f.索引标准 || '无' }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">单位</th>
                <th v-for="f in formulas" :key="`h8_${f.公式ID}`" class="h-cell">
                  {{ f.单位 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">计算值</th>
                <th
                  v-for="f in formulas"
                  :key="`h9_${f.公式ID}`"
                  class="h-cell h-value"
                >
                  {{ f.计算公式 && f.计算公式 !== '设计给定' ? '0.00' : '' }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">设计计算信息单项编码</th>
                <th v-for="f in formulas" :key="`h10_${f.公式ID}`" class="h-cell">
                  {{ f.单项目编码 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">设计计算信息总编码</th>
                <th v-for="f in formulas" :key="`h11_${f.公式ID}`" class="h-cell">
                  {{ f.总编码 }}
                </th>
              </tr>

              <tr>
                <th colspan="8" class="h-label">应用标准系列</th>
                <th v-for="f in formulas" :key="`h12_${f.公式ID}`" class="h-cell">
                  {{ f.应用标准系列 || 'API/TSG' }}
                </th>
              </tr>

             <tr>
                <th colspan="8" class="h-label">备注1: 计算值输出格式</th>
                <th v-for="f in formulas" :key="`h13_${f.公式ID}`" class="h-cell">
                    {{ f.备注1_输出格式 || '常规' }}
                </th>
                </tr>
                <tr>
                <th colspan="8" class="h-label">备注2: 数据引入来源</th>
                <th v-for="f in formulas" :key="`h14_${f.公式ID}`" class="h-cell">
                    {{ f.备注2_数据来源 || '' }}
                </th>
                </tr>
                <tr>
                <th colspan="8" class="h-label">备注3: 数据输出位置</th>
                <th v-for="f in formulas" :key="`h15_${f.公式ID}`" class="h-cell"></th>
                </tr>
                <tr>
                <th colspan="8" class="h-label">备注4: 尺寸确认与结果更新循环节点</th>
                <th v-for="f in formulas" :key="`h16_${f.公式ID}`" class="h-cell"></th>
                </tr>

              <tr class="col-title-row">
                <th class="pt-seq">序号</th>
                <th class="pt-combo">组合代号</th>
                <th class="pt-model">阀门型号</th>
                <th class="pt-blank">阀体毛坯类型</th>
                <th class="pt-jacket">夹套形式</th>
                <th class="pt-cover">阀盖形式</th>
                <th class="pt-std">执行标准</th>
                <th class="pt-flow">流向代号</th>
                <th v-for="f in formulas" :key="`h18_${f.公式ID}`" class="h-cell"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(c, idx) in filteredCombos"
                :key="c.组合ID"
                class="data-row"
              >
                <td class="pt-seq sticky-col">{{ idx + 1 }}</td>
                <td class="pt-combo sticky-col">{{ c.组合代号 }}</td>
                <td class="pt-model sticky-col">{{ c.阀门型号 }}</td>
                <td class="pt-blank sticky-col">{{ c.阀体毛坯类型 }}</td>
                <td class="pt-jacket sticky-col">{{ c.夹套形式 }}</td>
                <td class="pt-cover sticky-col">{{ c.阀盖形式 }}</td>
                <td class="pt-std sticky-col">{{ c.执行标准 }}</td>
                <td class="pt-flow sticky-col">{{ c.流向代号 }}</td>
                <td
                  v-for="f in formulas"
                  :key="`d_${c.组合ID}_${f.公式ID}`"
                  class="check-cell"
                >
                  <input
                    type="checkbox"
                    class="native-checkbox"
                    :checked="isChecked(c.组合ID, f.公式ID)"
                    @change="
                      (e: Event) => onCheckboxChange(e, c.组合ID, f.公式ID)
                    "
                  />
                </td>
              </tr>
              <tr v-if="filteredCombos.length === 0">
                <td :colspan="8 + formulas.length" class="empty-row">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-tip">
          请先选择一个章节，或该章节暂无公式
        </div>
      </Spin>
    </Card>
  </div>
</template>

<style scoped>
.matrix-wrapper {
  overflow: auto;
  max-height: calc(100vh - 260px);
  border: 1px solid #d9d9d9;
}
.matrix-table {
  border-collapse: separate;    /* ★ 从 collapse 改成 separate */
  border-spacing: 0;             /* ★ 关键：列间距为 0 */
  font-size: 12px;
  background: #fff;
  white-space: nowrap;
}

/* ============================================================ */
/* 表头基础样式（不再默认 sticky）                                 */
/* ============================================================ */
.matrix-table thead th {
  background: #fafafa;
  border: 1px solid #d9d9d9;
  font-weight: normal;
  text-align: center;
  padding: 4px 6px;
}

/* ============================================================ */
/* ★ 前 4 行冻结在顶部（到"计算内容"为止）                        */
/* ============================================================ */
.matrix-table thead tr:nth-child(1) th {
  position: sticky;
  top: 0;          /* 第 1 行：序号 */
  z-index: 10;
}
.matrix-table thead tr:nth-child(2) th {
  position: sticky;
  top: 22px;       /* 第 2 行：关键计算项 */
  z-index: 10;
}
.matrix-table thead tr:nth-child(3) th {
  position: sticky;
  top: 44px;       /* 第 3 行：关键计算项目编码 */
  z-index: 10;
}
.matrix-table thead tr:nth-child(4) th {
  position: sticky;
  top: 66px;       /* 第 4 行：计算内容 */
  z-index: 10;
}

/* 前 4 行左侧标签列：水平也冻结 */
.matrix-table thead tr:nth-child(-n+4) th:first-child {
  left: 0;
  z-index: 11;
}
.matrix-table thead tr:nth-child(-n+4) th.corner-cell {
  left: 0;
  z-index: 11;
}

/* ============================================================ */
/* ★ 第 5~18 行：只保留左侧标签列的水平冻结，垂直不再固定          */
/* ============================================================ */
.matrix-table thead tr:nth-child(n+5) th.h-label {
  position: sticky;
  left: 0;
  top: auto;       /* 关键：top auto = 不垂直固定 */
  z-index: 3;
}

.h-label {
  text-align: left !important;
  font-weight: bold;
  background: #fafafa;
  padding-left: 12px !important;
  height: 22px;
  line-height: 22px;
  position: sticky;
  left: 0;
  z-index: 3;
}
.corner-cell {
  background: #fafafa;
  text-align: left;
  padding-left: 12px !important;
  font-weight: bold;
}
.corner-text {
  color: #333;
}
.h-cell {
  text-align: center;
  min-width: 90px;
  max-width: 180px;
  height: 22px;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 6px !important;
}
.h-seq {
  min-width: 90px;
  font-weight: bold;
  color: #333;
}
.h-chapter {
  color: #333;
}
.h-code {
  color: #1677ff;
  font-weight: bold;
}
.h-content {
  white-space: normal;
  word-break: break-all;
  line-height: 16px !important;
  min-height: 40px;
}
.h-symbol {
  font-weight: bold;
}
.h-formula {
  white-space: normal;
  word-break: break-all;
  line-height: 16px !important;
  min-height: 40px;
}
.h-ref {
  white-space: normal;
  word-break: break-all;
  line-height: 14px !important;
  font-size: 11px;
}
.h-value {
  color: #999;
}
.col-title-row th {
  background: #e6f7ff !important;
  font-weight: bold;
}
.pt-seq { width: 50px; min-width: 50px; text-align: center !important; }
.pt-combo { width: 100px; min-width: 100px; }
.pt-model { width: 60px; min-width: 60px; text-align: center !important; }
.pt-blank { width: 90px; min-width: 90px; text-align: center !important; }
.pt-jacket { width: 70px; min-width: 70px; text-align: center !important; }
.pt-cover { width: 70px; min-width: 70px; text-align: center !important; }
.pt-std { width: 70px; min-width: 70px; text-align: center !important; }
.pt-flow { width: 70px; min-width: 70px; text-align: center !important; }

/* ============================================================ */
/* ★ 性能优化：只渲染可视行                                       */
/* ============================================================ */
.data-row {
  content-visibility: auto;              /* ★ 浏览器跳过不可见行 */
  contain-intrinsic-size: 32px;          /* ★ 预估行高，保证滚动条正确 */
}

.data-row td {
  border: 1px solid #d9d9d9;
  padding: 4px 6px;
  height: 32px;
  text-align: center;
  background: #fff;
}
.data-row:hover td {
  background: #f5f5f5;
}
.sticky-col {
  position: sticky;
  z-index: 1;
  background: #fff !important;
}
.data-row:hover .sticky-col {
  background: #f5f5f5 !important;
}
.pt-seq.sticky-col { left: 0; z-index: 3; }
.pt-combo.sticky-col { left: 50px; z-index: 3; }
.pt-model.sticky-col { left: 150px; z-index: 3; }
.pt-blank.sticky-col { left: 210px; z-index: 3; }
.pt-jacket.sticky-col { left: 300px; z-index: 3; }
.pt-cover.sticky-col { left: 370px; z-index: 3; }
.pt-std.sticky-col { left: 440px; z-index: 3; }
.pt-flow.sticky-col { left: 510px; z-index: 3; }
.col-title-row .pt-seq { position: sticky; left: 0; z-index: 4; }
.col-title-row .pt-combo { position: sticky; left: 50px; z-index: 4; }
.col-title-row .pt-model { position: sticky; left: 150px; z-index: 4; }
.col-title-row .pt-blank { position: sticky; left: 210px; z-index: 4; }
.col-title-row .pt-jacket { position: sticky; left: 300px; z-index: 4; }
.col-title-row .pt-cover { position: sticky; left: 370px; z-index: 4; }
.col-title-row .pt-std { position: sticky; left: 440px; z-index: 4; }
.col-title-row .pt-flow { position: sticky; left: 510px; z-index: 4; }

/* ============================================================ */
/* ★ 原生 checkbox 样式                                           */
/* ============================================================ */
.check-cell {
  padding: 2px !important;
  text-align: center;
}
.native-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  vertical-align: middle;
  accent-color: #1677ff;
}

.empty-row {
  text-align: center;
  padding: 30px !important;
  color: #999;
  font-size: 14px;
}
.empty-tip {
  padding: 60px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>