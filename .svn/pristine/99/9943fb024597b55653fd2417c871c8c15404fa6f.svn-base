import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 999,
      title: $t('CAPP'),
    },
    name: 'CAPP',
    path: '/u9',
    children: [
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('检验项'),
        },
        name: '检验项',
        path: '/u9',
        children: [
          {
            meta: {
              title: $t('零件信息'),
            },
            name: '零件信息',
            path: '/u9/part',
            component: () => import('#/views/u9/part.vue'),
          },
          {
            meta: {
              title: $t('标准件信息'),
            },
            name: '标准件信息',
            path: '/u9/partbzj',
            component: () => import('#/views/u9/partbzj.vue'),
          },
          {
            meta: {
              title: $t('部件信息'),
            },
            name: '部件信息',
            path: '/u9/partbj',
            component: () => import('#/views/u9/partbj.vue'),
          },
          {
            meta: {
              title: $t('材料信息'),
            },
            name: '材料信息',
            path: '/u9/partcl',
            component: () => import('#/views/u9/partcl.vue'),
          },
          {
            meta: {
              title: $t('产品信息'),
            },
            name: '产品信息',
            path: '/u9/partcp',
            component: () => import('#/views/u9/partcp.vue'),
          },
          {
            meta: {
              title: $t('附件信息'),
            },
            name: '附件信息',
            path: '/u9/partfj',
            component: () => import('#/views/u9/partfj.vue'),
          },
          {
            meta: {
              title: $t('总成信息'),
            },
            name: '总成信息',
            path: '/u9/partzc',
            component: () => import('#/views/u9/partzc.vue'),
          },
          {
            meta: {
              title: $t('组件信息'),
            },
            name: '组件信息',
            path: '/u9/partzj',
            component: () => import('#/views/u9/partzj.vue'),
          },
        ]
      }
    ],
  },
];

export default routes;
