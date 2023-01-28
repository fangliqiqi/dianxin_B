import request from '@/utils/request';

// 列表
export async function getCertList(query) {
  return request('/yifu-business/method/tcertinfo/page', {
    method: 'GET',
    params: query,
  });
}

// 新增
export async function addCertInfo(query) {
  return request('/yifu-business/method/tcertinfo', {
    method: 'POST',
    data: query,
  });
}

// 修改
export async function editCertInfo(query) {
  return request('/yifu-business/method/tcertinfo', {
    method: 'PUT',
    data: query,
  });
}

// 批量导入
export async function importCert(query) {
  return request('/yifu-business/method/tcertinfo/batchImportCertByJsonStr', {
    method: 'PUT',
    data: query,
  });
}

// 批量更新
export async function batchEditCert(query) {
  return request('/yifu-business/method/tcertinfo/batchUpdateCertByJsonStr', {
    method: 'PUT',
    data: query,
  });
}

// 删除
export async function delCert(id) {
  return request(`/yifu-business/method/tcertinfo/${id}`, {
    method: 'DELETE',
  });
}

// 查看详情
export async function getDetail(id) {
  return request(`/yifu-business/method/tcertinfo/${id}`, {
    method: 'GET',
  });
}

// 导出
export async function exportCert(query) {
  return request(`/yifu-business/method/tcertinfo/getCertInfoForExport`, {
    method: 'GET',
    params: query,
  });
}

// 根据身份证查找证件信息
export async function allTcertinfo(query) {
  return request(`/yifu-business/method/tcertinfo/getByempIdcard`, {
    method: 'GET',
    params: query,
  });
}
