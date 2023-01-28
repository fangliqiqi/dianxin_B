import React, { useState,useImperativeHandle } from 'react';
import { Form,message,Row,Col,Upload  } from 'antd';
import { ModalForm, ProFormText,ProFormDateRangePicker,ProFormDatePicker,ProFormSelect } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import {uploadFile,delUploadFile} from '@/services/global';

const Edit = (props) => {
  const { title, visible,defaultValues, handleCancel, handleOk,childRef } = props;  
  
  const [fileList, setFileList] = useState([]);
  const [certTypeOption, setCertTypeOption] = useState([]);
  const [certStatusOption, setCertStatusOption] = useState([]);
  const [token, setToken] = useState({});
  
  useImperativeHandle(childRef,()=>{
    return {
      showCertTypeOption:(arr)=>{
        setCertTypeOption(arr);
      },
      showCertStatusOption:(arr)=>{
        setCertStatusOption(arr);
      },
      showToken:(obj)=>{
        setToken(obj);
      },
      showFileList:(arr)=>{
        setFileList(arr);
      },
    }
  })

  const handleDelFile = (uid) => {
    const list = [...fileList];
    const index = list.findIndex(item=>item.uid === uid);
    list.splice(index,1);
    setFileList(list);
  }
  // 上传证件
  const uploadProps = {
    beforeUpload:(file)=>{
      if (file.size / 1024 / 1024 > 5) {
        message.error('图片大小大于5MB!');
        return false;
      }
      if(defaultValues.id){
        // 编辑时上传文件
        const formData = new FormData();
        formData.append('file',file);
        formData.append('type',6);
        formData.append('domain',defaultValues.id);
        uploadFile(formData).then(res=>{
          if(res.code === 200){
            setFileList([...fileList,res.data]);
            message.success(`${file.name}上传成功`);
          }else{
            message.warning(res.msg);
          }
        });
      }else{
        setFileList([...fileList,file]);
      }
    },
    onRemove:(file)=>{
      if(/^\d+$/.test(file.uid)){
        delUploadFile(file.uid).then(res=>{
          if(res.code === 200){
            handleDelFile(file.uid);
            message.success(`${file.name}删除成功`);
          }else{
            message.warning(res.msg);
          }
        })
      }else{
        handleDelFile(file.uid);
      }
    }
  }

  const uploadButton = (text) => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
  
  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        width={645}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          const obj = {};
          if(defaultValues.id){
            obj.id = defaultValues.id;
          }else{
            obj.empName = defaultValues.empName;
            obj.empIdcard = defaultValues.empIdcard;
          }
          let params = {...values,...obj};
          if(values.termValidity){
            params = {...params,...{termValidityStart:values.termValidity[0],termValidityEnd:values.termValidity[1]}}
          }else{
            params.termValidityStart = ''
            params.termValidityEnd = ''
          }
          if(!values.receiveTime){
            params.receiveTime = ''
          }

          handleOk(params,fileList);
        }}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={24}>
            <ProFormText
              name="certNum"
              label="证件号码"
              placeholder="请输入证件号"
              rules={[{ required: true, message: '请输入证件号!' },{max:50,message:'最多不超过50个字符!'}]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="certType"
              label="证件类型"
              width="sm"
              options={certTypeOption}
              fieldProps={{getPopupContainer:triggerNode => triggerNode.parentNode}}
              placeholder="请输入证件类型"
              rules={[{ required: true, message: '请输入证件类型!' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="status"
              label="证件状态"
              width="sm"
              disabled = {defaultValues.id}
              options={certStatusOption}
              placeholder="请输入证件状态"
              fieldProps={{getPopupContainer:triggerNode => triggerNode.parentNode}}
              rules={[{ required: true, message: '请输入证件状态!' }]}
            />
          </Col>
          <Col span={24}>
            <ProFormText
              name="jobClass"
              label="作业类别"
              placeholder="请输入作业类别"
              rules={[{ required: true, message: '请输入作业类别!' },{max:50,message:'最多不超过50个字符!'}]}
            />
          </Col>
          <Col span={24}>
            <ProFormText
              name="operationItem"
              label="&nbsp;&nbsp;&nbsp;准操项目"
              placeholder="请输入准操项目"
              rules={[{max:100,message:'最多不超过100个字符!'}]}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker width="sm" name="receiveTime" label="&nbsp;&nbsp;&nbsp;初领日期" fieldProps={{getPopupContainer:triggerNode => triggerNode.parentNode}}/>
          </Col>
          <Col span={12}>
            <ProFormDateRangePicker width="sm" name="termValidity" label="&nbsp;&nbsp;&nbsp;有效期限" fieldProps={{getPopupContainer:triggerNode => triggerNode.parentNode}} />
          </Col>
          <Col span={24}>
            <ProFormDatePicker width="sm" name="reviewDate" label="复审日期" rules={[{ required: true, message: '请选择复审日期!' }]} fieldProps={{getPopupContainer:triggerNode => triggerNode.parentNode}}/>
          </Col>
          <Col span={24}>
            {/* <ProFormUploadDragger label="　证件照片" name="dragger" description={null} action="upload.do" fieldProps={{listType:'picture-card'}} /> */}
            <Form.Item label="　证件照片">
              <Upload
                action='/api/yifu-business/method/tbusdept/getParentList'
                method='get'
                headers={token}
                listType="picture-card"
                accept="image/*"
                fileList={fileList}
                beforeUpload={uploadProps.beforeUpload}
                onRemove={uploadProps.onRemove}
              >
                {uploadButton('上传')}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;

