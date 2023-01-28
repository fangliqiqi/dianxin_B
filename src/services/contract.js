import request from '@/utils/request';

// B端查询合同到期提醒数（查询3个月内到期的合同）
export async function getContractBusinessAlertCount() {
    return request('/hrBase/customerBusiness/temployeeBusiness/getContractBusinessAlertCount', {
        method: 'GET'
    });
}

// B端合同列表查询接口（alertFlag： 0-按3个月内到期提醒 1-不安提醒查询）
export async function getContractBusinessPage(params) {
    return request('/hrBase/customerBusiness/temployeeBusiness/getContractBusinessPage', {
        method: "GET",
        params: params
    })
}

// B端查询对应员工指定合同ID之外的其他合同信息
export async function getOtherContractBusinessInfo(params) {
    return request('/hrBase/customerBusiness/temployeeBusiness/getOtherContractBusinessInfo', {
        method: "GET",
        params: params
    })
}
