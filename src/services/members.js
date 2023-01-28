import request from '@/utils/request';

// 花名册列表
export async function employeeList(param) {
  return request('/yifu-archives/method/customerBusiness/temployeeBusiness/page', {
    method: 'GET',
    params: param,
  });
}

// 人员档案详情
export async function getEmployeeBusinessInfoById(params) {
  return request(
    '/yifu-archives/method/customerBusiness/temployeeBusiness/getEmployeeBusinessInfoById',
    {
      method: 'GET',
      params,
    },
  );
}

// 根据员工身份证查询员工工资
export async function getAccountByIdCardPage(params) {
  return request('/salary/customerBusiness/businessSalary/getAccountByIdCardPage', {
    method: 'GET',
    params,
  });
}

// 按年查询指定人的社保详情
export async function getPaymentByYearAndEmpId(params) {
  return request('/yifu-social/method/customerBusiness/dispatchBusiness/getPaymentByYearAndEmpId', {
    method: 'GET',
    params,
  });
}

// 按月查询指定人的社保信息
export async function getPaymentByMonthAndEmpId(params) {
  return request(
    '/yifu-social/method/customerBusiness/dispatchBusiness/getPaymentByMonthAndEmpId',
    {
      method: 'GET',
      params,
    },
  );
}

// 通过ID查询员工对应社保的派增派减数据
export async function getSocialAddOrReduceByEmpId(params) {
  return request(
    '/yifu-social/method/customerBusiness/dispatchBusiness/getSocialAddOrReduceByEmpId',
    {
      method: 'GET',
      params,
    },
  );
}

// 通过ID查询员工对应公积金的派增派减数据
export async function getFundAddOrReduceByEmpId(params) {
  return request(
    '/yifu-social/method/customerBusiness/dispatchBusiness/getFundAddOrReduceByEmpId',
    {
      method: 'GET',
      params,
    },
  );
}

// 查询地区名字
export async function getArea(id) {
  return request(`/yifu-upms/method/area/${id}`);
}

// 导出
export async function exportEmployee(params) {
  return request('/yifu-archives/method/customerBusiness/temployeeBusiness/exportByParams', {
    method: 'GET',
    params,
  });
}

// 批量更新
export async function batchFlashEmployee(params) {
  return request(
    '/yifu-archives/method/customerBusiness/temployeeBusiness/batchUpdateEmployeeExtendByJsonStr',
    {
      method: 'PUT',
      data: params,
    },
  );
}

// 编辑
export async function editEmployee(params) {
  return request(
    '/yifu-archives/method/customerBusiness/temployeeBusiness/updateEmployInfoByExtendId',
    {
      method: 'PUT',
      data: params,
    },
  );
}
