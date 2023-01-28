import request from '@/utils/request';

const authorizationKey = 'Basic eWlmdS1tdnA6eWlmdS1tdnA=';

// 获取服务器时间戳
export async function getRemoteServerTime() {
  return request('/getTimeStamp', {
    method: 'GET',
  });
}

// 账号密码登录
export async function accountLogin(params) {
  return request('/yifu-auth/method/login', {
    method: 'POST',
    params,
    headers: {
      Authorization: authorizationKey,
      'Content-Type': 'application/json',
    },
  });
}

// 获取短信验证码
export async function getCaptcha(params) {
  return request('/auth/oauth/sendCode', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: authorizationKey,
    },
  });
}

// 短信验证码登录
export async function captchaLogint(params) {
  return request('/auth/phoneLogin', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: authorizationKey,
      contentType: '',
    },
  });
}
