import request from '@/utils/request';

// 列表
export async function annualControlList(query) {
  return request('/yifu-business/method/vacationMonitor/getListByPage', {
    method: 'GET',
    params: query,
  });
}

// 导出
export async function exportAnnualList(query) {
  return request('/yifu-business/method/vacationMonitor/exportByParams', {
    method: 'GET',
    params: query,
  });
}

// 查询剩余年假
export async function remainAnnual(query) {
  return request('/yifu-business/method/vacationMonitor/getNotUsedVacationDurationByIdCard', {
    method: 'GET',
    params: query,
  });
}

// 清零操作
export async function clearAnnual(params) {
  return request('/yifu-business/method/vacationMonitorClearLog/clearNote', {
    method: 'POST',
    data: params,
  });
}

// 清零操作
export async function clearAnnualList(query) {
  return request('/yifu-business/method/vacationMonitorClearLog/getList', {
    method: 'GET',
    params: query,
  });
}

// 获取年假配置规则
export async function annualRule(query) {
  return request('/yifu-business/method/vacationRule/getVacationRuleConfig', {
    method: 'GET',
    params: query,
  });
}

// 获取年假配置规则
export async function modifyAnnualRule(query) {
  return request('/yifu-business/method/vacationRule/addOrSave', {
    method: 'POST',
    data: query,
  });
}
