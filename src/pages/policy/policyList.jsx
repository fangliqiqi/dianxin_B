import React, { useEffect, useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { loadPolicyList, loadAreaDatas } from '@/services/policy';
import styles from './index.less';
import { message, Select, Space, Button } from 'antd';
import classnames from 'classnames';
import { history, KeepAlive } from 'umi';
import Time from '@/components/Time';
import Pagination from '@/components/PaginationB';
import { CaretDownOutlined } from '@ant-design/icons';

const PolicyList = props => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();

  const [areaData, setAreaData] = useState([]) // 省市区地址数据
  const [cityList, setCityList] = useState([]) // 存储选择省份后对应的城市数组
  const [provinceName, setProvinceName] = useState(null) // 选中的省份名称
  const [cityName, setCityName] = useState(null) // 选中的城市名称
  const [areaFilterParam, setAreaFilterParam] = useState({}) // 头部筛选省市参数

  const { Option } = Select;

  useEffect(() => {
    // 获取省市区地址
    loadAreaDatas().then(res => {
      if (Number(res.code) === 200) {
        setAreaData(res.data);
      }
    });

  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'title',
      width: '88%',
      render: (text, record, index) => {
        return (
          <div className={styles.titleWrap}>
            <span>{record.title}</span>
          </div>
        )
      }
    },
    {
      title: '',
      dataIndex: 'createTime',
      width: '12%',
      render: (text) => {
        return (
          <Time className={styles.dateLabel} type="YYYY.MM.DD">{text}</Time>
        )
      }
    },
  ];

  // 省份下拉框选择项目
  const provinceOnChange = (keyName, value) => {
    if (value.children !== provinceName) {
      setCityName(null);
    }
    setProvinceName(value.children);
    setAreaFilterParam({ province: keyName }); // 筛选的参数
    // 选择省份后，存储当前选中的省份下的城市列表数据
    const list = areaData[keyName - 1].children;
    setCityList(list ? list : []);
  };

  // 城市选择回调
  const cityOnChange = (keyName, value) => {
    setCityName(value.children);

    Object.assign(areaFilterParam, { city: keyName });
    setAreaFilterParam(areaFilterParam);
  };

  // 点击查询按钮
  const searchClick = () => {
    if (!areaFilterParam.province) {
      message.error('请选择省份');
      return;
    }
    setCurrent(1); // 重置分页器
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // 点击查看全部（重置）
  const allBtnClick = () => {
    setCurrent(1); // 重置分页器
    setProvinceName(null);
    setCityList([]);
    setCityName(null);
    setAreaFilterParam({});
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };


  return (
    <div className={classnames(styles.boxWrap, 'policyContainer')}>
      <Space size={15}>
        <span>区域</span>
        <Select
          placeholder="省份"
          style={{ width: 200 }}
          suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
          value={provinceName}
          onChange={provinceOnChange}
        >
          {
            areaData ? areaData.map((item, index) => (
              <Option key={item.id} value={item.id}>{item.areaName}</Option>
            )) : ''
          }
        </Select>

        <Select
          placeholder="城市"
          style={{ width: 150 }}
          suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
          value={cityName}
          onChange={cityOnChange}
        >
          {
            cityList ? cityList.map((item, index) => (
              <Option key={item.id} value={item.id}>{item.areaName}</Option>
            )) : ''
          }
        </Select>

        <Button type="primary" onClick={searchClick}>查询</Button>

        {
          areaFilterParam.province ? <Button type="primary" onClick={allBtnClick}>重置</Button> : ''
        }

      </Space>

      <div className={styles.spareLine}></div>

      <ProTable
        className="gesture"
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        options={false}
        search={false}
        showHeader={false}
        pagination={false}
        request={(parameters) => loadPolicyList(Object.assign({
          current: current,
          size: pageSize
        }, areaFilterParam)).then((res) => {
          let records = [];

          if (res.code === 200) {
            const data = res.data;
            records = data.records;
            setTotal(data.total);
            setCurrent(data.current)
            setPageSize(data.size)
          }

          return {
            data: records,
          };
        })}
        onRow={(record) => {
          return {
            onClick: () => {
              history.push({
                pathname: '/detail/policy/policydetail',
                query: {
                  title: record.title,
                  policyID: record.id
                }
              })
            }
          }
        }}
      />
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        actionRef={actionRef}
        onChange={(page, pagesize) => {
          setCurrent(page)
          setPageSize(pagesize)
        }}
      />
    </div >
  )
}

export default () => {
  return (
      <>
          <KeepAlive>
              <PolicyList />
          </KeepAlive>
      </>
  )
}
