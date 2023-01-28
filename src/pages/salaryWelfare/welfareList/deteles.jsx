import React, { useState,useImperativeHandle } from 'react';
import { Form, Row,Col,Upload,DatePicker,Modal, message} from 'antd';
import { ModalForm } from '@ant-design/pro-form';
import { departList,getDepartAll,allDeparts } from '@/services/depart';
import {welfareList} from '@/services/welfare'
import SelectPage from '@/components/SelectPage';
import moment from 'moment';

const { confirm } = Modal;
const Detail = (props) => {
  const { title, visible,defaultValues, handleCancel, handleDeteles,childRef} = props;  

  // const [certTypeOption, setCertTypeOption] = useState({});
  // const [certStatusOption, setCertStatusOption] = useState({});

  useImperativeHandle(childRef,()=>{
    return {
      // showCertTypeOption:(arr)=>{
      //   setCertTypeOption(arr);
      // },
      // showCertStatusOption:(arr)=>{
      //   setCertStatusOption(arr);
      // },
    }
  })

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
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          const salaryMonth = moment(values.salaryMonth).format("YYYYMM")
          const params = {salaryMonth,deptId:values.deptId}
          welfareList(params).then(res=>{
            // console.log(res)
            if(res.code===200){
              if(res.data.total>0){
                confirm({
                  content: `确定要删除${res.data.total}条数据吗?`,
                  onOk() {
                    handleDeteles(params);
                  },
                  onCancel() {
                    
                  },
                });
              }else{
                message.warning(`所属部门和工资月份下无数据~`)
              }
            }
          })

          
        }}
        initialValues={defaultValues}
      >
        <Form.Item label="所属部门"  name="deptId"  rules={[{ required: true, message: '请选择所属部门!' }]}>
          <SelectPage getData={departList} selectProps={{placeholder:'输入部门搜索',allowClear:true,showSearch:true,optionFilterProp:'children'}} labeltitle="name" labelvalue="id"/>
        </Form.Item>
        <Form.Item label="工资月份"  name="salaryMonth" rules={[{ required: true, message: '请选择工资月份!'}]}>
            <DatePicker  picker="month" format = 'YYYYMM' style={{width:'100%'}}/>
        </Form.Item>
      </ModalForm>
    </React.Fragment>
  )
}

export default Detail;

