import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Spin, Menu, Upload, Modal, Popconfirm, Switch } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson, getParents } from '@/utils/utils';
import {
  annualControlList,
  exportAnnualList,
  remainAnnual,
  clearAnnual,
  clearAnnualList,
} from '@/services/annual';
import { departList, getDepartAll } from '@/services/depart';
import Ellipsis from '@/components/Ellipsis';
import SelectPage from '@/components/SelectPage';

import Edit from './edit';

const List = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [exportQuery, setExportQuery] = useState({});
  const [loading, setLoading] = useState(false);
  const [allDepart, setAllDepart] = useState([]);
  const actionRef = useRef();
  const childRef = useRef();

  useEffect(() => {
    getDepartAll()
      .then((res) => {
        if (res.code === 200) {
          setAllDepart(res.data);
        }
      })
      .catch((err) => {
        console.log('[ err ] >', err);
      });
  }, []);

  // 编辑操作
  const editRow = async (mtitle, record) => {
    setTitle(mtitle);
    const obj = {
      notUsedVacationDuration: '',
      clearNote: '',
      id: record.id,
      list: [],
    };
    const res1 = await remainAnnual({ idcard: record.empIdcard });
    if (res1.code === 200) {
      obj.notUsedVacationDuration = res1.data;
    }
    const res2 = await clearAnnualList({ vacationMonitorId: record.id });
    if (res2.code === 200) {
      let arr = [];
      if (res2.data.length > 3) {
        arr = res2.data.slice(0, 3);
      } else {
        arr = res2.data;
      }
      obj.list = res2.data;
      childRef.current.getList(arr);
    }
    setDefaultValues(obj);
    setVisible(true);
  };

  // 保存
  const handleOk = async (values) => {
    const res = await clearAnnual(values);
    if (res.code === 200) {
      message.success(res.msg);
      setVisible(false);
      actionRef.current.reload();
    } else {
      message.warning(res.msg);
    }
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues({});
  };

  const columns = [
    {
      title: '年份',
      dataIndex: 'vacationYear',
      valueType: 'text',
      search: false,
      width: 60,
      ellipsis: true,
    },
    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      width: 100,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      width: 100,
      ellipsis: true,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcard',
      valueType: 'text',
      width: 180,
      ellipsis: true,
    },
    {
      title: '所属部门',
      dataIndex: 'departName',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        const res = allDepart.find((item) => String(item.id) === String(record.departId));
        return res ? <Ellipsis title={res.name} length={5} /> : '';
      },
    },
    {
      title: '所属部门',
      dataIndex: 'departId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <SelectPage
            getData={departList}
            selectProps={{
              placeholder: '输入所属部门搜索',
              allowClear: true,
              showSearch: true,
              optionFilterProp: 'children',
            }}
            labeltitle="name"
            labelvalue="id"
          />
        );
      },
    },
    {
      title: '岗位',
      dataIndex: 'businessPost',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
    },
    {
      title: '年假时长',
      dataIndex: 'vacationDuration',
      valueType: 'text',
      search: false,
      render: (text, record) => {
        return `${record.vacationDuration}h`;
      },
      width: 100,
      ellipsis: true,
    },
    {
      title: '已休时长',
      dataIndex: 'usedVacationDuration',
      valueType: 'text',
      search: false,
      render: (text, record) => {
        return `${Subtr(record.vacationDuration,record.notUsedVacationDuration) }h`;
      },
      width: 100,
      ellipsis: true,
    },
    {
      title: '未休时长',
      dataIndex: 'notUsedVacationDuration',
      valueType: 'text',
      search: false,
      render: (text, record) => {
        return `${record.notUsedVacationDuration}h`;
      },
      width: 100,
      ellipsis: true,
    },
    {
      title: '休假状态',
      dataIndex: 'vacationStatus',
      valueType: 'select',
      valueEnum: {
        0: '未休完',
        1: '已休完',
      },
      width: 100,
      // ellipsis: true,
    },
    {
      title: '入职时间',
      dataIndex: 'businessEnjoinDate',
      valueType: 'text',
      search: false,
      render: (text, record) => {
        return record.businessEnjoinDate ? record.businessEnjoinDate.substring(0, 10) : '';
      },
      width: 100,
      ellipsis: true,
    },
    {
      title: '在岗工龄',
      dataIndex: 'workingAge',
      valueType: 'text',
      search: false,
      render: (text, record) => {
        return `${record.workingAge}年`;
      },
      width: 100,
      ellipsis: true,
    },
    {
      title: '年份',
      dataIndex: 'vacationYear',
      valueType: 'dateYear',
      hideInTable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      ellipsis: true,
      fixed: 'right',
      render: (text, record) => [
        <a
          key="edit"
          onClick={() => {
            editRow('清零说明', record);
          }}
        >
          清零说明
        </a>,
      ],
    },
  ];

  // 导出
  const json2excel = (tableJson, filenames, autowidth, bookTypes, typeLength) => {
    import('@/utils/exportCommonExcel')
      .then((excel) => {
        const tHeader = [];
        const dataArr = [];
        const sheetnames = [];
        tableJson.forEach((item, index) => {
          tHeader.push(tableJson[index].tHeader);
          dataArr.push(exportFormatJson(tableJson[index].filterVal, tableJson[index].tableDatas));
          sheetnames.push(tableJson[index].sheetName);
        });
        excel.export_json_to_excel_more_sheet({
          header: tHeader,
          data: dataArr,
          sheetname: sheetnames,
          filename: filenames,
          bookType: bookTypes,
          autoLength: typeLength, // 所有类型长度
        });
      })
      .finally(() => {
        message.success('导出成功！');
      });
  };
  // 减法精度丢失问题

  const Subtr =(arg1,arg2)=>{
    var r1,r2,m,n; 
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
    m=Math.pow(10,Math.max(r1,r2)); 
    n=(r1>=r2)?r1:r2; 
    return ((arg1*m-arg2*m)/m).toFixed(n); 
  }

  // 导出
  const exportExcel = async () => {
    const res2 = await exportAnnualList(exportQuery);
    if (res2.code === 200) {
      const tableData = res2.data.map((item) => {
        const obj = {
          workingAge: `${item.workingAge}年`,
          vacationStatus: item.vacationStatus === '1' ? '已休完' : '未休完',
          departName: getParents(allDepart, item.departId, []).reverse().join('-'),
          usedVacationDuration: `${item.vacationDuration - item.notUsedVacationDuration}h`,
          vacationDuration: `${item.vacationDuration}h`,
          notUsedVacationDuration: `${item.notUsedVacationDuration}h`,
          businessEnjoinDate: item.businessEnjoinDate
            ? item.businessEnjoinDate.substring(0, 10)
            : '',
        };
        return { ...item, ...obj };
      });
      // 封面数据
      const excelDatas = [
        {
          tHeader: [
            '年份',
            '电信工号',
            '姓名',
            '身份证号',
            '所属部门',
            '岗位',
            '年假时长',
            '已休时长',
            '未休时长',
            '休假状态',
            '入职时间',
            '在岗工龄',
          ],
          filterVal: [
            'vacationYear',
            'businessTelecomNumber',
            'empName',
            'empIdcard',
            'departName',
            'businessPost',
            'vacationDuration',
            'usedVacationDuration',
            'notUsedVacationDuration',
            'vacationStatus',
            'businessEnjoinDate',
            'workingAge',
          ],
          tableDatas: tableData,
          sheetName: '离职信息',
        },
      ];

      json2excel(excelDatas, '年假未休监控', true, 'xlsx', true);
    } else {
      message.warning(res2.msg);
    }
  };

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    setExportQuery(query);
    return annualControlList(query).then((res) => {
      let records = [];
      let totalAll = 0;
      if (res.code === 200) {
        const dataRes = res.data;
        if (dataRes) {
          records = dataRes.records;
          totalAll = dataRes.total;
        } else {
          totalAll = 0;
        }
      }
      return { data: records, total: totalAll };
    });
  };

  return (
    <PageHeader title="年假未休监控">
      <ProTable
        rowClassName="gesture"
        tableClassName="xscrollbar"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        request={(params) => requestList(params)}
        search={{
          span: 6,
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          className: 'searchForm',
        }}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
        }}
        headerTitle={
          <>
            <Button
              key="add"
              onClick={() => exportExcel()}
              icon={<DownloadOutlined />}
              type="primary"
            >
              导出
            </Button>
          </>
        }
      />
      <Spin spinning={loading}>
        <Edit
          title={title}
          childRef={childRef}
          visible={visible}
          handleCancel={handleCancel}
          handleOk={handleOk}
          defaultValues={defaultValues}
        />
      </Spin>
    </PageHeader>
  );
};

const annual = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(() => {
  return {};
})(annual);
