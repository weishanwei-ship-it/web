
// 从配置中提取接口基础地址（VITE_GLOB_API_URL）
const API_BASE_URL = import.meta.env.VITE_GLOB_API_URL;
/**
 * 通用文件下载方法（调用后直接弹出下载弹窗）
 * @param filePath 接口返回的文件相对路径（如：Upload/Template/检验项零件模板.xlsx）
 * @param fileName 可选：自定义下载文件名，不传则自动从路径提取
 */
export const downloadFile = async (filePath: string, fileName?: string) => {
  try {
    // 1. 拼接完整下载地址（自动补全当前域名）
    const fullUrl = `${API_BASE_URL}/${filePath.replace(/^\//, '')}`;
    // 2. 创建下载链接，直接触发浏览器下载弹窗
    const link = document.createElement('a');
    link.href = fullUrl;
    // 文件名优先级：自定义 > 路径提取 > 默认名
    link.download = fileName || filePath.split('/').pop() || '下载文件.xlsx';
    // 强制触发下载（而非打开文件）
    link.target = '_blank';
    
    // 3. 触发点击（弹出下载文件夹选择弹窗）
    document.body.appendChild(link);
    link.click();
    
    // 4. 清理临时元素
    document.body.removeChild(link);
    
  } catch (err) {
    console.error('下载失败：', err);
  }
};


