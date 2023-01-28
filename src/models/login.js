import { history } from 'umi';
import { accountLogin, captchaLogint } from '@/services/login';
import { logout, getFirstRouter } from '@/utils/utils';
import { passwordStr } from '@/utils/aes';
import { menuList } from '@/services/global';
import { message,notification } from 'antd';
function loginSuccess(response, put) {
  if (response.code === 200) {
    const accessToken = response.data.oauth2AccessToken.access_token;
    const tokenType = response.data.oauth2AccessToken.token_type;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('token_type', tokenType);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('user_id', response.data.user ? response.data.user.id : null);
    menuList().then((res) => {
      if (res.code === 200) {
        const munes = res.data || [];
        const url = getFirstRouter(munes);
        localStorage.setItem('indexUrl', url);
        put({ type: 'saveCurrentUser', payload: response.data.user });
        history.push(url);
      } else {
        message.warning('该用户暂无权限，请授权后再登录!');
      }
    });
  }
}

const login = {
  namespace: 'login',
  state: {
    status: 0,
  },
  effects: {
    *passwordLogin({ payload }, { call, put }) {
      const user = passwordStr({
        data: payload,
        key: 'thanks,yifucloud',
        param: ['password'],
      });
      const loginData = {
        username: payload.username,
        password: user.password,
      };
      const response = yield call(accountLogin, loginData);
      if(response.hasOwnProperty('data')){
        const resData = response.data.user
        if(resData.type !=2){
        return notification.error({
            message: '错误',
            description: '当前用户无B端访问权限，请联系管理员开通B端账户！',
          });
        }
        if(resData.type ==2 && !resData.clientRoleMap){
          return notification.error({
            message: '错误',
            description: '当前用户无角色权限，请联系管理员分配！',
          });
        }
      }
      loginSuccess(response, put);
    },

    *captchaLogin({ payload }, { call, put }) {
      const formData = new FormData();
      formData.append('phone', payload.phone);
      formData.append('verifyCode', payload.verifyCode);
      const response = yield call(captchaLogint, formData);
      loginSuccess(response, put);
    },

    logout() {
      // 退出登录
      logout();
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },
  },
};
export default login;
