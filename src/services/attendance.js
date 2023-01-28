import request from '@/utils/request';

// 列表
export async function attendanceList(query) {
  return request('/yifu-business/method/vacationInfo/getListByPage', {
    method: 'GET',
    params: query,
  });
}

// 添加
export async function addAttendance(query) {
  return request('/yifu-business/method/vacationInfo', {
    method: 'POST',
    data: query,
  });
}

// 导入
export async function importAttendance(query) {
  return request('/yifu-business/method/vacationInfo/batchImportByJsonStr', {
    method: 'POST',
    data: query,
  });
}

// 导出
export async function exportAttendance(query) {
  return request('/yifu-business/method/vacationInfo/getList', {
    method: 'GET',
    params: query,
  });
}

// 销假
export async function cancelAttendance(id, query) {
  return request(`/yifu-business/method/vacationInfo/vacationEnd/${id}`, {
    method: 'POST',
    data: query,
  });
}

// 查看详情
export async function getAttendance(id) {
  return request(`/yifu-business/method/vacationInfo/${id}`, {
    method: 'GET',
  });
}

// 删除
export async function delAttendance(id) {
  return request(`/yifu-business/method/vacationInfo/${id}`, {
    method: 'DELETE',
  });
}

export async function getRemainAttendance(idcard) {
  return request(
    `/yifu-business/method/vacationMonitor/getNotUsedVacationDurationByIdCard?idcard=${idcard}`,
    {
      method: 'GET',
    },
  );
}
