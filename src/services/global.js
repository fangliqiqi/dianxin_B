import request from '@/utils/request';

export async function menuList(params) {
  // return request('/admin/customerBusiness/user/menu', {
  //   method: 'GET',
  //   params: params,
  // })
  return request('/yifu-upms/method/customerBusiness/user/menu', {
    method: 'GET',
    params: params,
  });
}

/**
 * 根据字典类型查询状态字典
 * @param {*} params
 */
export async function loadDictionaryValue(code, params) {
  return request(`/yifu-upms/method/customerBusiness/user/itemType/${code}`, {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 将后台返回的字典数组，转成以value为key,label为value的对象
 * @param {*} optionArray
 */
export function filterMultiDictText(optionArray) {
  const result = {};
  if (optionArray && Array.isArray(optionArray)) {
    optionArray.forEach((item) => {
      result[item.value] = item.label;
    });
  }
  return result;
}

/**
 * 获取客户单位带分页
 * @param {*} params
 */
export async function loadProject(params) {
  // return request('/yifu-business/method/customerBusiness/customerInfo/settleDomainPage', {
  return request('/yifu-archives/method/tempchangeinfo/getAllDeptPage', {
    method: 'GET',
    params: {
      ...params,
      flag: 1,
    },
  });
}

// 获取业务项目
export async function getProjectList(params) {
  return request('/yifu-archives/method/customerBusiness/customerInfo/ownSettleDomain', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 获取项目 无分页
export async function loadCustomerAll(params) {
  return request('/yifu-business/method/customerBusiness/customerInfo/ownSettleDomainNoPage', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 获取客户单位
 * @param {*} params
 */
export async function loadCustomer(params) {
  return request('/yifu-business/method/customerBusiness/customerInfo/customerPage', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 根据结算id查询结算主体信息
 */
export async function tsettledomain(id) {
  return request(`/yifu-business/method/tsettledomain/${id}`);
}

// 获取字典
export async function getDictMap(query) {
  return request(`/yifu-business/method/sysbusdict/getBusiDicMap`, {
    method: 'GET',
    params: query,
  });
}

// 上传单个附件
export async function uploadFile(data) {
  return request(`/yifu-business/method/fileUpload/ossUploadFile`, {
    method: 'POST',
    data,
  });
}
// 上传多个附件
export async function uploadMuiltFile(query) {
  return request(`/yifu-business/method/fileUpload/ossUploadFileMultipart`, {
    method: 'POST',
    data: query,
  });
}
// 删除附件
export async function delUploadFile(id) {
  return request(`/yifu-business/method/fileUpload/ossFileDelete/${id}`, {
    method: 'get',
  });
}
