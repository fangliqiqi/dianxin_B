import React, { useRef, useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import {Select, DatePicker, Space } from 'antd';
import { history, KeepAlive } from 'umi';
import { loadSocialFundList } from '@/services/socialfund';
import PageHeader from '@/components/PageHeader';
import { loadProject,getProjectList} from '@/services/global';
import moment from 'moment';
import Kvalue from "@/components/Kvalue";
import IconFont from "@/components/IconFont";
import { CaretDownOutlined } from '@ant-design/icons';

const SocalFund = () => {
  const actionRef = useRef();
  const { Option } = Select;

  const [currentyear, setCurrentyear] = useState(''); // 设置查询的年份
  const [settleNameArray, setSettleNameArray] = useState([]); // 结算主题的选择项
  const [departID, setDepartID] = useState(null); // 设置查询的项目名称
  const monethTransform = { 1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月' }; // 用于页面将月份转为中文的月份显示

  useEffect(() => {
    // 获取当前年份
    const year = new Date().getFullYear();
    setCurrentyear(year);
    // 获取项目
    getProjectData();

  }, []);

  // 获取项目
  const getProjectData = (settleName) => {
    getProjectList({ settleName: settleName, limit: 20 }).then(res => {
      if (Number(res.code) === 200) {
        if (res.data && Array.isArray(res.data)) {
          setSettleNameArray(res.data);
        }
      }
    });
  };

  const columns = [
    {
      title: '社保月份',
      dataIndex: 'month',
      render: (text, record, index) => {
        const month = parseInt(moment(record.month, 'YYYYMM').format('MM'));
        return (
          <Kvalue title="社保月份" direction='vertical'>{record.month ? monethTransform[month] : '-'}</Kvalue>
        )
      }
    },
    {
      title: '参缴人数',
      dataIndex: 'peopleCount',
      render: (text, record, index) => {
        return (
          <Kvalue title="参缴人数" direction='vertical' align='right'>{record.peopleCount ? record.peopleCount : '-'}</Kvalue>
        )
      }
    },
    {
      title: '个人缴纳',
      dataIndex: 'personalSum',
      render: (text, record, index) => {
        return (
          <Kvalue title="个人缴纳" direction='vertical' align='right'>{record.personalSum ? record.personalSum : '-'}</Kvalue>
        )
      }
    },
    {
      title: '公司缴纳',
      dataIndex: 'unitSum',
      render: (text, record, index) => {
        return (
          <Kvalue title="公司缴纳" direction='vertical' align='right'>{record.unitSum ? record.unitSum : '-'}</Kvalue>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record, index) => [
        <IconFont key={index} type='iconyoujiantou' />
      ]
    }
  ];

  // 带搜索的下拉框搜索事件
  const selectOnSearch = (val) => {
    getProjectData(val);
  };

  // 带搜索的下拉框选择项目
  const selectOnSelect = (keyName, value) => {
    setDepartID(keyName);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // 带搜索的下拉框点击清空按钮
  const selectOnChange = (value) => {
    if (!value) {
      setDepartID(null);
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  // 日期选择回调
  const dateOnnChange = (date, dateString) => {
    setCurrentyear(dateString);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const rightRenderContext = () => {
    return (
      <React.Fragment>
      <Space size={12} align="start">
        <Select
          showSearch
          allowClear={true}
          filterOption={false}
          style={{ width: 200 }}
          suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
          value={departID}
          placeholder="全部项目"
          onSearch={text => selectOnSearch(text)}
          onSelect={selectOnSelect}
          onChange={text => selectOnChange(text)}
          dropdownRender={menu => (
            <>
              {menu}
            </>
          )}
        >
          {
            settleNameArray ? settleNameArray.map((item, index) => (
              <Option key={index} value={item.id}>{item.departName}</Option>
            )) : ''
          }
        </Select>

        <DatePicker
          onChange={dateOnnChange}
          allowClear={false}
          suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
          picker="year"
          value={moment(currentyear, 'YYYY')} />
      </Space>
      </React.Fragment>
    )
  };

  return (
    <PageHeader
      title="社保公积金"
      rightRender={rightRenderContext()}>
      <ProTable
        rowClassName='gesture'
        columns={columns}
        rowKey="month"
        options={false}
        search={false}
        showHeader={false}
        actionRef={actionRef}
        pagination={false}
        className='arrowListTable'
        request={(params) => loadSocialFundList({
          year: currentyear,
          settleDomainId: departID
        }).then((res) => {
          return {data: res.data ? res.data : []};
        })}
        onRow={(record, index) => {
          return {
            onClick: (e) => {
              const month = parseInt(moment(record.month, 'YYYYMM').format('MM'));
              history.push({
                pathname: '/detail/socialfund/detail',
                query: {
                  defaultTitle: `${currentyear}年${month}月社保公积金账单`,
                  settleDomainId: departID ? departID : '',
                  month: record.month,
                  personNum: record.peopleCount ? record.peopleCount : 0,
                  perPayment: record.personalSum ? record.personalSum : 0,
                  unitPayment: record.unitSum ? record.unitSum : 0
                }
              })
            }
          }
        }}
      ></ProTable>
    </PageHeader>

  )
}

export default (props) => {
  return (
    <React.Fragment>
      <KeepAlive>
        <SocalFund {...props} />
      </KeepAlive>
    </React.Fragment>
  )
}
