import React, { useState } from 'react';
import { connect } from 'umi';
import styles from './index.less';
import MenuItem from './MenuItem';
import Dialog from '@/components/DialogModal';

const GlobalHeaderRight = (props) => {
  const { theme, layout, dispatch, currentUser = JSON.parse(localStorage.getItem('user')) } = props;

  const [logoutVisible, setLogoutVisible] = useState(false);

  let className = styles.right;
  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <>
      <div className={className}>
        <MenuItem icon="icongerenzhongxin">{currentUser.nickName || currentUser.nickname}</MenuItem>
        <MenuItem icon="icontuichu"
          onClick={() => {
            setLogoutVisible(true);
          }}
        >
          退出
        </MenuItem>
      </div>

      {logoutVisible ? (
        <Dialog
          desc="退出后需要重新登录"
          modalVisible={logoutVisible}
          onCancel={() => {
            setLogoutVisible(false);
          }}
          onSubmit={() => {
            if (dispatch) {
              dispatch({
                type: 'login/logout',
              });
            }
          }}
        />
      ) : null}
    </>
  );
};

export default connect(({ settings, login }) => ({
  theme: settings.navTheme,
  layout: settings.layout,
  currentUser: login.currentUser,
}))(GlobalHeaderRight);
