import request from '@/utils/request';

// 薪酬变动部门列表
export async function departSalaryList(params) {
  return request('/yifu-business/method/salaryStatistics/depart/getListByPage', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 导出
export async function exportDepartSalary(params) {
  return request('/yifu-business/method/salaryStatistics/depart/getList', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 薪酬变动部门统计
export async function departSalaryStatics(params) {
  return request('/yifu-business/method/salaryStatistics/depart/getSumDepartByParams', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 子部门薪酬变动列表
export async function subDepartSalaryList(params) {
  return request('/yifu-business/method/tbusdept/getBusDepartByLevelOrPid', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 个人统计分页查询
export async function personStaticsList(params) {
  return request('/yifu-business/method/salaryStatistics/person/getListByPage', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 个人统计导出
export async function exportPersonStatics(params) {
  return request('/yifu-business/method/salaryStatistics/person/getList', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 个人统计合计
export async function personStaticsSum(params) {
  return request('/yifu-business/method/salaryStatistics/person/getSumPersonByParams', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 获取当前部门薪酬列表
export async function curDepartInfo(params) {
  return request('/yifu-business/method/salaryStatistics/depart/getCurDepartData', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 获取当前部门个人薪酬统计
export async function curPersonStatic(params) {
  return request('/yifu-business/method/salaryStatistics/depart/getCurDepartSumData', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
