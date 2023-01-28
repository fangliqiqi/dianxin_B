/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect,useState,useMemo } from 'react';
import { Link, connect, history } from 'umi';
import RightContent from '@/components/GlobalHeader/RightContent';
import logo from '../assets/hr_logo.png';
import PolicyCenter from '@/components/PolicyCenter';
import styels from './BasicLayout.less';
// import { getMatchMenu } from '@umijs/route-utils';
// import Authorized from '@/utils/Authorized';
// import * as allIcons from '@ant-design/icons';
// import { dynamic } from 'umi';
import { getRouteAuthority,hasRouter } from '@/utils/utils';
import RenderAuthorized from '@/components/Authorized';

const Authorized = RenderAuthorized('user');

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    menuListData,
    location
  } = props;

  // 后台管理的页面布局（显示右侧政策列表）
  const manageRoute = ['/employeeManage', '/attendanceManage/attendanceInfo', '/attendanceManage/annualControl'];

  // const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'global/getMenuList',
        payload: {},
        // payload: { type: 0 },
      });
    }
  }, []);

  // 根据树形结构查找菜单
  const getSpecialMenu = (tree, name) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tree) {
      if (item.name === name) return item
      if (item.children) {
        const res = getSpecialMenu(item.children, name)
        if (res) return res
      }
    }
    return null
  }

  // 根据树形结构生成另一个树形结构
  const genarateTree = (tree, menuList, arrList) => {
    if (!tree.length) return [];
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tree) {
      const res = getSpecialMenu(menuList, item.name);
      const temp = {
        path: item.path,
        key: item.path,
        name: item.name,
        hideInMenu: item.hideInMenu,
        icon: res ? res.icon : '',
        // component: dynamic(import('@/page' + item.component))
      };

      if (res && res.component) {
        temp.component = res.component;
      }
      if (item.children) {
        const arr = []
        item.children.forEach(route => {
          const ress = getSpecialMenu(menuList, route.name);
          const obj = {
            path: route.path,
            name: route.name,
            key: route.path,
            hideInMenu: route.hideInMenu,
            icon: ress ? ress.icon : '',
            // component: dynamic(import('@/page' + route.component))
          }
          if (ress && ress.component) {
            obj.component = ress.component;
          }
          arr.push(obj);
        })
        temp.children = arr;
      }
      arrList.push(temp);
    }
    return arrList;
  }

  const loopMenuItem = (menuList, menuListDatas = []) => {
    // return menuList;
    const resArr = [];
    menuListDatas.forEach((item) => {
      const res = getSpecialMenu(menuList, item.name);
      // const fixIconName = `${item.icon.slice(0, 1).toLocaleUpperCase()}${item.icon.slice(1)}Outlined`;
      const temp = {
        path: item.path,
        key: item.path,
        name: item.name,
        hideInMenu: item.hideInMenu,
        icon: res ? res.icon : '',
        // icon: React.createElement(allIcons[fixIconName] || allIcons[item.icon]),
        children: item.routes
      };
      if (res && res.component) {
        temp.component = res.component
      }
      if (item.children) {
        temp.children = genarateTree(item.children, menuList, []);
      }
      resArr.push(temp);
    })
    return resArr;
  }

   // get children authority
  // const authorized = useMemo(() =>{
  //     console.log(menuListData,props.source,localStorage.getItem('menuList'))
  //     const menu = getMatchMenu(location.pathname || '/', menuListData||[]);
  //     debugger
  //     return getMatchMenu(location.pathname || '/', menuListData||[]).pop() || {
  //       authority: undefined,
  //     }
  //   },
  //   [location.pathname],
  // );

  return (
    <ProLayout
      siderWidth={200}
      logo={logo}
      menuHeaderRender={(logo, titleDom) => (
        <Link to={localStorage.getItem('indexUrl')}>{logo}{titleDom}</Link>
      )}
      onMenuHeaderClick={() => history.push(localStorage.getItem('indexUrl'))}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      menuDataRender={(menulist) => loopMenuItem(menulist,menuListData)}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      <div className={styels.content}>
        <div className={styels.card}>
          <Authorized
            authority={hasRouter(location.pathname, JSON.parse(localStorage.getItem('menuList'))) || []}
            // authority={['user']}
          >
            {children}
          </Authorized>
        </div>
        {
          manageRoute.find(item => props.location.pathname.indexOf(item) > -1) ? (<div className={styels.policyCenter}>
            <PolicyCenter />
          </div>) : null
        }
      </div>
    </ProLayout>

  );
};

export default connect(({ global, settings }) => ({
  menuListData: global.menuList,
  settings,
}))(BasicLayout);
