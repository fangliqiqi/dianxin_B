import React, { useState,useImperativeHandle } from 'react';
import { Form, Row,Col,Upload  } from 'antd';
import { ModalForm } from '@ant-design/pro-form';


const Detail = (props) => {
  const { title, visible,defaultValues, close:handleCancel, childRef } = props;  

  const [certTypeOption, setCertTypeOption] = useState({});
  const [certStatusOption, setCertStatusOption] = useState({});

  useImperativeHandle(childRef,()=>{
    return {
      showCertTypeOption:(arr)=>{
        setCertTypeOption(arr);
      },
      showCertStatusOption:(arr)=>{
        setCertStatusOption(arr);
      },
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
        submitter = {false}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={12}>
            <Form.Item label="证件号">
            { defaultValues.certNum }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="证件类型">
              {certTypeOption[defaultValues.certType]}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="作业类别">
              { defaultValues.jobClass }
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="准操项目">
            { defaultValues.operationItem }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="初领日期">
            { defaultValues.receiveTime }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="有效期限">
            { defaultValues.termValidityStart } ~ { defaultValues.termValidityEnd }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="证件状态">
              {certStatusOption[defaultValues.status]}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="复审日期">
            { defaultValues.reviewDate }
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="证件照片">
              <Upload
                listType="picture-card"
                accept="image/*"
                fileList={defaultValues.fileList}
                showUploadList={{showRemoveIcon:false}}
              >
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Detail;

