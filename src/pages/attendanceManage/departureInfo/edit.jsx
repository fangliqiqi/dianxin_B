import React, { useState, useRef,useEffect } from 'react';
import { Form, Input,Row,Col, message  } from 'antd';
import { ModalForm, ProFormText,ProFormTextArea,ProFormDatePicker } from '@ant-design/pro-form';
import { departList,getDepartAll,allDeparts} from '@/services/depart';
import {getByBusinessTelecomNumber} from '@/services/departure';
import { debounce } from '@/utils/utils';

const Edit = (props) => {

  const { title, visible,defaultValues,disabledLabel,readOnly, handleCancel, handleOk,isLoading} = props; 
  
  const formRef = useRef();

  const [deptId,setDeptid] = useState('');
  const [deptTreeLogo,setDeptTreeLogo] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [allDepart, setAllDepart] = useState([]);

  useEffect(() => {
    getDepartAll().then(res=>{
      if(res.code === 200){
        setAllDepart(res.data);
      }
    })
  }, [] )
  
  const clearForm = () => {
    formRef.current.setFieldsValue({
      teleNo:'',
      name: '',
      idCard:'',
      deptName:'',
      post:''
    });
  }

  const handFindleave = (val)=>{
    if(val){
      setBtnLoading(true);
      getByBusinessTelecomNumber({businessTelecomNumber:val}).then(res=>{
        if(res.code === 200 && res.data){
          if(res.data.businessWorkingStatus==='1'){
            message.error(`${val}工号员工已离职，请核实无误后再操作！`);
            clearForm();
          }else{
            const departRes = allDepart.find(item=>item.id === res.data.departId);
            let depart = '';
            if(departRes){
              depart = departRes.name;
            }
            // 向form 表单中加入数据
            formRef.current.setFieldsValue({
              name: res.data.empName,
              idCard:res.data.empIdcard,
              deptName:depart,
              post:res.data.businessPost,
            });
            setDeptid(res.data.departId);
            setDeptTreeLogo(res.data.departCode);
          } 
        }else{
          message.error(`无${val}工号员工，请核实无误后再操作！`);
          clearForm();
        }
      }).finally(()=>{
        setBtnLoading(false);
      })
    }else{
      clearForm();
    }
  }

  const waitTime = (time=100,values) => {
    return setTimeout(() => {
        handleOk(values);
        setBtnLoading(false);
      }, time);
  };

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        width={800}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        submitter={{
          submitButtonProps:{loading:btnLoading}
        }}
        onFinish={async (values) => {
          setBtnLoading(true);
          const obj = values;
          obj.deptId = defaultValues.id?defaultValues.deptid:deptId;
          obj.deptTreeLogo =defaultValues.id? defaultValues.deptTreeLogo:deptTreeLogo;
          if(defaultValues.id){
            obj.id = defaultValues.id;
          }
          waitTime(1000,obj);
        }}
        initialValues={defaultValues}
        formRef={formRef}
      >
        <Row>
        <Col span={24}>
           <Form.Item 
            label="电信工号"    
            name="teleNo" 
            labelCol={{span:3}} 
            wrapperCol={{span:8}} 
            rules={[{ required: true, message: '请输入电信工号!' }]}
            >
              <Input
                disabled= {disabledLabel}
                bordered={!readOnly}
                onChange={(e)=>{
                  setBtnLoading(true);
                  debounce(handFindleave,1000,e.currentTarget.value);
                }}
                placeholder="请输入电信工号"
                />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormText
              name="name"
              label="姓名"
              readonly
              placeholder="离职人员姓名"
            />
          </Col>
          <Col span={12}>
          <ProFormText
              name="idCard"
              label="身份证"
              readonly
              placeholder="离职人员身份证"
             
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="deptName"
              label="所属部门"
              // disabled
              readonly
              placeholder="离职人员所属部门"
              
            />
          </Col>
          <Col span={12}>
          <ProFormText
              width="md"
              name="post"
              label="岗位"
              // disabled
              readonly
              placeholder="离职人员岗位"
              
            />
          </Col>    
          <Col span={12}>
            <ProFormDatePicker 
              width="md" 
              name="leaveDate" 
              label="离职日期"
              readonly = {readOnly} 
              rules={[{ required: true, message: '请选择离职日期!' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker 
            width="md" 
            name="leavePostDate" 
            label="离岗日期"
            readonly = {readOnly}
            rules={[{ required: true, message: '请选择离岗日期!'}]}
          />
          </Col>
          <Col span={24}>
            <ProFormTextArea
                label="离职原因"
                readonly = {readOnly}
                wrapperCol={{span:20}}
                labelCol={{span:3}}
                placeholder = '请输入离职原因(最多200字)'
                name="leaveReason" 
                fieldProps={{
                  maxLength:200,
                  showCount:true,
                  allowClear:true,
                }}
                rules={[{ required: true, message: '请填写离职原因!'}]}
            />
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;

