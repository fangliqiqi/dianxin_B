import request from '@/utils/request';


/**
 * 获取薪酬工资表
 * @param {*} params
 */
export async function loadSalaryTableData(params) {
  return request('/salary/customerBusiness/businessSalary/getSettlementFormVoPage', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 获取报账列表
 * @param {*} params
 */
export async function loadSalaryReportListData(params) {
  return request('/salary/customerBusiness/businessSalary/getSalaryStandardPage', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 工资详情-获取项目报账列表
 * @param {*} params
 */
export async function loadProjectBillList(params) {
  return request('/salary/customerBusiness/businessSalary/getSalaryAccountAndItemVoPage', {
    method: 'GET',
    params: {
      ...params
    }
  })
}

/**
 * 工资详情-获取详情上的统计
 * @param {*} params
 */
export async function loadDetailStasticsData(params) {
  return request('/salary/customerBusiness/businessSalary/getSettlementStasticsBySalaryFormId', {
    method: 'GET',
    params: {
      ...params
    }
  })
}
