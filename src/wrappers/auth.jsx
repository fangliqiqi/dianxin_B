import React from 'react';
import { Redirect } from 'umi';

export default (props) => {
  const isLogin = localStorage.getItem('token');

  if (isLogin) {
    return <>{props.children}</>;
  }

  return <Redirect to="/user/login" />;
};
