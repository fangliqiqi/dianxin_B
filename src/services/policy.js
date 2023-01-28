import request from '@/utils/request';

/**
 * 获取政策中心列表
 * @param {*} params
 */
export async function loadPolicyList(params) {
  return request('/yifu-business/method/customerBusiness/tpolicy/page', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * @param 查询政策详情
 */
export async function loadPolicyDetailData(value) {
  return request(`/yifu-business/method/customerBusiness/tpolicy/${value}`, {
    method: 'GET',
  });
}

/**
 * 获取省市区树形结构数据
 * @param {*} params
 */
export async function loadAreaDatas(params) {
  return request('/yifu-upms/method/area/tree', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 所有省市区 地区Map
 * @param {*} params
 */
export async function getAreaMap(params) {
  return request('/yifu-upms/method/area/getAreaMap', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 *
 * @param 新增发布政策
 *
 */
export async function addPolicy(data) {
  return request('/yifu-business/method/customerBusiness/tpolicy', {
    method: 'POST',
    data: data,
  });
}

/**
 * @param 编辑政策
 */
export async function editPolicy(data) {
  return request('/yifu-business/method/customerBusiness/tpolicy', {
    method: 'PUT',
    data: data,
  });
}

/**
 * @param 删除政策
 */
export async function deletePolicy(value) {
  return request(`/yifu-business/method/customerBusiness/tpolicy/${value}`, {
    method: 'delete',
  });
}

/**
 * 获取预警提醒消息列表
 * @param {*} params
 */
export async function loadwarnList(params) {
  return request('/yifu-business/method/tbuswarningMessage/page', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
