import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button,Upload,Tooltip,Spin,Row,Col } from 'antd';
import ProTable from '@ant-design/pro-table';
import { ToTopOutlined,QuestionCircleOutlined} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import Dialog from '@/components/DialogModal';
import {getSettleList,getBusAttaList,deleteSettle,importZip} from '@/services/settlement';

import Details from './details';

const List = () => {

  const [visible, setVisible] = useState(false);
  const [delVisible, setDelVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [descTitle,setdescTitle] = useState('')
  const [btnLoading, setBtnLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [delSettleData,setDelSettleData] = useState({});
  const [token, setToken] = useState({});
  const [fileObj, setFileObj] = useState({});
  const [loading, setLoading] = useState(false);

  const actionRef = useRef();

  const tooltip = <div>
                    <Row>
                      <Col span={6}>1.文件夹名称:</Col>
                      <Col span={18}>报账部门_结算月份。例：报账部门_202108.zip;</Col>
                     </Row>
                     <Row>
                      <Col span={6}>2.内部文件名称:</Col>
                      <Col span={18}>结算单：报账部门_结算月份_结算单；<br />流水证明：报账部门_结算月份_流水证明_社保/公积金/代发工资单/餐补/春节大礼包；
                            <br />例：报账部门_202108_结算单_1.jpg； <br />报账部门_202108_流水证明_餐补_1.png；
                      </Col>
                     </Row>
                  </div>

  // const getAllList = () => {
  //   getSettleList().then( res => {
  //     if(res.code === 200){
  //       setAllDepart(res.data);
  //     }
  //   })
  // }

  // useEffect(() => {
  //   getAllList();
  // }, [])

  useEffect(() => {
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, [] )

  // 详情操作
  const editRow = (record) => {
    if(record){
      getBusAttaList({relationId:record.id}).then(res => {
        if(res.code === 200 && res.data){
          const relationZero = res.data.filter(items=>items.relationType === 0)
          const relationOne = res.data.filter(items=>items.relationType === 1)
          const relationTwo = res.data.filter(items=>items.relationType === 2)
          const relationThree = res.data.filter(items=>items.relationType === 3)
          const relationFour = res.data.filter(items=>items.relationType === 4)
          const relationFive = res.data.filter(items=>items.relationType === 5)
          const obj = {relationZero,relationOne,relationTwo,relationThree,relationFour,relationFive}
          setDefaultValues(obj);
          setTitle(`${record.accountDeptName} -- ${record.settleMonth}`);
          setVisible(true)
        }
      })
    }
  }

  // 删除按钮
  const deleteRow = (record)=>{
    if(record){
      setdescTitle(`删除后，${record.accountDeptName}的结算信息将不能恢复？`)
      setDelVisible(true)
      setDelSettleData(record)
    }
  }
  // 删除操作
   const handleRemove = (value) =>{
    if(value){
      deleteSettle(value).then(res=>{
        if(res.code === 200){
          message.success('删除成功');
          setDelVisible(false)
          // getAllList();
          actionRef.current.reloadAndRest();
        }else{
          message.warning(res.msg);
        }
      })
    }
  }

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues(null);
  }
  
  const columns = [
    {
      title: '报账部门',
      dataIndex: 'accountDeptName',
      ellipsis: true
    },
    {
      title: '结算月份',
      dataIndex: 'settleMonth',
      valueType: 'dateMonth',
      fieldProps:{
       format:'YYYYMM'
      }  
    },
    {
      title: '添加人',
      dataIndex: 'createUserName',
      search: false
    },
    {
      title: '添加时间',
      dataIndex:'createTime',
      search: false
    },
    {
      title: '操作',
      valueType: 'option',
      colSize:'0.75',
      render: (text, record) => [
        <a
          key="detail"
          onClick={() => { editRow(record) }}
        >详情</a>,
        <a
          key="delete"
          onClick={() => { deleteRow(record) }}
        >删除</a>
      ],
    }
  ];

  

  // 导入
  const uploadProps = {
    showUploadList:false,
    action: '/api/yifu-business/method/tbusdept/getParentList',
    method:'get',
    headers: token,
    beforeUpload: file => {
      const ext = file.name.substring(file.name.lastIndexOf("."),file.name.length);
      if (ext !== '.zip') {
        message.error('仅支持zip格式的压缩包');
        return false;
      }
      setFileObj(file);
    },
    onChange: info => {
      if (info.file.status === 'done') {
        setBtnLoading(true);
        const formData = new FormData();
        // 使用info.file 容易出问题
        formData.append('file',fileObj);
        importZip(formData).then(res=>{
          if(res.code === 200){
            message.success(`${info.file.name} 导入成功`);
            setBtnLoading(false);
            actionRef.current.reload();
          }else{
            message.error(res.msg);
            setBtnLoading(false);
          }
        }).catch(err=>{
          message.error(err.msg);
          setBtnLoading(false);
        })
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  }


  // 请求列表
  const requestList = async (params) => {
    const query = {...params};
    if(params.pageSize){
      query.size = params.pageSize;
    }
    setLoading(true)
    const listRes = await getSettleList(query);
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
    <PageHeader title="结算管理">
      <Spin spinning={loading}>
        <ProTable
          rowClassName='gesture'
          rowKey='id'
          columns={columns}
          loading = {false}
          options={false}
          actionRef={actionRef}
          search={{
            span:6,
            optionRender: (searchConfig, formProps, dom) => [
              ...dom.reverse(),
            ],
          }}
          request={(params) => requestList(params)}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
          headerTitle={(<>
            <Upload {...uploadProps} >
              <Button loading={btnLoading} icon={<ToTopOutlined />}> 导 入</Button>
            </Upload>
            <Tooltip placement="top" title={tooltip}  overlayInnerStyle={{'width':'450px'}}>
              <QuestionCircleOutlined  style={{ marginLeft: 4 }} />
            </Tooltip>
          </>)}
        />
      </Spin>
      <Details visible={visible} title={title}  defaultValues={defaultValues}  handleCancel={() => {handleCancel()}} />
      {
        delVisible ?
          <Dialog
            desc={descTitle}
            data={delSettleData}
            modalVisible={delVisible}
            onCancel={() => {
              setDelVisible(false);
            }}
            onSubmit={value => handleRemove(value.id)}
          />
          : ''
      }
    
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