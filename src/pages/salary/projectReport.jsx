import React, { useRef, useEffect, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { loadProjectBillList, loadDetailStasticsData } from '@/services/salary';
import styles from './index.less';
import CloumnOrder from '@/components/CloumnOrder';
import StatisticsTable from '@/components/StatisticsTable';
import moment from "moment";
import IconFont from "@/components/IconFont";
import Pagination from '@/components/PaginationB';

const ProjectReport = props => {
  const { location } = props;
  const [stastics, setStastics] = useState({}) // 统计数据

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();

  useEffect(() => {
    // 获取统计数据
    const fetchStasticsData = async () => {
      const param = {
        salaryFormId: (location.query.salaryFormId) ? location.query.salaryFormId : ''
      }
      const result = await loadDetailStasticsData(param);
      setStastics(result.data || {});
    };
    fetchStasticsData();
  }, []);

  // 列表字段数据
  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName',
      width: '15%',
    },
    {
      title: '应发工资',
      dataIndex: 'relaySalary',
      width: '15%',
    },
    {
      title: '实发工资',
      dataIndex: 'actualSalarySum',
      width: '15%',
    },
    {
      title: '个税',
      dataIndex: 'salaryTax',
      width: '15%',
    },
    {
      title: '结算月份',
      dataIndex: 'settlementMonth',
      width: '15%',
    },
    {
      title: '是否立即发放',
      dataIndex: 'salaryGiveTime',
      render: (text, record, index) => {
        return (Number(record.salaryGiveTime) === 0) ? '立即发' : '暂停发';
      }
    }
  ];

  // 表格展开数据
  const expandColumns = [
    {
      title: '社保扣缴月份',
      dataIndex: 'deduSocialMonth',
    },
    {
      title: '单位社保',
      dataIndex: 'unitSocial',
    },
    {
      title: '个人社保',
      dataIndex: 'personalSocial',
    },
    {
      title: '公积金扣缴月份',
      dataIndex: 'deduProvidentMonth',
    },
    {
      title: '单位公积金',
      dataIndex: 'unitFund',
    },
    {
      title: '个人公积金',
      dataIndex: 'personalFund',
    },
  ];

  // 头部统计数据
  const statisticsColumn = [
    {
      title: "发薪人次",
      value: stastics.personTime && parseInt(stastics.personTime),
      divider: true,
    },
    {
      title: "应发工资",
      value: stastics ? stastics.salarySum : '-',
      divider: true,
    },

    {
      title: "实发工资",
      value: stastics ? stastics.cardPay : '-',
      divider: true,
    },
    {
      title: "人工成本",
      value: stastics ? stastics.laborCosts : '-',
      tip: '累计应发工资+单位社保公积金之和+代扣单位社保公积金',
      divider: true,
    },
    {
      title: "发放时间",
      value: (location.query.revenueTime) ? moment(location.query.revenueTime).format('YYYY.MM.DD') : '-',
    },
  ];

  // 处理详情的非固定项目的排版
  const handleList = (list) => {
    if (list && Array.isArray(list)) {
      var resultColumns = [];
      list.forEach((record, index) => {
        const obj = {
          title: record.cnName,
          dataIndex: 'salaryMoney',
          render: () => {
            return record.salaryMoney ? record.salaryMoney : '-';
          }
        };
        resultColumns.push(obj);
      })

      return (
        <CloumnOrder
          data={{}}
          isCenter={true}
          titleAlignRight={true}
          cloumns={resultColumns}
          rowGutter={30}
          colSpan={8} />
      )
    }
    return null
  };

  // 详情布局
  const expandedDetailRender = (record) => {
    return (
      <div style={{
        textAlign: 'center'
      }}>

        <CloumnOrder
          data={record}
          isCenter={true}
          titleAlignRight={true}
          cloumns={expandColumns}
          rowGutter={30}
          colSpan={8} />
        {
          handleList(record.saiList)
        }
      </div>
    )
  };


  return (
    <div className={styles.projectWrap}>
      <div className={styles.headerStatics}>
        <StatisticsTable datas={statisticsColumn} dark={true} />
      </div>

      <ProTable
        rowClassName='gesture'
        headerTitle="工资报表"
        columns={columns}
        rowKey="id"
        options={false}
        search={false}
        actionRef={actionRef}
        hideOnSinglePage={true}
        pagination={false}
        request={(parameters) => loadProjectBillList({
          current: current,
          size: pageSize,
          salaryFormId: (location.query.salaryFormId) ? location.query.salaryFormId : ''

        }).then((res) => {

          const data = res.data;
          setTotal(data.total);
          setCurrent(data.current)
          setPageSize(data.size)
          return {data: data.records};
        })}
        toolBarRender={false}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: expandedDetailRender,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />
            ) : (
                <IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />
              )
        }}
      ></ProTable>

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
    </div>
  )
}
export default ProjectReport;
