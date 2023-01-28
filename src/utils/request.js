/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { logout } from '@/utils/utils';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  417: '您的IP已被禁止访问，如果有必要请联系管理员。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 消息通知弹窗
function noticesError(m, d) {
  notification.error({
    message: m,
    description: d,
  });
}

// 异常处理程序
const errorHandler = (error) => {
  const { response, data } = error;
  if (response && response.status) {   // 错误了进来
    if (data && data.msg && response.url.search('customerBusiness/user/menu') ==-1 && response.status !=424) {
      noticesError('错误', data.msg);
    } else if(data && data.msg && response.status ==424 && data.msg =='token expire'){
      noticesError('错误', 'Token已失效，请重新登录');
    }else{
      const { status, url } = response;
      let errorText = codeMessage[status] || response.statusText;
      if (data &&  data.code ==1 && data.msg) {
        errorText = data.msg;
      }
      noticesError(`错误 ${status}`, `${errorText}`);
    }
  }else if (!response) {
    noticesError('网络异常', '您的网络发生异常，无法连接服务器');
  }
  return response;
};

// 配置request请求时的默认参数
const request = extend({
  prefix: '/api', // 代理api
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

// 请求前拦截器
request.interceptors.request.use((_, options) => {
  const option = options;
  if (!option.headers.Authorization) {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      option.headers.Authorization = `${tokenType} ${token}`;
      option.headers['user'] = localStorage.getItem('user_id');
    }
  }

  return {
    options: {
      ...option,
    },
  };
});

// 提前对响应做异常处理
request.interceptors.response.use(async (response) => {
  if (response && response.status) {
    if (response.status === 401 || response.status === 424) {
      // 登录失效,退出登录
      logout();
    }
    if (response.status === 200) {
      const data = await response.clone().json();
      const code = Number(data.code || 200);

      if (code > 200) {
        noticesError(`错误`, data.msg);
      }
    }
  }

  return response;
});

export default request;
