import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
        localStorage.removeItem('userInfo');
        localStorage.removeItem('preferences');
      try{
        //const response  = await loginApi(params);

        //console.error("response==>",response);
        //if(response.data.code == 0){
          accessStore.setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwicGFzc3dvcmQiOiIxMjM0NTYiLCJyZWFsTmFtZSI6IlZiZW4iLCJyb2xlcyI6WyJzdXBlciJdLCJ1c2VybmFtZSI6InZiZW4iLCJpYXQiOjE3NzI2MTY4NTAsImV4cCI6MTc3MzIyMTY1MH0.i6EYXulo2OSBYXEQ1KBvWNlrxLFiEI1aT4T0m5qEaXw');
          console.log("defaultHomePath ==>",preferences.app.defaultHomePath);
          console.log('onSuccess==>',onSuccess)
          console.log('router==>',router)
          
          const [fetchUserInfoResult] = await Promise.all([
              fetchUserInfo(),
             //getAccessCodesApi(),
           ]);
          userInfo = fetchUserInfoResult;
          userStore.setUserInfo(userInfo);
          //userInfo.username = params.username;
          //userStore.setUserInfo(userInfo);
          console.log("userInfo",userInfo);
        
          // const path = userInfo?.homePath || preferences.app.defaultHomePath

          //     await router.replace({
          //         path: LOGIN_PATH,
          //       });

          // window.location.href = path;
          // setTimeout(()=>{

          // },600)
          // onSuccess
          //   ? await onSuccess?.()
          //   : await router.push({
          //        path: userInfo?.homePath || preferences.app.defaultHomePath
          //     });

          // router.push({
          //     path:userInfo?.homePath
          //   })
         
          if (userInfo?.realName) {
              notification.success({
                description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
                duration: 3,
                message: $t('authentication.loginSuccess'),
              });
          }
          //await router.push(preferences.app.defaultHomePath);
        // }
        // else{
        //   notification.error({
        //     description: `${response.data.message}`,
        //     duration: 3,
        //     message: response.data.message,
        //   });
        // }
      }catch(apiError) {
         console.error("loginApi 调用直接失败！错误详情:", apiError);
      }

          // 原有逻辑：走你传入的 onSuccess，不会再执行默认路由

      // const { accessToken } = await loginApi(params);

      // // 如果成功获取到 accessToken
      // if (accessToken) {
      //   accessStore.setAccessToken(accessToken);

      //   // 获取用户信息并存储到 accessStore 中
      //   const [fetchUserInfoResult, accessCodes] = await Promise.all([
      //     fetchUserInfo(),
      //     getAccessCodesApi(),
      //   ]);

      //   userInfo = fetchUserInfoResult;

      //   userStore.setUserInfo(userInfo);
      //   accessStore.setAccessCodes(accessCodes);

      //   if (accessStore.loginExpired) {
      //     accessStore.setLoginExpired(false);
      //   } else {
      //     onSuccess
      //       ? await onSuccess?.()
      //       : await router.push(
      //           userInfo.homePath || preferences.app.defaultHomePath,
      //         );
            
      //         console.log(userInfo.homePath + "AAAAAAAAAAAA");
      //   }

      //   if (userInfo?.realName) {
      //     notification.success({
      //       description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
      //       duration: 3,
      //       message: $t('authentication.loginSuccess'),
      //     });
      //   }
      // }
    } finally {
      loginLoading.value = false;
    }

     return {
       //userInfo,
     };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);
   
    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath ),
          }
        : {},
    });


  }

  async function fetchUserInfo() {
    // let userInfo: null | UserInfo = null;
    // userInfo = await getUserInfoApi();
    // userStore.setUserInfo(userInfo);
    
    // return userInfo;
    let userInfo: null | UserInfo = null;
    // userInfo = {
    // "code": 0,
    // "data": {
    //     "id": 2,
    //     "realName": "ITKF03",
    //     "roles": [
    //         "user"
    //     ],
    //     "username": "ITKF03",
    //     "homePath": "/analytics"
    // },
    // "error": null,
    // "message": "ok"
    // } as any;
    userInfo =  {
        "id": 2,
        "realName": "ITKF03",
        "roles": [
            "user"
        ],
        "username": "ITKF03",
        "homePath": "/analytics"
    }as any;
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
