import React, { useState, useRef, useEffect } from "react";
import  { ModalForm} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { message,Spin,Modal} from 'antd';
import PageHeader from '@/components/PageHeader';
import {warnList,noteList,sendBusSms } from '@/services/warning';
// import styles from 'index.less'; // 告诉 umi 编译这个 less

const Sendlist = (props) => {
  const { title, visibleSend,handleCancel,recordId} = props; 
  const [loading, setLoading] = useState(false);
  
  const actionSendRef = useRef();

  // 再次发送
  const againRow = (record)=>{
    sendBusSms(record).then(res=>{
      if(res.code===200){
        message.success(res.msg)
        actionSendRef.current.reload();
      }else{
        message.success(res.msg)
      }
    }).catch((err)=>{
      message.success(err.msg)
    })
  }


  const columns = [
    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '所属部门',
      dataIndex: 'busDeptName',
      valueType: 'text',
      ellipsis: true,
      search:false
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcard',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'empPhone',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '发送时间',
      dataIndex: 'sendDateEnds',
      valueType: 'dateRange',
      hideInTable:true,
      search: {
        transform: (value) => ({ sendDateStart: value[0], sendDateEnd: value[1] }),
      },
    },
    {
      title: '发送时间',
      dataIndex: 'sendDate',
      search:false,
      ellipsis: true,
      render: (text,record) => {
        return record.sendDate ? record.sendDate.substring(0,10) : '-';
      }
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      valueType: 'select',
      valueEnum: {
        '1':'等待回执',
        '2':'发送失败',
        '3':'发送成功'
      },
    },
    {
      title: '操作',
      valueType: 'option',
      colSize:'0.75',
      render: (text, record) => [
        <a
          key="again"
          onClick={() => { againRow(record) }}
        >再次发送</a>
      ],
    }
  ]

  // 请求列表
  const requestList = async (params) => {
    const query = {...params};
    if(params.pageSize){
      query.size = params.pageSize;
    }
    query.warningId = recordId
    setLoading(true)
    const listRes = await noteList(query);
    setLoading(false)
    let records = [];
    let totalAll = 0;
    if (listRes.code === 200 && listRes.data && listRes.data.total) {
      records = listRes.data.records;
      totalAll = listRes.data.total;
    }
    return { data: records,total:totalAll };
  }

  return (
    <Modal
      visible={visibleSend}
      layout="horizontal"
      width={1200}
      footer = {null}
      onCancel ={()=>handleCancel()}
      destroyOnClose = {true}
    >
      <PageHeader title={title}>
        <Spin spinning={loading}>
          <ProTable
            // tableStyle = {{height:'600px',overflow:'auto'}}
            rowClassName='gesture'
            rowKey='id'
            columns={columns}
            loading = {false}
            options={false}
            actionRef={actionSendRef}
            search={{
              span:8,
              optionRender: (searchConfig, formProps, dom) => [
                ...dom.reverse(),
              ],
            }}
            request={(params) => requestList(params)}
            pagination={{pageSize:10}}
          />
        </Spin>
      </PageHeader>
    </Modal>
  )
}

export default Sendlist;

