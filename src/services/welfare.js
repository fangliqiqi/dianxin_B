import request from '@/utils/request';

// 列表
export async function welfareList(query) {
  return request('/yifu-business/method/tbussalary/page', {
    method: 'GET',
    params: query,
  });
}
// id查询
export async function welfareDetailByid(id) {
  return request(`/yifu-business/method/tbussalary/${id}`, {
    method: 'get',
  });
}
// 工资详情
export async function getListBySalaryId(query) {
  return request('/yifu-business/method/tbussalaryitem/getListBySalaryId', {
    method: 'GET',
    params: query,
  });
}

// 单个id 删除
export async function welfareDelByid(id) {
  return request(`/yifu-business/method/tbussalary/${id}`, {
    method: 'DELETE',
  });
}
// 多个删除
export async function welfareDelByids(params) {
  return request(`/yifu-business/method/tbussalary/deleteByDeptAndMonth?${params}`, {
    method: 'POST',
    // data: params
  });
}

// 系统表头
export async function getConfigList(query) {
  return request('/yifu-business/method/tbussalaryconfig/getConfigList', {
    method: 'GET',
    params: query,
  });
}

// 导入
export async function importBusSalary(params) {
  return request('/yifu-business/method/tbussalary/importBusSalary', {
    method: 'POST',
    data: params,
  });
}
// 导出
export async function doExport(params) {
  return request('/yifu-business/method/tbussalary/doExport', {
    method: 'POST',
    data: params,
  });
}

// 获取之前的list 关系
export async function getResListByDeptId(query) {
  return request('/yifu-business/method/tbussalaryconfigtitleres/getResListByDeptId', {
    method: 'GET',
    params: query,
  });
}
