import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('系统配置'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        meta: {
          title: $t('人员信息'),
        },
        name: '人员信息',
        path: '/system/index',
        component: () => import('#/views/system/index.vue'),
      },
      {
        meta: {
          title: $t('角色权限'),
        },
        name: '角色权限',
        path: '/system/role',
        component: () => import('#/views/system/role.vue'),
      },
      {
        meta: {
          title: $t('菜单权限'),
        },
        name: '菜单权限',
        path: '/system/menu',
        component: () => import('#/views/system/menu.vue'),
      },
    ],
  },
];

export default routes;
