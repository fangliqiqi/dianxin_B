import request from '@/utils/request';

// 管理界面，用户列表
export async function adminList(params) {
  return request('/yifu-upms/method/customerBusiness/user/page', {
    method: 'GET',
    params: params,
  });
}

// 创建账号
export async function createUserApi(params) {
  return request('/yifu-upms/method/customerBusiness/user/saveBusinessUser', {
    method: 'POST',
    data: params,
  });
}

// 编辑用户

// 禁用或启用用户
export async function updateLock(params) {
  return request('/yifu-upms/method/customerBusiness/user/updateLock', {
    method: 'GET',
    params: params,
  });
}

// 获取用户权限组
export async function getRoleAndMenu(params) {
  return request('/yifu-upms/method/customerBusiness/user/getRoleAndMenu', {
    method: 'GET',
    params: params,
  });
}

// 保存选择的用户权限
export async function saveRoleMenu(params, data) {
  return request('/yifu-upms/method/customerBusiness/user/saveRoleM', {
    method: 'POST',
    params: params,
    data: data,
  });
}

// 获取已保存的用户信息
export async function userInfo(userId) {
  return request(`/admin/customerBusiness/user/userInfo/${userId}`);
}

// 搜索客户单位
export async function searchCustomer(params) {
  return request('/yifu-archives/method/customerBusiness/customerInfo/customerPage', {
    method: 'GET',
    params: params,
  });
}

// 搜索结算单位
export async function getSettleDomain(id) {
  return request(`/yifu-archives/method/customerBusiness/customerInfo/getSettleDomain/${id}`, {
    method: 'GET',
  });
}

// 保存客户关系
export async function saveMSetttleCustomerUser(params) {
  return request(
    '/yifu-archives/method/customerBusiness/customerInfo/batch/saveMSetttleCustomerUser',
    {
      method: 'POST',
      data: params,
    },
  );
}

// 获取已保存的客户结算主体
export async function customerForBusinessVo(userId) {
  return request(
    `/yifu-archives/method/customerBusiness/customerInfo/CustomerForBusinessVo/${userId}`,
  );
}

// 获取统计数据
export async function userInfoCount() {
  return request('/yifu-upms/method/customerBusiness/user/userInfoCount');
}
