import { baseRequestClient, requestClient } from '#/api/request';

export namespace u9Api {
  export interface PartInfo {
  id?: number;
  ERP分类码:string;
  大类编码:string;
  大类名称:string;
  大类属性:string;
  中类编码:string;
  中类名称:string;
  中类属性:string;
  小类编码:string;
  小类名称:string;
  小类属性:string;
  财务分类:string;
  修改说明:string;
  交货提交资料包工包料委外:string;
  交货提交资料供料委外自制无需提交资料:string;
  存储合格期:string;
  是否关键物料:string;
  抽样数量:string;
  抽样频次:string;
  常规检验:string;
  尺寸检验:string;
  机械性能:string;
  化学成分:string;
  无损检验:string;
  包装方式:string;
  合理损耗率?: number;
  是否承压:string;
  工艺特殊要求1:string;
  工艺特殊要求2:string;
  工艺特殊要求3:string;
  工艺特殊要求4:string;
 }
  export interface PartInfoBZJ {
  id?: number;
  ERP分类码:string;
  大类编码:string;
  大类名称:string;
  大类属性:string;
  中类编码:string;
  中类名称:string;
  中类属性:string;
  小类编码:string;
  小类名称:string;
  小类属性:string;
  财务分类:string;
  plM组别码:string;
  修改说明:string;
  交货提交资料:string;
  存储合格期:string;
  是否关键物料:string;
  包装方式:string;
  合理损耗率?: number;
  是否承压:string;
  工艺特殊要求1:string;
  工艺特殊要求2:string;
  工艺特殊要求3:string;
  工艺特殊要求4:string;
 }
   export interface PartInfoBJ {
  id?: number;
  ERP分类码:string;
  大类编码:string;
  大类名称:string;
  大类属性:string;
  中类编码:string;
  中类名称:string;
  中类属性:string;
  小类编码:string;
  小类名称:string;
  小类属性:string;
  财务分类:string;
  plM组别码:string;
  修改说明:string;
  交货提交资料:string;
  存储合格期:string;
  是否关键物料:string;
  抽样数量:string;
  抽样频次:string;
  检验内容:string;
  包装方式:string;
  合理损耗率?: number;
  是否承压:string;
  工艺特殊要求1:string;
  工艺特殊要求2:string;
  工艺特殊要求3:string;
  工艺特殊要求4:string;
 }
  export interface BasePage {
     page: number;
     pageSize: number;
     erP分类码:string;
 }
}

//查询
export async function GetU9DataListPage(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPage', data);
}
//修改
export async function UpdateU9(data: u9Api.PartInfo) {
  return baseRequestClient.post('/UpdateU9', data);
}

//查询标准件
export async function GetU9DataListPageBZJ(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageBZJ', data);
}
//修改标准件
export async function UpdateU9BZJ(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9BZJ', data);
}

//查询部件
export async function GetU9DataListPageBJ(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageBJ', data);
}
//修改部件
export async function UpdateU9BJ(data: u9Api.PartInfoBJ) {
  return baseRequestClient.post('/UpdateU9BJ', data);
}

//查询材料
export async function GetU9DataListPageCL(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageCL', data);
}
//修改材料
export async function UpdateU9CL(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9CL', data);
}

//查询产品
export async function GetU9DataListPageCP(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageCP', data);
}
//修改产品
export async function UpdateU9CP(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9CP', data);
}

//查询附件
export async function GetU9DataListPageFJ(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageFJ', data);
}
//修改附件
export async function UpdateU9FJ(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9FJ', data);
}

//查询总成
export async function GetU9DataListPageZC(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageZC', data);
}
//修改总成
export async function UpdateU9ZC(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9ZC', data);
}

//查询组件
export async function GetU9DataListPageZJ(data: u9Api.BasePage) {
  return baseRequestClient.post('/GetU9DataListPageZJ', data);
}
//修改组件
export async function UpdateU9ZJ(data: u9Api.PartInfoBZJ) {
  return baseRequestClient.post('/UpdateU9ZJ', data);
}

//获取模板
export async function GetExcelTemplate(type:string) {
  return requestClient.get('/GetExcelTemplate', {      
    params: {
        type: type
      }
    });
}

export async function ImportTemplate(formFiles: FormData) {
  return baseRequestClient.post('/ImportTemplate', formFiles, {
    // 🔥 强行覆盖掉全局的 application/json
    headers: {
      'Content-Type': undefined, // 让浏览器自动处理
    },
  });
}

//查询组件
//1:焊接，2:热处理 3:PT
export async function SelectJYX(code: string, leixing: number) {
  return baseRequestClient.get('/SelectJYX', {      
    params: {
        code: code,
        leixing:leixing
      }
    });
}
