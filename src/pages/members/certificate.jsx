import React, { useEffect, useState,useRef } from 'react';
import styles from './index.less';
import { PlusOutlined } from '@ant-design/icons';
import { getEmployeeBusinessInfoById } from '@/services/members';
import { Empty, Button, Row, Col, message,Tabs,Modal } from 'antd';
import { getDictMap,uploadFile,uploadMuiltFile } from '@/services/global';
import { allTcertinfo,addCertInfo,delCert } from '@/services/credentials';
import Edit from '@/pages/employeeManage/credentials/edit';
import CertificateItem from './components/certificate';

const { confirm } = Modal;
const { TabPane } = Tabs;

const Certificate = (props) => {

  const { location } = props;
  const [title, setTitle] = useState('');
  const [visible, setVisible] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [certStatus, setCertStatus] = useState({});
  const [certType, setCertType] = useState({});
  const [employeeInfo, setEmployeeInfo] = useState({});
  const childRef = useRef();
  const [data, setData] = useState([]);
  const [tabData, setTabData] = useState([]);
  const [token, setToken] = useState('');

  const getData = async () => {
    
    const option = {
      certStatus:{},
      certType:{}
    }
    const res1 = await getDictMap({itemType:'cert_status',type:0});
    if(res1.code === 200){
      option.certStatus = res1.data;
      setCertStatus(res1.data);
    }
    const res2 = await getDictMap({itemType:'cert_type',type:0});
    if(res2.code === 200){
      option.certType = res2.data;
      setCertType(res2.data);
    }

    const res3 = await allTcertinfo({ empIdcard: location.query.empIdcard });
    if (res3.code === 200) {
      const tabs = []
      const resData = res3.data.map(item=>{
        tabs.push(option.certType[item.certInfo.certType]);
        const temp = {...item.certInfo,...{certTypeName:option.certType[item.certInfo.certType],certStatusName:option.certStatus[item.certInfo.status]}};
        return {...item,...{certInfo:temp}};
      });
      setTabData(tabs);
      setData(resData);
    }

    const res4 = await getEmployeeBusinessInfoById({id: location.query.id,settleDomain:location.query.settleDomain});
    if(res4.code === 200){
      setEmployeeInfo(res4.data.employeeBusinessVo);
    }
  }

  useEffect(() => {
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);

    getData();
  }, []);

  
  const handleOption = (obj) => {
    const arr = [];
    // eslint-disable-next-line
    for(const key in obj){
      arr.push({
        value:key,
        label:obj[key]
      })
    }
    return arr;
  }

  const editRow = (titleTxt) => {
    setTitle(titleTxt);
    childRef.current.showCertTypeOption(handleOption(certType));
    childRef.current.showCertStatusOption(handleOption(certStatus));
    const obj = {
      empName: location.query.title,
      empIdcard: location.query.empIdcard,
    };
    setDefaultValues(obj);
    setVisible(true);
  }

  // 上传附件
  // const handleUpload = (files,domain) => {
  //   files.forEach(item=>{
  //     const formData = new FormData();
  //     formData.append('file',item);
  //     formData.append('type',6);
  //     formData.append('domain',domain);
  //     uploadFile(formData).then(res=>{
  //       if(res.code === 200){
  //         // message.success(`${item.name}上传成功`);
  //       }else{
  //         message.warning(res.msg);
  //       }
  //     });
  //   }) 
  // }

  const handleOk = async (values,files) => {
    const res = await addCertInfo({...{businessTelecomNumber:employeeInfo.businessTelecomNumber},...values});
    if(res.code === 200){
      message.success('新增成功!');
      const formData = new FormData();
      const type = [];
      const domain = [];
      if(files.length){
        // 多文件上传
        files.forEach(item=>{
          formData.append(`file`,item);
          type.push(6);
          domain.push(res.data.id);
        });
        formData.append(`type`,type.join(','));
        formData.append(`domain`,domain.join(','));
        const res1 = await uploadMuiltFile(formData);
        if(res1.code === 200){
          const msg = [];
          res1.data.map(item=>{
            if(item.code !== 200){
              msg.push(item.msg);
            }
          });
          if(msg.length){
            message.warning(msg.join(','));
          }
        }else{
          message.warning(res1.msg);
        }
      }
      
      setVisible(false);
      // 刷新页面数据
      setTimeout(()=>{getData()},500);
      childRef.current.showFileList([]);
    }else{
      message.warning(res.msg);
    }
  }

  const editTable = (targetKey,action) => {
    // 删除操作
    if(action === 'remove'){
      confirm({
        content: '确认删除么？',
        onOk() {
          delCert(data[targetKey].certInfo.id).then(res=>{
            if(res.code === 200){
              message.success('删除成功！');
              getData();
            }
          })
        },
      });
    }
  }

  const handleCancel = () => {
    setVisible(false);
    childRef.current.showFileList([]);
  }

  const freshData = () => {
    getData();
  }

  const emptyContent = (arr) => {
    if(arr.length){
      return null;
    }
    return (
      <div style={{padding:'30px'}}><Empty /></div>
    );
  }

  return (<div className={styles.certContainer}>
    <Row className={styles.row}>
      <Col span={4}>证件信息</Col>
      <Col span={2}><Button key="add" onClick={() => editRow('添加证件')} icon={<PlusOutlined />} type="primary">添加</Button></Col>
    </Row>
    <Tabs defaultActiveKey="0" type="editable-card" hideAdd onEdit={editTable}>
      {
        tabData.map((item,index)=>{
          return (
            <TabPane tab={item} key={index}>
              <CertificateItem freshData={freshData} itemData={data[index]} certStatusOption={handleOption(certStatus)} certTypeOption={handleOption(certType)} certStatus={certStatus} token={token} certType={certType}/>
            </TabPane>
          );
        })
      }
    </Tabs>
    {emptyContent(tabData)}
    <Edit title={title} childRef={childRef} visible={visible} handleCancel={handleCancel} handleOk={handleOk} defaultValues={defaultValues}/>

  </div>)
}

export default (props) => {
  return (
    <>
      <Certificate {...props} />
    </>
  )
}
