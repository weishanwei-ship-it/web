import { requestClient } from '#/api/request';

// ============================================================
// 类型定义
// ============================================================
export interface ColumnInfo {
  ColumnName: string;
  DataType: string;
  MaxLength: number;
  IsNullable: boolean;
  IsIdentity: boolean;
  IsPrimaryKey: boolean;
}

export interface ListResult<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportResult {
  message: string;
  count?: number;
}

// ★ 动态规则计算请求参数
export interface RuleCalcPayload {
  阀门型号: string;
  params: Record<string, any>;
}

// ★ 动态规则计算响应
export interface RuleCalcResult {
  code: number;
  message?: string;
  data?: {
    阀门型号: string;
    计算结果: Record<string, any>;
    计算结果可读: Record<string, string>;
    合格: boolean;
    判定结论: string;
    合格判定: Array<{
      name: string;
      passed: boolean;
      message: string;
      expression?: string;
    }>;
    执行日志: Array<{
      item: string;
      itemName?: string;
      symbol?: string;
      unit?: string;
      ruleId?: number | null;
      ruleGroup?: string;
      priority?: number;
      formula?: string;
      value?: any;
      valueDisplay?: string;
      error?: string;
      stage?: string;
      expression?: string;
    }>;
    所有变量: Record<string, any>;
  };
}

// ============================================================
// 辅助：多层自动解包
//   - axios response:        res.data = { data: { list, total } }
//   - 已解包一层:             res = { data: { list, total } }
//   - 双层嵌套:               res = { data: { data: { list, total } } }
//   - 无 data 字段:           res = { list, total }
// ============================================================
function unwrapResponse(res: any, maxDepth = 2): any {
  let payload: any = res;
  for (let i = 0; i < maxDepth; i++) {
    if (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      payload.data &&
      typeof payload.data === 'object' &&
      !Array.isArray(payload.data)
    ) {
      payload = payload.data;
    } else {
      break;
    }
  }
  return payload;
}

// ============================================================
// DataApi
// ============================================================
export const DataApi = {
  /**
   * 获取表结构
   * GET /api/data/{tableName}/schema
   */
  getSchema(tableName: string) {
    return requestClient.get<ColumnInfo[]>(
      `/api/data/${encodeURIComponent(tableName)}/schema`,
    );
  },

  /**
   * 分页查询
   * GET /api/data/{tableName}?page=&pageSize=&searchColumn=&searchKeyword=
   */
  async getList(
    tableName: string,
    page = 1,
    pageSize = 20,
    searchColumn?: string,
    searchKeyword?: string,
  ): Promise<ListResult> {
    // 只在有值时才传参，避免 axios 把 undefined 序列化成字符串 "undefined"
    const params: Record<string, any> = { page, pageSize };
    if (searchColumn && searchKeyword) {
      params.searchColumn = searchColumn;
      params.searchKeyword = searchKeyword;
    }

    const res: any = await requestClient.get(
      `/api/data/${encodeURIComponent(tableName)}`,
      { params },
    );

    console.log(`[getList] ${tableName} 原始响应 =`, res);

    const payload = unwrapResponse(res, 2);

    console.log(`[getList] ${tableName} 解包后 =`, payload);

    return {
      items: payload?.list ?? payload?.items ?? [],
      total: payload?.total ?? 0,
      page: payload?.page ?? page,
      pageSize: payload?.pageSize ?? pageSize,
    };
  },

  /**
   * 按主键获取单条
   * GET /api/data/{tableName}/{id}
   */
  getById(tableName: string, id: number) {
    return requestClient.get(
      `/api/data/${encodeURIComponent(tableName)}/${id}`,
    );
  },

  /**
   * 新增
   * POST /api/data/{tableName}
   */
  create(tableName: string, data: Record<string, any>) {
    return requestClient.post(
      `/api/data/${encodeURIComponent(tableName)}`,
      data,
    );
  },

  /**
   * 按主键更新
   * PUT /api/data/{tableName}/{id}
   */
  update(tableName: string, id: number | string, data: Record<string, any>) {
    return requestClient.put(
      `/api/data/${encodeURIComponent(tableName)}/${id}`,
      data,
    );
  },

  /**
   * 按业务键（如【出厂编号】）更新
   * PUT /api/data/{tableName}
   */
  updateByKey(tableName: string, data: Record<string, any>) {
    return requestClient.put(
      `/api/data/${encodeURIComponent(tableName)}`,
      data,
    );
  },

  /**
   * 按主键删除
   * DELETE /api/data/{tableName}/{id}
   */
  remove(tableName: string, id: number | string) {
    return requestClient.delete(
      `/api/data/${encodeURIComponent(tableName)}/${id}`,
    );
  },

  /**
   * 按业务键（如【出厂编号】）删除
   * DELETE /api/data/{tableName}/key/{key}
   */
  removeByKey(tableName: string, key: string) {
    return requestClient.delete(
      `/api/data/${encodeURIComponent(tableName)}/key/${encodeURIComponent(key)}`,
    );
  },

  /**
   * 按主键（自动识别主键列名）删除
   * DELETE /api/data/{tableName}/pk/{id}
   */
  removeByPk(tableName: string, id: string) {
    return requestClient.delete(
      `/api/data/${encodeURIComponent(tableName)}/pk/${encodeURIComponent(id)}`,
    );
  },

  /**
   * 批量导入
   * POST /api/data/{tableName}/batch
   */
  batchImport(tableName: string, rows: Record<string, any>[]) {
    return requestClient.post<ImportResult>(
      `/api/data/${encodeURIComponent(tableName)}/batch`,
      rows,
    );
  },

  // ============================================================
  // 计算相关
  // ============================================================

  /**
   * 生成设计计算书（旧接口，基于【公式库】长字符串）
   * POST /api/calc/book
   */
  generateBook(payload: {
    阀门型号: string;
    标准体系?: string;
    下单日期?: string;
    params: Record<string, any>;
  }) {
    return requestClient.post('/api/calc/book', payload);
  },

  /**
   * ★ 动态规则计算（新接口，基于五张表 + 动态规则引擎）
   * POST /api/calc/rule-calc
   */
  async ruleCalc(payload: RuleCalcPayload): Promise<RuleCalcResult> {
    const res: any = await requestClient.post(
      '/api/calc/rule-calc',
      payload,
    );
    console.log('[ruleCalc] 原始响应 =', res);

    // 兼容：如果拦截器已经把 { code, data } 解包，就直接用
    if (res?.data && typeof res.data === 'object' && '计算结果可读' in res.data) {
      return { code: 0, data: res.data };
    }
    if (res && typeof res === 'object' && '计算结果可读' in res) {
      return { code: 0, data: res };
    }
    return res as RuleCalcResult;
  },

  /**
   * ★ 查看某个公式项的所有规则（调试用）
   * GET /api/calc/rule-preview?公式项代码=tm1&规则组=xxx
   */
  rulePreview(公式项代码: string, 规则组?: string) {
    return requestClient.get('/api/calc/rule-preview', {
      params: { 公式项代码, 规则组 },
    });
  },
  /**
   * ★ 获取结构简图（按产品结构编码）
   * GET /api/calc/structure-images?产品结构编码=P2AA01
   */
  getStructureImages(产品结构编码: string) {
    return requestClient.get('/api/calc/structure-images', {
      params: { 产品结构编码 },
    });
  },

  /**
   * ★ 新增产品：传入编号列表，后端调外部接口取信息后插入【设计计算书】
   * POST /api/calc/add-products
   */
  addProducts(codes: string[]) {
    return requestClient.post('/api/calc/add-products', { codes });
  },
};

export default DataApi;