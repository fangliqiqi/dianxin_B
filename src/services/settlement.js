import request from '@/utils/request';

// 列表
export async function getSettleList(query) {
  return request('/yifu-business/method/tbussettle/page', {
    method: 'GET',
    params: query,
  });
}

// 列表查重
export async function tbusSettleList(query) {
  return request('/yifu-business/method/tbussettle/getTBusSettleList', {
    method: 'GET',
    params: query,
  });
}

// 根据ID查询详情
export async function getSettleByid(value) {
  return request(`/yifu-business/method/tbussettle/${value}`, {
    method: 'GET',
  });
}

// 查询附件信息
export async function getBusAttaList(query) {
  return request('/yifu-business/method/tbusattainfo/getBusAttaList', {
    method: 'GET',
    params: query,
  });
}

// 删除标签 （假删除）
export async function deleteSettle(value) {
  return request(`/yifu-business/method/tbussettle/${value}`, {
    method: 'DELETE',
  });
}

// zip 文件导入
export async function importZip(param) {
  return request('/yifu-business/method/tbussettle/importZip', {
    method: 'POST',
    data: param,
  });
}
