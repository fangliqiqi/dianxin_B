import React, { useEffect, useRef } from 'react';
import { useIntl, history, connect, KeepAlive } from 'umi';
import DetailHeader from '@/components/DetailHeader';
import { Tabs } from 'antd';
import styles from './BlankLayout.less';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';

const { TabPane } = Tabs;

const PersonerLayout = (props) => {
  const { children,
    location = {
      pathname: '',
    },
    menuList = [],
    route = {
      routes: [],
    },
  } = props;

  const couterRef = useRef();

  const { routes = [] } = route;

  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });

  useEffect(() => {
    couterRef.current.scrollIntoView();
  }, [])

  // socialfund 社保
  // salary 薪酬

  const author = () => {

    let view = 0
    let menus = [];

    if (menuList && menuList.length > 0) {
      menus = menuList;
    } else {
      menus = JSON.parse(localStorage.getItem('menuList') || "[]")
    }

    menus.forEach(element => {

      if (element.path === '/salary') { // 薪酬
        view = view + 1;
      }

      if (element.path === '/socialfund') { // 社保
        view = view + 2;
      }
    });

    if (view === 1) {
      return (<TabPane tab="薪酬" key="/m/personerInfo/pay" />)
    } else if (view === 2) {
      return (<TabPane tab="社保" key="/m/personerInfo/security" />)
    } else if (view === 3) {
      return (<>
        <TabPane tab="薪酬" key="/m/personerInfo/pay" />
        <TabPane tab="社保" key="/m/personerInfo/security" />
      </>)
    }
    return null;
  }

  const change = (key) => {
    history.replace({
      pathname: key,
      query: {
        title: location.query.title,
        id: location.query.id,
        empId: location.query.empId,
        empIdcard: location.query.empIdcard,
        settleDomain: location.query.settleDomain,
      },
    });
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="format-detection" content="telephone=no"></meta>
      </Helmet>

      <div className={styles.container} ref={couterRef}>
        <DetailHeader title={location.query.title} backUrl="/employeeManage/employeeList">
          <div className={styles.tabLayout}>
            <Tabs activeKey={location.pathname} centered={true} onChange={change}>
              <TabPane tab="档案" key="/m/personerInfo/archives" />
              {author()}
              <TabPane tab="假勤信息" key="/m/personerInfo/attendance" />
              <TabPane tab="证件信息" key="/m/personerInfo/certificate" />
            </Tabs>
          </div>
        </DetailHeader>
        <div className={styles.showContentBox} style={{marginTop:'116px'}}>
          {children}
          {/* <KeepAlive when={[false, true]}>
            {children}
          </KeepAlive> */}
        </div>
      </div>
    </HelmetProvider>
  );
};


export default connect(({ global, settings }) => ({
  menuList: global.menuList,
  ...settings
}))(PersonerLayout);
