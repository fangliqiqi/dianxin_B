import React, { useState, useRef, useEffect } from 'react';
import { Form, TreeSelect,Input,Row,Col,Divider, message  } from 'antd';
import ProForm, { ModalForm, ProFormText,ProFormTextArea,ProFormDatePicker,ProFormSelect } from '@ant-design/pro-form';

import {getByBusinessTelecomNumber} from '@/services/departure';

const Detail = (props) => {

  const { detailTitle, detailVisible ,defaultValues, handleCancel } = props; 

  return (
    <React.Fragment>
      <ModalForm
        title={detailTitle}
        visible={detailVisible}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        width={800}
        submitter = {{
          submitButtonProps:{
            style:{
              display:'none'
            }
          },
          resetButtonProps:{
            style:{
              display:'none'
            }
          }
        }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => handleCancel(),
        }}
        initialValues={defaultValues}
      >
        <Row>
        <Col span={24}>
          <ProFormText
                name="teleNo"
                label="电信工号"
                readonly
                wrapperCol={{span:12}}
                labelCol={{span:3}}
              />
          </Col>
          <Col span={12}>
            <ProFormText
              name="name"
              label="姓名"
              readonly
            />
          </Col>
          <Col span={12}>
          <ProFormText
              name="idCard"
              label="身份证"
              readonly
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="deptName"
              label="所属部门"
              readonly
            />
          </Col>
          <Col span={12}>
          <ProFormText
              width="md"
              name="post"
              label="岗位"
              readonly
            />
          </Col>    
          <Col span={12}>
            <ProFormDatePicker 
              width="md" 
              name="leaveDate" 
              label="离职日期"
              readonly
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker 
            width="md" 
            name="leavePostDate" 
            label="离岗日期"
            readonly
           
          />
          </Col>
          <Col span={24}>
            <ProFormTextArea
                label="离职原因"
                readonly
                wrapperCol={{span:20}}
                labelCol={{span:3}}
                name="leaveReason" 
            />
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Detail;

