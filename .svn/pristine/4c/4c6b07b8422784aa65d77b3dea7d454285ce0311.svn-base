import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 999,
      title: $t('sjjs'),
    },
    name: '设计计算',
    path: '/sjjs',
    children: [
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('计算中心'),
        },
        name: '计算中心',
        path: '/sjjs',
        children: [
          {
            meta: {
              title: $t('信息录入'),
            },
            name: '信息录入',
            path: '/sjjs/jisuanzhongxin/part',
            component: () => import('#/views/sjjs/jisuanzhongxin/part.vue'),
          },
        ],
      },
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('报告中心'),
        },
        name: '报告中心',
        path: '/bgzx',
        children: [
          {
            meta: {
              title: $t('历史报告查询'),
            },
            name: '历史报告查询',
            path: '/sjjs/baogaozhongxin/baogao',
            component: () => import('#/views/sjjs/baogaozhongxin/baogao.vue'),
          },
        ],
      },
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('数据管理'),
        },
        name: '数据管理',
        path: '/bgzx',
        children: [
          {
            meta: {
              title: $t('产品信息库查询'),
            },
            name: '产品信息库查询',
            path: '/sjjs/shujuguanli/cpguanli',
            component: () => import('#/views/sjjs/shujuguanli/cpguanli.vue'),
          },
        ],
      }
    ],
  },
];

export default routes;
