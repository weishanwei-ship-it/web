import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // return dashboardMenus;
  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      const data = await getAllMenusApi();
      console.log('fetchMenuListAsync', data);

      return data;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}
// async function generateAccess(options: GenerateMenuAndRoutesOptions) {
//     const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

//   const layoutMap: ComponentRecordType = {
//     BasicLayout,
//     IFrameView,
//   };
//   return await generateAccessible(preferences.app.accessMode, {
//     ...options,
//     fetchMenuListAsync: async () => {
//       // 这个接口为后端返回的菜单数据
//       return await dashboardMenus;
//     },
//     forbiddenComponent,
//     layoutMap,
//     pageMap,
//   });
// }
export { generateAccess };
