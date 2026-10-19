import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  // export interface LoginResult {
  //   accessToken: string;
  // }
  export interface LoginResult {
    code: number;
    data: boolean;
    error: string;
    message: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
// export async function loginApi(data: AuthApi.LoginParams) {
//   return requestClient.post<AuthApi.LoginResult>('/LoginIn', data);
// }
export async function loginApi(data: AuthApi.LoginParams) {
  return baseRequestClient.post('/LoginIn', data);
}
/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

export async function ReceiveMessage(account: string) {
  return requestClient.get('/ReceiveMessage', {
    params: {
      account: account,
    },
  });
}

export async function OneMessage(msgid: string) {
  return baseRequestClient.post('/OneMessage', msgid);
}

export async function AllMessage(msgid: string[]) {
  return baseRequestClient.post('/AllMessage', msgid);
}
