
import React, { useRef, useEffect } from 'react';
import styles from './BlankLayout.less';
import DetailHeader from '@/components/DetailHeader';
import { useIntl, connect, KeepAlive } from 'umi';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const BlankLayout = props => {
  const { children,
    location = {
      pathname: '',
    },
    route = {
      routes: [],
    },
    dispatch,
    pageTitle = location.query.title,
    socialFundTitle
  } = props;

  const { routes = [] } = route;

  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });
  const couterRef = useRef();

  useEffect(() => {
    couterRef.current.scrollIntoView();

    // 重置标题
    dispatch({ type: 'socialfund/updateSocialfundTitle', payload: { title: location.query.title || '' }, });
  }, [])

  return (

    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="format-detection" content="telephone=no"></meta>
      </Helmet>
      <div className={styles.container} ref={couterRef}>

        <DetailHeader pathname={location.pathname} title={pageTitle?pageTitle:socialFundTitle} />

        <div className={styles.showContentBox}>
          <KeepAlive when={[false, true]}>
            {children}
          </KeepAlive>
        </div>

      </div>
    </HelmetProvider>
  )
}

export default connect(({ settings, socialfund }) => {
  return ({
    ...settings,
    socialFundTitle: socialfund.socialFundTitle,
  })

})(BlankLayout);
