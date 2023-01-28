import styles from './index.less';
import React, { useEffect, useState } from 'react';
import { loadPolicyList, loadwarnList } from '@/services/policy';
import { history } from 'umi';
import { Tabs, List, Spin, Tooltip, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import Time from '@/components/Time';
import { hasAuthRouter } from '@/utils/utils';

const PolicyCenter = (props) => {
  const [policylist, setPolicylist] = useState([]); // 政策中心列表数据
  const [warninglist, setWarninglist] = useState([]); // 提醒消息列表数据
  const [current, setCurrent] = useState(2); // 提醒消息列表数据
  const [total, setTotal] = useState(0); // 提醒消息列表总数据
  const [hasmore, setHasmore] = useState(true); // 是否开启下拉更新

  const [showMore, setShowMore] = useState(false); // 是否显示更多按钮
  const { TabPane } = Tabs;

  useEffect(() => {
    // 获取政策中心列表
    loadPolicyList({ size: 10 })
      .then((res) => {
        if (Number(res.code) === 200) {
          if (res.data.records && Array.isArray(res.data.records)) {
            setPolicylist(res.data.records);
          }
          const isShow = Number(res.data.total) > 10 ? true : false;
          setShowMore(isShow);
        } else {
          setShowMore(false);
        }
      })
      .catch((err) => {
        console.log('获取政策中心列表失败', err);
      });

    // 获取短信列表的信息
    loadwarnList({ current: 1, size: 20 })
      .then((res) => {
        if (Number(res.code) === 200) {
          if (res.data.records && Array.isArray(res.data.records)) {
            setWarninglist(res.data.records);
            setTotal(res.data.total);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
    //  handleInfiniteOnLoad()
  }, []);

  // 滚动加载事件
  const handleInfiniteOnLoad = () => {
    // 超过条数 禁止加载
    if (warninglist.length >= total) {
      setHasmore(false);
      message.warning('所有提醒消息加载完成');
      return;
    }
    loadwarnList({ current, size: 20 }).then((res) => {
      if (Number(res.code) === 200) {
        if (res.data.records && Array.isArray(res.data.records)) {
          const arr = [...warninglist, ...res.data.records];
          setWarninglist(arr);
          setCurrent(current + 1);
        }
      }
    });
  };

  // 提醒消息点击跳转
  const chicKPage = (item) => {
    let url = null;
    switch (item.remindType) {
      case 0:
      case 1:
        url = '/employeeManage/credentials';
        break;
      case 2:
        url = '/attendanceManage/annualControl';
        break;
      case 3:
        url = '/attendanceManage/attendanceInfo';
        break;
      default:
        break;
    }
    if (!url) {
      message.warning('跳转地址不能为空!');
      return false;
    }
    const routers = JSON.parse(localStorage.getItem('menuList'));
    const res = hasAuthRouter(url, routers);
    if (res) {
      history.push(url);
    } else {
      message.warning('该用户暂无权限，请先授权后再查看！');
    }
  };

  return (
    <div className={styles.container}>
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="政策中心" key="1">
          <ul>
            {policylist.length
              ? policylist.map((item, index) => (
                  <li
                    key={index}
                    className={styles.item}
                    onClick={() => {
                      history.push({
                        pathname: '/detail/policy/policydetail',
                        query: {
                          title: item.title,
                          policyID: item.id,
                        },
                      });
                    }}
                  >
                    <span className={styles.title}>{item.title}</span>
                    <div className={styles.time}>
                      <Time type="MM/DD">{item.createTime}</Time>
                    </div>
                  </li>
                ))
              : ''}
          </ul>
        </TabPane>
        <TabPane tab="提醒消息" key="2" style={{ height: '600px', overflow: 'auto' }}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={1}
            loadMore={() => handleInfiniteOnLoad()}
            hasMore={hasmore}
            useWindow={false}
          >
            <ul>
              {warninglist.length
                ? warninglist.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <Tooltip title={item.remindContent}>
                        <span className={styles.title} onClick={() => chicKPage(item)}>
                          {item.remindContent}
                        </span>
                      </Tooltip>
                      <div className={styles.time}>
                        <Time type="MM/DD">{item.createDate}</Time>
                      </div>
                    </li>
                  ))
                : ''}
            </ul>
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};
export default PolicyCenter;
