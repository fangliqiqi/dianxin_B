import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import PageHeader from '@/components/PageHeader';
import {warnList,noteList,sendBusSms } from '@/services/warning';
import {getRoleAndMenu} from '@/services/admin'

import Details from './details'
import Sendlist from './sendlist'
import { DatabaseOutlined } from '@ant-design/icons';

const List = () => {

  const [visibleDetail, setdetailVisible] = useState(false);
  const [visibleSend, setsendVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [token, setToken] = useState({});
  const [recordId,setRecordId] = useState({});
  const [activekey, setActiveKey] = useState('tab1');
  const [btnShow,setBtnshow] = useState('inline-block')
  const [inTable,setIntable] = useState(false);
  const [roleNameMap, setRoleNameMap] = useState([]);
  const [roleName, setRoleName] = useState([]);
  const [typename,setTypename] = useState({});
  const [dataallList,setDataallList] = useState([])
  const [defaultData,setdefaultData] = useState([])
  const actionRef = useRef();


  const handleRoleData = (data) => {
      const roleNames = [];
      const arrNums = data?data.split(','):[] 
	    arrNums.map(item => {
		   const res = roleNameMap.find(items=>items.value == item)
		   if(res){
			   roleNames.push(res.label)
		    } 
	    })
      return setRoleName(roleNames)
  }

  useEffect(() => {
    getRoleAndMenu().then(res=>{
      if(res.code === 200){
        const roleNameMaps = [];
      // eslint-disable-next-line
      for(const key in res.data.roleNameMap){
        roleNameMaps.push({label:res.data.roleNameMap[key],value:key});
      }
        setRoleNameMap(roleNameMaps)
      }
    })

    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, [])

  
  const changeData = (key)=>{
    if(key === 'system'){
      setBtnshow('none')
      setIntable(true)
      const data = dataallList.filter(item=>item.type===1)
      setdefaultData(data)
    }else if(key === 'note'){
      setBtnshow('inline-block')
      setIntable(false)
      const data = dataallList.filter(item=>item.type===0&&item.remindType!==2)
      setdefaultData(data)
    }
  }

  // 操作
  const actionRow =  async(type,record)=>{
    if(type === 'detail'){
      setTitle('预警详情')
      setdetailVisible(true)
      setDefaultValues(record)
      handleRoleData(record.remindObject)
    }else if(type === 'sendlist'){
        let title;
        if(record.remindType===0){
          title = '复审'
        }else if(record.remindType===1){
          title = '到期'
        }else if(record.remindType===2){
          title = '年假未修'
        }
        setTitle(`${title}-短信发送列表`)
        setsendVisible(true)
        setRecordId(record.id)
    }
  }
  
  // 关闭弹窗
  const handleCancel = (e) => {
    if(e === '1'){
      setdetailVisible(false);
    }else if(e === '2'){
      setsendVisible(false);
    }
  }

  const columns = [
    {
      title: '提醒类型',
      width:'200px',
      dataIndex: 'remindType',
      search:false,
      valueType: 'select',
      valueEnum: {
        '0': '复审提醒',
        '1': '到期提醒',
        '2': '年假未休提醒',
        '3': '假期结束日期提醒',
      },
    },
    {
      title: '提醒模板',
      dataIndex:'remindTemplate',
      search:false,
      ellipsis:true,
      
    },
    {
      title: '发送方式',
      dataIndex: 'sendMethod',
      width:'200px',
      search: false,
      hideInTable:inTable,
      valueType: 'select',
      valueEnum: {
        '0': '自动',
        '1': '手动'
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width:'200px',
      colSize:'0.75',
      render: (text, record) => [
        <a
          style={{display:btnShow}}
          key="list"
          onClick={() => { actionRow('sendlist',record) }}
        >发送记录</a>,
        <a
          key="detail"
          onClick={() => { actionRow('detail',record) }}
        >详情</a>
      ],
    }
  ];
  // 请求列表
  const requestList = async (params) => {
    const query = {...params};
    if(params.pageSize){
      query.size = params.pageSize;
    }
    const listRes = await warnList(query);
    let records = [];
    if (listRes.code === 200 && listRes.data && listRes.data.total) {
      setDataallList(listRes.data.records)
      records = listRes.data.records.filter(item=>item.type===0&&item.remindType!==2)
      setdefaultData(records)
    }
  }

  

  return (
    <PageHeader title="预警管理">
        <ProTable
          rowClassName='gesture'
          rowKey='id'
          columns={columns}
          options={false}
          actionRef={actionRef}
          search={{
            optionRender: false,
            collapsed: false
          }}
          request={(params) => requestList(params)}
          dataSource = {defaultData}
          toolbar={{
            multipleLine: true,
            menu: {
              type: 'tab',
              activeKey: activekey,
              items: [
                {
                  key: 'note',
                  tab: '短信提醒',
                },
                {
                  key: 'system',
                  tab: '系统消息提醒',
                },
              ],
              onChange: (key) => {
                setActiveKey(key)
                changeData(key)
              },
            },
          }}
          form={{
            ignoreRules: false,
          }}
          pagination={{pageSize:10}}
        />
      <Details visibleDetail = {visibleDetail} title={title} handleCancel = {()=>{handleCancel('1')}}   defaultValues = {defaultValues} roleName = {roleName} />
      <Sendlist visibleSend = {visibleSend} title={title}  handleCancel = {()=>{handleCancel('2')}}  recordId = {recordId} />
    </PageHeader>
  );

}

const departMange = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  )
}

export default connect(({ exampleModels }) => {
  return ({
    exampleStatus: exampleModels,
  })
})(departMange);