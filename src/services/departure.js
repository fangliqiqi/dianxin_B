import request from '@/utils/request';

// 离职列表
export async function tbusleaveList(param) {
  return request('/yifu-business/method/tbusleave/page', {
    method: 'GET',
    params: param,
  });
}

// 根据id 查询详情
export async function tbusleaveByid(value) {
  return request(`/yifu-business/method/tbusleave/${value}`, {
    method: 'GET',
  });
}

// 导入
export async function importExcel(params) {
  return request('/yifu-business/method/tbusleave/importLeave', {
    method: 'POST',
    data: params,
  });
}

// 获取list
export async function doexportLeaveList(param) {
  return request('/yifu-business/method/tbusleave/getTBusLeaveList', {
    method: 'GET',
    params: param,
  });
}

// 编辑
export async function editTbusleave(params) {
  return request('/yifu-business/method/tbusleave', {
    method: 'PUT',
    data: params,
  });
}

// 新增
export async function addTbusleave(params) {
  return request('/yifu-business/method/tbusleave', {
    method: 'POST',
    data: params,
  });
}
// 根据电信编号，获取附属信息
export async function getByBusinessTelecomNumber(param) {
  return request(
    '/yifu-archives/method/customerBusiness/temployeeBusiness/getByBusinessTelecomNumber',
    {
      method: 'POST',
      params: param,
    },
  );
}

// 根据id 删除
export async function tbusleaveDelete(value) {
  return request(`/yifu-business/method/tbusleave/${value}`, {
    method: 'DELETE',
  });
}
