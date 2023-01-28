
import request from "@/utils/request";

// 标签列表
export async function tagsList(query) {
    return request('/yifu-business/method/tbuslable/page', {
      method: 'GET',
      params: query,
    });
  }

// 新增标签
export async function addTags(params,methods) {
    return request('/yifu-business/method/tbuslable', {
      method: methods,
      data: params,
    });
  }

// 修改标签
export async function editTags(params,methods) {
    return request('/yifu-business/method/tbuslable', {
      method: methods,
      data: params,
    });
  }

// 删除标签 （假删除）
export async function deleteTags(params,methods) {
    return request('/yifu-business/method/tbuslable', {
      method: methods,
      data: params,
    });
  }

// 根据ID 获取标签详情
export async function getidTags(id) {
  return request(`/yifu-business/method/tbuslable/${id}`, {
    method: 'get',
  });
}

// 获取所有标签
export async function getAllTags(params) {
  return request('/yifu-business/method/tbuslable/getTBusLableList', {
    method: 'get',
    data: params,
  });
}

