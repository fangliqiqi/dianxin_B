import request from '@/utils/request';

/**
 * 获取用工事件列表分页查询
 * @param {*} params
 */
export async function loadIncidentsListData(params) {
  return request('/hrEmergency/customerbusiness/businessEmergency/getEmergencyByBusiness', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 获取用工事件头部统计数据
 * @param {*} params
 */
export async function loadIncidentsStatiscData(params) {
  return request('/hrEmergency/customerbusiness/businessEmergency/getEmergencyNumsByBusiness', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 获取用工事件详情数据
 * @param {*} params
 */
export async function loadIncidentsDetail(params) {
  return request('/hrEmergency/customerbusiness/businessEmergency/getById', {
    method: 'GET',
    params: {
      ...params
    }
  })
}
