import React, { useRef, useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { DatePicker } from 'antd';
import { history, KeepAlive } from 'umi';
import { loadSalaryTableData } from '@/services/salary';
import PageHeader from '@/components/PageHeader';
import Kvalue from "@/components/Kvalue";
import moment from "moment";
import IconFont from "@/components/IconFont";
import { CaretDownOutlined } from '@ant-design/icons';

const Salary = () => {
  const actionRef = useRef();
  const [currentyear, setCurrentyear] = useState(null); // 设置查询的年份
  const monethTransform = { 1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月' }; // 用于页面将月份转为中文的月份显示

  useEffect(() => {
    // 获取当前年份
    const year = new Date().getFullYear();

    setCurrentyear(year);
  }, []);

  // 日期选择回调
  const onChange = (_, dateString) => {
    setCurrentyear(dateString);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const columns = [
    {
      title: '工资月份',
      dataIndex: 'salaryMonth',
      width: '30%',
      render: (text, record, index) => {
        const month = parseInt(moment(record.salaryMonth, 'YYYYMM').format('MM'));
        return (
          <Kvalue title="工资月份" direction='vertical'>{record.salaryMonth ? monethTransform[month] : '-'}</Kvalue>
        )
      }
    },
    {
      title: '发薪人次',
      dataIndex: 'personTime',
      render: (text, record, index) => {
        return (
          <Kvalue title="发薪人次" direction='vertical' align='right'>{record.personTime ? record.personTime : '-'}</Kvalue>
        )
      }
    },
    {
      title: '应发工资',
      dataIndex: 'salarySum',
      render: (text, record, index) => {
        return (
          <Kvalue title="应发工资" direction='vertical' align='right'>{record.salarySum ? record.salarySum : '-'}</Kvalue>
        )
      }
    },
    {
      title: '实发工资',
      dataIndex: 'cardPay',
      render: (text, record, index) => {
        return (
          <Kvalue title="实发工资" direction='vertical' align='right'>{record.cardPay ? record.cardPay : '-'}</Kvalue>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (text, record, index) => [
        <IconFont style={{ marginRight: '30px' }} key={index} type='iconyoujiantou' />
      ]
    }
  ];
  return (
    <React.Fragment>
      <PageHeader
        title="工资表"
        rightRender={
          <DatePicker
            onChange={onChange}
            suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
            allowClear={false}
            picker="year"
            value={moment(currentyear, 'YYYY')}
          />
        }>
        <ProTable
          rowClassName='gesture'
          columns={columns}
          rowKey="salaryMonth"
          options={false}
          search={false}
          showHeader={false}
          pagination={false}
          actionRef={actionRef}
          className='arrowListTable'
          request={(params) => loadSalaryTableData({
            years: currentyear
          }).then((res) => {
            return {data: res.data.records};
          })}
          onRow={(record, index) => {
            return {
              onClick: (e) => {
                console.log(record)
                history.push({
                  pathname: '/detail/salary/salaryReport',
                  query: {
                    title: '薪资报表',
                    salaryMonth: record.salaryMonth
                  }
                })
              }
            }
          }}
        ></ProTable>
      </PageHeader>
    </React.Fragment>
  )
}
export default () => {
  return (
    <React.Fragment>
      <KeepAlive>
        <Salary />
      </KeepAlive>
    </React.Fragment>
  )
};
