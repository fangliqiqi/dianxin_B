import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import PageHeader from '@/components/PageHeader';
import { Button,Row, Col } from 'antd';
import { VerticalAlignBottomOutlined,RedoOutlined } from '@ant-design/icons';
import { employeeList } from '@/services/members';
import { history, KeepAlive } from 'umi';
import Pagination from '@/components/PaginationB';
import SettleName from '@/components/SettleName';
import Dictionanes from '@/components/Dictionaries';
import { loadDictionaryValue, filterMultiDictText } from '@/services/global';
import SearchForm from '@/components/SearchForm';
import { loadProject,loadCustomer } from '@/services/global';


const List = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();
  const [filterItems, setFilterItems] = useState({}); // 设置筛选条件

  const [settleNames, setSettleNames] = useState([]);
  const [educations, setEducations] = useState({});

  useEffect(() => {
    // loadDictionaryValue("education").then(res => {
    //   if (res.code === 200) {
    //     setEducations(filterMultiDictText(res.data || []))
    //   }
    // })

  }, [])

  
  // 头部筛选区域
  const filterCoumns = [
    {
      key: 'settleDomain',
      label: '业务项目',
      valueType: 'input',
      // getData:loadProject,
      // labelTitle:'departName',
      // labelValue:'id',
      placeholder: '按业务项目查询',
    },
    {
      key: 'customer',
      label: '单位',
      valueType: 'selectPage',
      getData:loadCustomer,
      labelTitle:'customerName',
      labelValue:'id',
      placeholder: '按单位查询',
    },
    {
      key: 'date',
      label: '日期',
      valueType: 'date',
      format:'YYYY-MM-DD',
      placeholder: '按日期查询',
    },
    {
      key: 'time',
      label: '时间范围',
      valueType: 'dateRange',
      format:'YYYY-MM-DD',
      searchField: ['startTime','endTime'],
      placeholder: '按时间范围查询',
    },
    {
      key: 'nickname',
      label: '电信工号',
      valueType: 'input',
      placeholder: '按电信工号查询',
    },
    {
      key: 'nickname1',
      label: '所属部门',
      valueType: 'input',
      placeholder: '按所属部门查询',
    },
    {
      key: 'nickname3',
      label: '岗位',
      valueType: 'input',
      placeholder: '按岗位查询',
    },
    {
      key: 'empName',
      label: '姓名',
      valueType: 'input',
      placeholder: '按姓名查询',
    },
    {
      key: 'nickname5',
      label: '身份证号',
      valueType: 'input',
      placeholder: '按身份证号查询',
    },
    {
      key: 'nickname6',
      label: '在职状态',
      valueType: 'select',
      placeholder: '按在职状态查询',
      valueEnum: {
        '0': '在职',
        '1': '临时',
        '2': '离职',
      }
    },
    {
      key: 'nickname7',
      label: '标签名称',
      valueType: 'input',
      placeholder: '按标签名称查询',
    },
    {
      key: 'nickname8',
      label: '是否持证',
      valueType: 'select',
      placeholder: '按是否持证查询',
      valueEnum: {
        '0': '是',
        '1': '否',
      }
    }
  ];

  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName',
      align: 'center',
      render: text => <div style={{ color: "#2E77F3" }}>{text}</div>
    },
    {
      title: '身份证',
      align: 'center',
      dataIndex: 'empIdcard',
    },
    {
      title: '性别/年龄',
      align: 'center',
      dataIndex: 'sexAndAge',
      render: (_, record) => {

        let sex = "-"
        if (record.empSex === "1") {
          sex = "男";
        }
        if (record.empSex === "2") {
          sex = "女";
        }
        return `${sex}/${record.empAge || '-'}`
      }
    },
    {
      title: '学历',
      align: 'center',
      dataIndex: 'educationName',
      render: text => <Dictionanes type="local" matchData={educations}>{text}</Dictionanes>
    },
    {
      title: '业务项目',
      align: 'center',
      dataIndex: 'settleDomain',
      render: (text) => {
        return <SettleName args={settleNames}>{text}</SettleName>
      },
    },
    {
      title: '岗位',
      align: 'center',
      dataIndex: 'post',
      render: text => (text) ? text : "-"
    },
    {
      title: '入职时间',
      align: 'center',
      dataIndex: 'enjoinDate',
      render: text => (text) ? text : "-"
    },
    {
      title: '离职时间',
      align: 'center',
      dataIndex: 'leaveDate',
      render: text => (text) ? text.trim().split(" ")[0] : "-"
    }
  ];

  // 根据查询条件重新刷新列表
  const reloadSearch = (form) => {
    const formData = form.getFieldValue();
    setCurrentPage(1); // 重置分页器
    setFilterItems(formData);
    if (actionRef.current) { // 刷新列表
      actionRef.current.reload();
    }
  };

  return (
    <PageHeader title="花名册">
      <SearchForm
        columns={filterCoumns}
        onSearch={(form) => {reloadSearch(form)}}
      />
      <div style={{marginBottom:'15px',padding:'0 24px'}}>
        <Button type="primary" style={{marginRight:'10px'}}><VerticalAlignBottomOutlined />导出</Button>
        <Button type="primary"><RedoOutlined />批量更新</Button>
      </div>
      <ProTable
        className='gesture'
        rowKey='id'
        columns={columns}
        options={false}
        search={false}
        actionRef={actionRef}
        pagination={false}
        request={async () => employeeList({
          current: currentPage,
          size: pageSize,
          ...filterItems
        }).then((res) => {
          let records = [];
          if (res.code === 200) {
            const resData = res.data;
            if (resData) {
              records = resData.records;
              setTotal(resData.total || 0);
              setCurrentPage(resData.current || 1);
              setPageSize(resData.size || 10);
            } else {
              setTotal(0);
              setCurrentPage(1);
              setPageSize(10);
            }
          }
          return { data: records };
        })}
        onRow={(record) => {
          return {
            onClick: () => {
              history.push({
                pathname: '/m/personerInfo/archives',
                query: {
                  title: record.empName,
                  id: record.id,
                  empIdcard: record.empIdcard
                }
              })
            }
          }
        }}
      />

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        actionRef={actionRef}
        onChange={(page, pagesize) => {
          setCurrentPage(page)
          setPageSize(pagesize)
        }}
      />

    </PageHeader>
  );
};

export default () => {
  return (
    <>
      <KeepAlive saveScrollPosition="screen" >
        <List />
      </KeepAlive>
    </>
  )
}
