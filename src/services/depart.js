import request from '@/utils/request';

// 部门列表
export async function departList(query) {
  return request('/yifu-business/method/tbusdept/page', {
    method: 'GET',
    params: query,
  });
}

// 获取所有部门列表不包括删除
export async function getDepartAll(query) {
  return request('/yifu-business/method/tbusdept/getTBusDeptList', {
    method: 'GET',
    params: query,
  });
}

// 获取所有部门包含删除
export async function allDeparts(query) {
  return request('/yifu-business/method/tbusdept/getTBusDeptListAsso', {
    method: 'GET',
    params: query,
  });
}

// 获取树形部门列表
export async function getTreeDepart(query) {
  return request('/yifu-business/method/tbusdept/getTBusDeptTree', {
    method: 'GET',
    params: query,
  });
}

// 添加编辑部门
export async function addDepart(params,methods) {
  return request('/yifu-business/method/tbusdept', {
    method: methods,
    data: params,
  });
}

// 删除部门
export async function deleteDepart(id) {
  return request(`/yifu-business/method/tbusdept/${id}`, {
    method: 'DELETE',
  });
}

// 批量导入部门
export async function addBatchDepart(params,methods) {
  return request('/yifu-business/method/tbusdept/importDept', {
    method: methods,
    data: params,
  });
}

// 查询父级的平级list
export async function getParentDepart(query) {
  return request('/yifu-business/method/tbusdept/getParentList', {
    method: 'GET',
    params: query,
  });
}

// 根据id查询子部门
export async function getSubDepart(query) {
  return request('/yifu-business/method/tbusdept/getBusDepartByLevelOrPid', {
    method: 'GET',
    params: query,
  });
}
