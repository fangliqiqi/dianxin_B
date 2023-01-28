import request from "@/utils/request";

/*
  列表接口
  type类型：0短信；1系统消息
*/
export async function warnList(query) {
    return request('/yifu-business/method/tbuswarning/page', {
      method: 'GET',
      params: query,
    });
  }

/*
  短信发送列表
*/ 
export async function noteList(query) {
    return request('/yifu-business/method/tbuswarningemployee/page', {
      method: 'GET',
      params: query,
    });
  }

// 手动发送短信
export async function sendBusSms(params) {
    return request('/yifu-business/method/tbuswarningemployee/sendBusSms', {
      method: 'POST',
      data: params,
    });
  }


