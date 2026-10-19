import type { RouteRecordStringComponent } from '@vben/types';
import { requestClient } from '#/api/request';

// 设计计算数据库表定义列表
const calcDbTables = [
  { title: '阀门型号', code: 't-f1', table: '阀门型号' },
  { title: '阀体毛坯类型夹套形式', code: 't-f2', table: '阀体毛坯类型夹套形式' },
  { title: '入口公称通径', code: 't-f3', table: '入口公称通径' },
  { title: '入口法兰等级', code: 't-f4', table: '入口法兰等级' },
  { title: '阀芯尺寸', code: 't-f5', table: '阀芯尺寸' },
  { title: '出口公称通径', code: 't-f6', table: '出口公称通径' },
  { title: '出口法兰等级', code: 't-f7', table: '出口法兰等级' },
  { title: '阀体压力等级', code: 't-f8', table: '阀体压力等级' },
  { title: '上盖颈部', code: 't-f9', table: '上盖颈部' },
  { title: '阀盖形式', code: 't-f10', table: '阀盖形式' },
  { title: '执行标准', code: 't-f11', table: '执行标准' },
  { title: '泄漏等级', code: 't-f12', table: '泄漏等级' },
  { title: '流向', code: 't-f13', table: '流向' },
  { title: '流量特性', code: 't-f14', table: '流量特性' },
  { title: '阀体材质', code: 't-f15', table: '阀体材质' },
  { title: '阀体材料特殊要求', code: 't-f16', table: '阀体材料特殊要求' },
  { title: '执行机构结构大类', code: 't-f17', table: '执行机构结构大类' },
  { title: '执行机构作用类型', code: 't-f19', table: '执行机构作用类型' },
  { title: '执行机构规格', code: 't-f20', table: '执行机构规格说明' },
  { title: '执行机构气源压力', code: 't-f21', table: '执行机构气源压力' },
  { title: '执行机构电源电压', code: 't-f22', table: '执行机构电源电压' },
  { title: '执行机构弹簧范围', code: 't-f23', table: '执行机构弹簧范围' },
  { title: '执行机构行程代码', code: 't-f24', table: '执行机构行程代码' },
  { title: '执行机构手轮机构', code: 't-f25', table: '执行机构手轮机构' },
  { title: '版本类型', code: 't-f26', table: '版本类型' },
  { title: '定版年代', code: 't-f27', table: '定版年代' },
  { title: '版本状态', code: 't-f28', table: '版本状态' },
];

export { calcDbTables };

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  const dashboardMenus: any = [
    {
      meta: {
        order: -1,
        title: 'page.dashboard.title',
      },
      name: 'Dashboard',
      path: '/dashboard',
      redirect: '/analytics',
      children: [
        {
          name: 'Analytics',
          path: '/analytics',
          component: '/dashboard/analytics/index',
          meta: {
            affixTab: true,
            title: 'page.dashboard.analytics',
          },
        },
        {
          name: 'Workspace',
          path: '/workspace',
          component: '/dashboard/workspace/index',
          meta: {
            title: 'page.dashboard.workspace',
          },
        },
      ],
    },
    {
      meta: {
        keepAlive: true,
        order: 14,
        title: '设计计算',
      },
      name: '设计计算',
      path: '/sjjs',
      children: [
        {
          name: '计算中心',
          path: '/sjjs/jisuanzhongxin',
          children: [
            {
              meta: { title: '设计计算书' },
              name: '设计计算书',
              path: '/sjjs/jisuanzhongxin/part',
              component: '/sjjs/jisuanzhongxin/part.vue',
            },
          ],
        },
      ],
    },
    {
      meta: {
        order: 15,
        title: '数据管理',
      },
      name: '数据管理',
      path: '/data-management',
      children: [
        {
          meta: { title: '设计计算数据库' },
          name: '设计计算数据库',
          path: '/data-management/design-calc-db',
          children: [
            // ---------- 基础参数分类库 ----------
            {
              meta: { title: '基础参数分类库' },
              name: '基础参数分类库',
              path: '/datamanagement/design-calc-db/base-params',
              children: calcDbTables.map((item) => ({
                meta: {
                  title: item.title,
                  table: item.table,
                  code: item.code,
                },
                name: `DesignCalc_${item.code.replace(/-/g, '_')}`,
                path: `/datamanagement/design-calc-db/base-params/${item.code}`,
                component: '/datamanagement/common/index.vue',
              })),
            },

            // ---------- ★ 公式库（原有） ----------
            {
              meta: { title: '计算项' },
              name: '计算项',
              path: '/datamanagement/design-calc-db/formula',
              children: [
                // ========== 1. 原有公式相关 ==========
                {
                  meta: {
                    title: '章节库',
                    table: '章节库',
                    code: 'f-chapter',
                  },
                  name: 'FormulaChapter',
                  path: `/datamanagement/design-calc-db/formula/f-chapter`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '公式库',
                    table: '公式库',
                    code: 'f-formula',
                  },
                  name: 'FormulaList',
                  path: `/datamanagement/design-calc-db/formula/f-formula`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '产品组合',
                    table: '产品组合',
                    code: 'f-product-combo',
                  },
                  name: 'FormulaProductCombo',
                  path: `/datamanagement/design-calc-db/formula/f-product-combo`,
                  component: '/datamanagement/common/index.vue',
                },

                // ========== 2. 外来标准清单 ==========
                {
                  meta: {
                    title: '外来标准清单',
                    table: '外来标准清单',
                    code: 'f-standard',
                  },
                  name: 'ExternalStandardList',
                  path: `/datamanagement/design-calc-db/formula/f-standard`,
                  component: '/datamanagement/common/index.vue',
                },

                // ========== 3. 计算项 ==========
                {
                  meta: {
                    title: '计算项',
                    table: '计算项',
                    code: 'f-calc-item',
                  },
                  name: 'CalcItemList',
                  path: `/datamanagement/design-calc-db/formula/f-calc-item`,
                  component: '/datamanagement/common/index.vue',
                },

                // ========== 4. 日期规则关联 ==========
                {
                  meta: {
                    title: '计算项与公式和日期关联规则',
                    table: '计算项与公式和日期关联规则',
                    code: 'f-calc-item-date-rule',
                  },
                  name: 'CalcItemDateRule',
                  path: `/datamanagement/design-calc-db/formula/f-calc-item-date-rule`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '公式与计算标准和日期关联',
                    table: '公式与计算标准和日期关联',
                    code: 'f-formula-standard-date',
                  },
                  name: 'FormulaStandardDate',
                  path: `/datamanagement/design-calc-db/formula/f-formula-standard-date`,
                  component: '/datamanagement/common/index.vue',
                },

                // ========== 6. 结构简图 ==========
                {
                  meta: {
                    title: '结构简图规则',
                    table: '结构简图规则',
                    code: 'f-diagram-rule',
                  },
                  name: 'DiagramRule',
                  path: `/datamanagement/design-calc-db/formula/f-diagram-rule`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '结构简图图片',
                    table: '结构简图图片',
                    code: 'f-diagram-image',
                  },
                  name: 'DiagramImage',
                  path: `/datamanagement/design-calc-db/formula/f-diagram-image`,
                  component: '/datamanagement/common/index.vue',
                },
              ],
            },

            // ---------- ★ 公式库（新增五张表） ----------
            {
              meta: { title: '公式库' },
              name: '公式库',
              path: '/datamanagement/design-calc-db/formula-db',
              children: [
                {
                  meta: {
                    title: '变量字典',
                    table: '变量字典',
                    code: 'f-var-dict',
                  },
                  name: 'FormulaDb_VariableDict',
                  path: `/datamanagement/design-calc-db/formula-db/f-var-dict`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '公式项',
                    table: '公式项',
                    code: 'f-formula-item',
                  },
                  name: 'FormulaDb_FormulaItem',
                  path: `/datamanagement/design-calc-db/formula-db/f-formula-item`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '公式规则',
                    table: '公式规则',
                    code: 'f-formula-rule',
                  },
                  name: 'FormulaDb_FormulaRule',
                  path: `/datamanagement/design-calc-db/formula-db/f-formula-rule`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '合格判定规则',
                    table: '合格判定规则',
                    code: 'f-check-rule',
                  },
                  name: 'FormulaDb_CheckRule',
                  path: `/datamanagement/design-calc-db/formula-db/f-check-rule`,
                  component: '/datamanagement/common/index.vue',
                },
                {
                  meta: {
                    title: '计算结果映射',
                    table: '计算结果映射',
                    code: 'f-result-map',
                  },
                  name: 'FormulaDb_ResultMap',
                  path: `/datamanagement/design-calc-db/formula-db/f-result-map`,
                  component: '/datamanagement/common/index.vue',
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return dashboardMenus;
}