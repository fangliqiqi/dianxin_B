import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import LoginForm from './components/Login';
import styles from './style.less';
import { useAliveController } from 'react-activation';
import { getRemoteServerTime } from '@/services/login';

const { Submit, Mobile, Captcha,Tab,UserName,Password } = LoginForm;

const Login = (props) => {
  const { submitting, dispatch } = props;
  const [type, setType] = useState('account');
  const { clear } = useAliveController()

  const handleSubmit = async (values) => {
    // dispatch({
    //   type: 'login/captchaLogin',
    //   payload: { ...values },
    // });

    if (type === 'mobile') {
      // 短信验证码登录
      dispatch({
        type: 'login/captchaLogin',
        payload: { ...values },
      });
    } else {
      // 账号密码登录
      // const timeStamp = await getRemoteServerTime();
      // dispatch({
      //   type: 'login/passwordLogin',
      //   payload: { ...values, timeStamp },
      // });
      const  timeStamp = ''
      dispatch({
        type: 'login/passwordLogin',
        payload: { ...values}
      });
    }
  };

  useEffect(() => {

    clear();
  }, [])

  const change = (values) => {
    setType(values)
  }

  return (
    <div className={styles.main}>
      <LoginForm activeKey={type} onTabChange={change} onSubmit={handleSubmit}>

        {/* <Tab key="account" tab="账户密码登录"> */}
        <div className={styles.title}>账户密码登录</div>
          <UserName
            name="username"
            placeholder="用户名"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        {/* </Tab> */}

        
        {/* <Tab key="mobile" tab="手机号登录">
          <Mobile
            name="phone"
            placeholder="输入手机号"
            rules={[
              {
                required: true,
                message: '请输入手机号！',
              },
              {
                pattern: /^1\d{10}$/,
                message: '手机号格式错误！',
              },
            ]}
          />
          <Captcha
            name="verifyCode"
            placeholder="输入验证码"
            countDown={120}
            getCaptchaButtonText=""
            getCaptchaSecondText="秒"
            rules={[
              {
                required: true,
                message: '请输入验证码！',
              },
            ]}
          />
        </Tab> */}
        
        <Submit loading={submitting}>登录</Submit>
      </LoginForm>
    </div>
  );
};

export default connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/captchaLogin'],
}))(Login);
