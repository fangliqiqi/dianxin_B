import React, { useRef, useEffect, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import PageHeader from '@/components/PageHeader';
import StatisticsTable from '@/components/StatisticsTable';
import { loadIncidentsListData, loadIncidentsStatiscData } from '@/services/incidents';
import { loadDictionaryValue, filterMultiDictText } from '@/services/global';
import HeaderFilter from '@/components/HeaderFilter';
import { history, KeepAlive } from 'umi';
import Pagination from '@/components/PaginationB';
import Time from '@/components/Time';

// 事件类型
const eventType = {
  0: '工伤', 1: '非因公', 2: '退工', 3: '仲裁', 4: '诉讼', 5: '监察投诉'
};

const Incidents = props => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();

  const [filterItems, setFilterItems] = useState({}); // 设置筛选条件
  const [status, setStatus] = useState({}); // 设置办理状态
  const [statiscData, setStatiscData] = useState({}); // 设置统计数据
  const [statiscSelIndex, setStatiscSelIndex] = useState(0); // 设置统计数据选中项
  const [emergencyType, setEmergencyType] = useState();// 突发事件类型

  useEffect(() => {
    // 获取头部统计数量
    const fetchStatiscData = async () => {
      const result = await loadIncidentsStatiscData();
      setStatiscData(result.data);
    };
    fetchStatiscData();

    // 获取办理状态injury_audit_status
    loadDictionaryValue('injury_audit_status').then(res => {
      const object = filterMultiDictText(res.data);
      setStatus(object);
    });
  }, []);

  // 点击了头部tab切换
  const headerTabClick = (index) => {
    setEmergencyType(index);
    setCurrent(1); // 重置分页器
    if (actionRef.current) { // 刷新列表
      actionRef.current.reload();
    }
  };

  // 头部统计数据
  const statistics = [
    {
      title: "全部",
      value: statiscData && statiscData.allNums,
      divider: true,
      onClick: () => {
        setStatiscSelIndex(0);// 选中的项
        headerTabClick();
      }
    },
    {
      title: "工伤事件",
      value: statiscData && statiscData.zeroNums,
      onClick: () => {
        setStatiscSelIndex(1);// 选中的项
        headerTabClick(0);
      }
    },
    {
      title: "非因工事件",
      value: statiscData && statiscData.oneNums,
      onClick: () => {
        setStatiscSelIndex(2);// 选中的项
        headerTabClick(1);
      }
    },
    {
      title: "退工",
      value: statiscData && statiscData.twoNums,
      onClick: () => {
        setStatiscSelIndex(3);// 选中的项
        headerTabClick(2);
      }
    },
    {
      title: "劳动仲裁",
      value: statiscData && statiscData.threeNums,
      onClick: () => {
        setStatiscSelIndex(4);// 选中的项
        headerTabClick(3);
      }
    },
    {
      title: "诉讼争议",
      value: statiscData.fourNums,
      onClick: () => {
        setStatiscSelIndex(5);// 选中的项
        headerTabClick(4);
      }
    },
  ];

  // 筛选项字段
  const filterCoumns = [
    {
      key: 'auditStatus',
      value: '',
      placeholder: '办理状态',
      valueEnum: status,
    },
    {
      key: 'emName',
      value: '',
      placeholder: '按姓名查询',
    }
  ];

  // 列表字段数据
  const columns = [
    {
      title: '事件类型',
      dataIndex: 'emergencyType',
      valueEnum: eventType
    },
    {
      title: '发生时间',
      dataIndex: 'eventOccurrenceTime',
      render: (text, record, index) => <Time type="YYYY.MM.DD">{text}</Time>
    },
    {
      title: '当事人',
      dataIndex: 'emName'
    },
    {
      title: '身份证号码',
      dataIndex: 'emIdCard'
    },
    {
      title: '性别/年龄',
      dataIndex: 'empSex/empAge',
      render: (text, record, index) => {
        const sex = Number(record.empSex) === 1 ? '男' : '女';
        const age = record.empAge ? record.empAge : '-';
        return `${sex} / ${age}`;
      }
    },
    {
      title: '岗位',
      dataIndex: 'post',
      render: (text, record, index) => record.post ? record.post : '-'
    },
    {
      title: '申报时间',
      dataIndex: 'reportDate',
      render: (text, record, index) => <Time type="YYYY.MM.DD">{text}</Time>
    },
    {
      title: '办理状态',
      dataIndex: 'auditStatus',
      valueEnum: status
    },
  ];

  // 根据查询条件重新刷新列表
  const reloadSearch = (form) => {
    const formData = form.getFieldValue();
    setCurrent(1); // 重置分页器
    setFilterItems(formData);
    if (actionRef.current) { // 刷新列表
      actionRef.current.reload();
    }
  };

  return (
    <PageHeader
      title="用工事件"
      hideDivider={true}>
      <StatisticsTable datas={statistics} dark={true} select={statiscSelIndex} />
      <HeaderFilter
        columns={filterCoumns}
        filterParam={filterItems}
        selectChange={(form) => {
          form.setFieldsValue({ emName: undefined });
          reloadSearch(form);
        }}
        onSearch={(form) => {
          form.setFieldsValue({ auditStatus: undefined });
          reloadSearch(form);
        }}
        itemClose={(form) => {
          reloadSearch(form);
        }}
      />
      <ProTable
        rowClassName='gesture'
        columns={columns}
        rowKey="id"
        options={false}
        search={false}
        actionRef={actionRef}
        pagination={false}
        request={(parameters) => loadIncidentsListData(Object.assign({
          current: current,
          size: pageSize,
          emergencyType: emergencyType
        }, filterItems)).then((res) => {
          const data = res.data;
          setTotal(data.total);
          setCurrent(data.current)
          setPageSize(data.size)
          return { data: data.records };
        })}
        toolBarRender={false}
        onRow={(record, index) => {
          return {
            onClick: () => {
              history.push({
                pathname: '/detail/incidents/detail',
                query: {
                  emergencyType: record.emergencyType,
                  id: record.id ? record.id : '',
                  statusStr: status[record.auditStatus],
                  title: record.emName
                }
              })
            }
          }
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
    </PageHeader>
  );
};

export default (props) => {
  return (
    <React.Fragment>
      <KeepAlive>
        <Incidents {...props} />
      </KeepAlive>
    </React.Fragment>
  )
}
