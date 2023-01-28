import React from 'react';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useIntl, connect } from 'umi';
import logo from '../assets/hr_logo.png';
import styles from './UserLayout.less';

const UserLayout = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;

  const { routes = [] } = route;

  const {
    children,
    location = {
      pathname: '',
    },
  } = props;

  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="format-detection" content="telephone=no"></meta>
      </Helmet>

      <div className={styles.container}>

        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>皖信人力</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
