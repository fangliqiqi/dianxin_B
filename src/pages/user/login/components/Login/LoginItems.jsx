import { Button, Col, Input, Row, Form, message } from 'antd';
import React, { useState, useCallback, useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import omit from 'omit.js';
import { getRemoteServerTime, getCaptcha } from '@/services/login';
import ItemMap from './map';
import LoginContext from './LoginContext';
import styles from './index.less';
import { passwordStr } from '@/utils/aes';

const FormItem = Form.Item;

const getFormItemOptions = ({ onChange, defaultValue, customProps = {}, rules }) => {
  const options = {
    rules: rules || customProps.rules,
  };

  if (onChange) {
    options.onChange = onChange;
  }

  if (defaultValue) {
    options.initialValue = defaultValue;
  }

  return options;
};

const LoginItem = (props) => {
  const [count, setCount] = useState(props.countDown || 0);
  const [timing, setTiming] = useState(false); // 这么写是为了防止restProps中 带入 onChange, defaultValue, rules props tabUtil

  const [timingLoading, setTimingLoading] = useState(false);

  const {
    onChange,
    customProps,
    defaultValue,
    rules,
    name,
    getCaptchaButtonText,
    getCaptchaSecondText,
    updateActive,
    type,
    tabUtil,
    ...restProps
  } = props;
  const onGetCaptcha = useCallback(async (mobile) => {
    // 获取时间戳
    const timeStamp = await getRemoteServerTime();

    const formData = new FormData();
    const password = passwordStr(timeStamp, mobile);
    formData.append('phone', mobile);
    formData.append('decodePhone', password);
    formData.append('timeStamp', timeStamp);

    // 获取短信验证码
    const result = await getCaptcha(formData);

    setTimingLoading(false);
    if (!result || result.code !== 200) {
      return;
    }

    message.success('验证码发送成功！');
    setTiming(true);
  }, []);

  useEffect(() => {
    let interval = 0;
    const { countDown } = props;

    if (timing) {
      interval = window.setInterval(() => {
        setCount((preSecond) => {
          if (preSecond <= 1) {
            setTiming(false);
            clearInterval(interval); // 重置秒数

            return countDown || 60;
          }

          return preSecond - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timing]);

  if (!name) {
    return null;
  } // get getFieldDecorator props

  const options = getFormItemOptions(props);
  const otherProps = restProps || {};


  const captchaTitle = () => {

    if (timing) {
      return `${count} 秒`;
    }

    if (timingLoading) {
      return '获取中';
    } else {
      return '获取验证码';
    }
  }

  if (type === 'Captcha') {
    const inputProps = omit(otherProps, ['onGetCaptcha', 'countDown']);
    return (
      <FormItem shouldUpdate noStyle>
        {({ getFieldValue }) => (
          <Row gutter={8}>
            <Col span={16}>
              <FormItem name={name} {...options}>
                <Input {...customProps}  {...inputProps} />
              </FormItem>
            </Col>
            <Col span={8}>
              <Button
                disabled={timing}
                className={styles.getCaptcha}
                size="large"
                loading={timingLoading}
                onClick={() => {
                  const value = getFieldValue('phone');

                  if (!value) {
                    message.error('请输入手机号');
                    return;
                  }

                  setTimingLoading(true);
                  onGetCaptcha(value);
                }}
              >
                {captchaTitle()}
              </Button>
            </Col>
          </Row>
        )}
      </FormItem>
    );
  }

  return (
    <FormItem name={name} {...options}>
      <Input {...customProps} {...otherProps} />
    </FormItem>
  );
};


const LoginItems = {};
Object.keys(ItemMap).forEach((key) => {
  const item = ItemMap[key];
  LoginItems[key] = (props) => (
    
    <LoginContext.Consumer>
      {(context) => (
        <LoginItem
          customProps={item.props}
          rules={item.rules}
          {...props}
          type={key}
          prefix={item.props.type=='password'?<LockOutlined/>:<UserOutlined/>} 
          {...context}
          updateActive={context.updateActive}
        />
      )}
    </LoginContext.Consumer>
  );
});
export default LoginItems;
