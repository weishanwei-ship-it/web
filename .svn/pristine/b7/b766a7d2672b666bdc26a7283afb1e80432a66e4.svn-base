import { baseRequestClient, requestClient } from '#/api/request';

export namespace EmployeeApi {

 export interface EmployeeInfo {
     empName: string;
     empNo: boolean;
     sexName: string;
     productName : string;
     homeAddr:string;
     mobile:string;
     passWord:string;
     empTypeName:string;
     empCurrentStateName:string;    
     educationName:string;
     perField4:string;
     special:string;
     qtTypeName:string;
     qtName:string;
     perField7:string;
     companyNo:string;
     quartersNo:string;
     partNo:string;
     idCardAddr:string;
     birthday:string;
 }
  export interface Result {
     code: number;
     data: [];
     error: string;
     message : string;
 }
 export interface EmployeeParams {
     page: number;
     pageSize: number;
     empNo?: string;
     empName?:string;
 }
  export interface RoleInfo {
     roleName?: string;
     createName?:string;
     remarks?:string;
     id?:number;
 }
  export interface BasePage {
     page: number;
     pageSize: number;
 }
  export interface roleBasePage {
     roleId : number;
     page: number;
     pageSize: number;
 }
  export interface menuInfo {
     createName?: string;
     parentId: number;
     menuName?:string;
     menuUrl?:string;
 }
   export interface rolemenu {
     roleId?: number;
     selectedMenuIds: number[];
 }
}
/**
 * 登录
 */
// export async function loginApi(data: AuthApi.LoginParams) {
//   return requestClient.post<AuthApi.LoginResult>('/LoginIn', data);
// }
export async function GetEmployeeInfoDataListPage(data: EmployeeApi.EmployeeParams) {
  return baseRequestClient.post('/GetEmployeeInfoDataListPage', data);
}

export async function InsertRole(data: EmployeeApi.RoleInfo) {
  //获取登陆人名称
  data.createName = localStorage.getItem("REMEMBER_ME_USERNAME_localhost") || '';
  return baseRequestClient.post('/InsertRole', data);
}
//查询角色
export async function GetRoleDataListPage(data: EmployeeApi.BasePage) {
  return baseRequestClient.post('/GetRoleDataListPage', data);
}
//修改角色
export async function UpdateRole(data: EmployeeApi.RoleInfo) {
  return baseRequestClient.post('/UpdateRole', data);
}
//添加菜单
export async function InsertMenu(data: EmployeeApi.menuInfo) {
  data.createName = localStorage.getItem("REMEMBER_ME_USERNAME_localhost") || '';
  return baseRequestClient.post('/InsertMenu', data);
}

//查询菜单
export async function GetMenuDataListPage(data: EmployeeApi.roleBasePage) {
  return baseRequestClient.post('/GetMenuDataListPage', data);
}
//添加角色菜单关系
export async function InsertRoleMenu(data: EmployeeApi.rolemenu) {
  return baseRequestClient.post('/InsertRoleMenu', data);
}
