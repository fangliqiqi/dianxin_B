import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { connect } from "umi";
import { Form, Row, Col, Upload } from 'antd';
import { ModalForm } from '@ant-design/pro-form';

const Edit = (props) => {
  const { title, visible, handleCancel, defaultValues, childRef } = props;
  const formRef = useRef();

  const [fileList, setFileList] = useState([]);
  const [vacationTypeObj, setVacationTypeObj] = useState({});
  const [hideItem, setHideItem] = useState(true);
  const [vacationStatusObj, setVacationStatusObj] = useState({});


  useEffect(() => {

  }, [])

  useImperativeHandle(childRef, () => {
    return {
      showVacationType: (obj) => {
        setVacationTypeObj(obj);
      },
      showVacationStatus: (obj) => {
        setVacationStatusObj(obj);
      },
      showFileList: (arr) => {
        const file = arr.map(item => {
          return {
            uid: item.id,
            name: item.attaName,
            url: item.attaSrc,
            status: 'done'
          }
        });
        setFileList(file);
      },
      showAnual:(type)=>{
        if(type === '5'){
          setHideItem(false);
        }else{
          setHideItem(true);
        }
      }
    }
  });

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        width={850}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => handleCancel(),
        }}
        submitter={false}
        formRef={formRef}
      >
        <Row>
          <Col span={12}>
            <Form.Item label="电信工号">
              {defaultValues.businessTelecomNumber}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="姓名">
              {defaultValues.empName}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="身份证号">
              {defaultValues.empIdcard}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="所属部门">
              {defaultValues.departName}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="岗位">
              {defaultValues.businessPost}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="假勤类型">
              {vacationTypeObj[defaultValues.vacationType]}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="剩余年假" hidden={hideItem}>
              {defaultValues.vacationNotUsedDuration}h
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="开始时间">
              {defaultValues.vacationStartTime ? defaultValues.vacationStartTime.substring(0, 10) : ''}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="结束时间">
              {defaultValues.vacationEndTime ? defaultValues.vacationEndTime.substring(0, 10) : ''}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="假勤时长">
              {defaultValues.vacationDuration}h
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label="假勤事由" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {defaultValues.vacationReason}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="附件" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              <Upload fileList={fileList} showUploadList={{ showRemoveIcon: false }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="假勤状态" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {vacationStatusObj[defaultValues.vacationStatus]}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="实际结束时间" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {defaultValues.acturalVacationEndTime ? defaultValues.acturalVacationEndTime.substring(0, 10) : ''}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="销假说明" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {defaultValues.vacationNote}
            </Form.Item>
          </Col>
        </Row>

      </ModalForm>
    </React.Fragment>
  )

}

export default connect(() => { return {} })(Edit);

