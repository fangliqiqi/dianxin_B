import request from '@/utils/request';

/**
 * 获取商险列表分页查询
 * @param {*} params
 */
export async function loadInsuranceListData(params) {
  return request('/busiInsurance/customerBusiness/businessTaking/getTakingByBusiness', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 查询商险到期提醒条数
 * @param {*} params
 */
export async function loadTakingWarnNumber(params) {
  return request('/busiInsurance/customerBusiness/businessTaking/getTakingWarningNum', {
    method: 'GET',
    params: {
      ...params
    }
  })
}
