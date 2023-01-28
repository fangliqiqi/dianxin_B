import request from '@/utils/request';

/**
 * 获取社保公积金列表
 * @param {*} params
 */
export async function loadSocialFundList(params) {
  return request('/hrSocial/customerBusiness/dispatchBusiness/getSocialAndFundBusinessPage', {
    method: 'GET',
    params: {
      ...params
    }
  });
}

/**
 * 社保公积金二级页面列表数据
 * @param {*} params
 */
export async function getPaymentByMonthAndAuth(params) {
  return request('/hrSocial/customerBusiness/dispatchBusiness/getPaymentByMonthAndAuth', {
    method: 'GET',
    params: {
      ...params
    }
  });
}

/**
 * 头部统计数据（增员、减员）
 * @param {*} params
 */
export async function getStaticsByMonth(params) {
  return request('/hrSocial/customerBusiness/dispatchBusiness/getPaymentBusinessPageDetailByMonthAndAuth', {
    method: 'GET',
    params: {
      ...params
    }
  });
}

/**
 * 社保公积金二级页面列表展开的详情数据
 * @param {*} params
 */
export async function getPaymentByMonthAndEmpId(params) {
  return request('/hrSocial/customerBusiness/dispatchBusiness/getPaymentByMonthAndEmpId', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 社保公积金二级页面点击头部统计的 减员调取的接口
 * @param {*} params
 */
export async function getSocialAndFundReduceInfo(params) {
  return request('/hrSocial/customerBusiness/dispatchBusiness/getSocialAndFundReduceInfo', {
    method: 'GET',
    params: {
      ...params
    }
  })
}
