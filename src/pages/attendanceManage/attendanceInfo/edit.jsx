import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { connect } from 'umi';
import { Form, Row, Col, Input, message, Upload } from 'antd';
import { debounce } from '@/utils/utils';
import { getRemainAttendance } from '@/services/attendance';
import { getByBusinessTelecomNumber } from '@/services/departure';
import moment from 'moment';

import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormUploadDragger,
} from '@ant-design/pro-form';

const { TextArea } = Input;

const Edit = (props) => {
  const { title, visible, handleCancel, defaultValues, handleOk, childRef, allDepart } = props;
  const formRef = useRef();

  const [fileList, setFileList] = useState([]);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [vacationTypeObj, setVacationTypeObj] = useState({});
  const [hideItem, setHideItem] = useState(true);
  const [token, setToken] = useState({});
  const [disabledEdit, setDisabledEdit] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [remainAnnual, setRemainAnnual] = useState(0);

  useEffect(() => {
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, []);

  useImperativeHandle(childRef, () => {
    return {
      showVacationType: (obj) => {
        setVacationTypeObj(obj);
      },
      showFileList: (arr) => {
        const file = arr.map((item) => {
          return {
            uid: item.id,
            name: item.attaName,
            url: item.attaSrc,
            status: 'done',
          };
        });
        setDefaultFileList(file);
      },
      cleaFile: () => {
        setDefaultFileList([]);
        setFileList([]);
      },
      cleaAnual: () => {
        setHideItem(true);
        setRemainAnnual(0);
        formRef.current.setFieldsValue({ vacationNotUsedDuration: 0 });
      },
      isEdit: (flag) => {
        setDisabledEdit(flag);
      },
      showAnual: (type) => {
        if (type === '5') {
          setHideItem(false);
          // getRemainAttendance(idCard).then(res=>{
          //   if(res.code === 200){
          //     setRemainAnnual(res.data||0);
          //     formRef.current.setFieldsValue({vacationNotUsedDuration:res.data||0});
          //   }
          // })
        } else {
          setHideItem(true);
        }
      },
    };
  });

  const remainAttendance = async (idCard) => {
    const res = await getRemainAttendance(idCard);
    if (res.code === 200) {
      return res.data;
    }
    return '';
  };

  const waitTime = (time = 100, values, files) => {
    return setTimeout(() => {
      delete values.vacationNotUsedDuration;
      handleOk(values, files);
      setBtnLoading(false);
    }, time);
  };

  const clearForm = () => {
    formRef.current.setFieldsValue({
      businessTelecomNumber: '',
      empName: '',
      empIdcard: '',
      departName: '',
      businessPost: '',
      departId: '',
    });
  };

  const handFindleave = async (val) => {
    if (val) {
      formRef.current.setFieldsValue({
        vacationDuration: '',
      });
      const res1 = await getByBusinessTelecomNumber({ businessTelecomNumber: val });
      if (res1.code === 200 && res1.data) {
        if (res1.data.businessWorkingStatus === '1') {
          message.error(`${val}工号员工已离职，请核实无误后再操作！`);
          clearForm();
        } else {
          const departRes = allDepart.find((item) => item.id === res1.data.departId);
          let depart = '';
          if (departRes) {
            depart = departRes.name;
          }
          const remainRes = await remainAttendance(res1.data.empIdcard);
          setRemainAnnual(remainRes || 0);
          // 向form 表单中加入数据
          formRef.current.setFieldsValue({
            empName: res1.data.empName,
            empIdcard: res1.data.empIdcard,
            departName: depart,
            businessPost: res1.data.businessPost,
            departId: res1.data.departId,
            vacationNotUsedDuration: remainRes || 0,
          });
        }
      } else {
        message.error(`无${val}工号员工，请核实无误后再操作！`);
        clearForm();
      }
    } else {
      clearForm();
    }
    setBtnLoading(false);
  };

  // 假勤类型
  const changeSelect = async (val) => {
    // 年休假
    if (val === '5') {
      setHideItem(false);
      if (defaultValues.id) {
        const result = await remainAttendance(defaultValues.empIdcard);
        if (result.code === 200) {
          setRemainAnnual(result.data || 0);
          formRef.current.setFieldsValue({ vacationNotUsedDuration: result.data || 0 });
        }
      }
    } else {
      setHideItem(true);
    }
  };

  const disabledStartDate = (start) => {
    const end = formRef.current.getFieldValue('vacationEndTime');
    if (!start || !end) {
      return false;
    }
    const startTime = moment(start).format('YYYY-MM-DD 00:00:00');
    const endTime = moment(end).format('YYYY-MM-DD 23:59:59');
    return moment(startTime).valueOf() > moment(endTime).valueOf();
  };

  const disabledEndDate = (end) => {
    const start = formRef.current.getFieldValue('vacationStartTime');
    if (!end || !start) {
      return false;
    }
    return moment(start).valueOf() >= moment(end).valueOf();
  };
  const disabledLastDate = (end) => {
    const start = defaultValues.vacationEndTime;
    if (!end || !start) {
      return false;
    }
    const endTime = moment(end).format('YYYY-MM-DD 23:59:59');
    return moment(start, 'YYYY-MM-DD').valueOf() < moment(endTime).subtract(1, 'days').valueOf();
  };

  // 上传证件
  const uploadProps = {
    headers: token,
    action: '/yifu-upms/method/tbusdept/getParentList',
    method: 'get',
    fileList: defaultFileList,
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      setDefaultFileList([...defaultFileList, file]);
    },
    onRemove: (file) => {
      const res = fileList.filter((item) => item.uid !== file.uid);
      setFileList(res);
      setDefaultFileList(res);
    },
  };

  const changeVacation = (e) => {
    const val = e.target.value;
    const vacationType = formRef.current.getFieldValue('vacationType');
    const remain = formRef.current.getFieldValue('vacationNotUsedDuration');
    if (vacationType === '5') {
      // formRef.current.setFieldsValue({ vacationNotUsedDuration: remainAnnual });
      if (remain < val) {
        message.warning('假勤时长不能大于剩余年假!');
        formRef.current.setFieldsValue({ vacationDuration: '' });
        return false;
      }
    }
  };

  const blurVacation = () => {
    const res = remainAnnual - formRef.current.getFieldValue('vacationDuration');
    // eslint-disable-next-line no-restricted-properties
    const m = Math.pow(10, 1);
    formRef.current.setFieldsValue({ vacationNotUsedDuration: Math.round(res * m) / m });
  };

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
        submitter={{
          submitButtonProps: { loading: btnLoading },
        }}
        onFinish={async (values) => {
          setBtnLoading(true);
          const obj = {};
          if (defaultValues) {
            obj.id = defaultValues.id;
          }
          const params = {
            ...values,
            ...obj,
            ...{
              vacationStartTime: `${values.vacationStartTime} 00:00:00`,
              vacationEndTime: `${values.vacationEndTime} 23:59:59`,
            },
          };
          waitTime(1000, params, fileList);
        }}
        formRef={formRef}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={12}>
            <ProFormText
              width="md"
              name="businessTelecomNumber"
              label="电信工号"
              placeholder="请输入电信工号"
              disabled={disabledEdit}
              fieldProps={{
                onChange: (e) => {
                  setBtnLoading(true);
                  debounce(handFindleave, 1000, e.currentTarget.value);
                },
              }}
              rules={[{ required: true, message: '请输入电信工号!' }]}
            />
          </Col>
          <Col span={12}>
            <Form.Item name="departId" label="所属部门" hidden={true}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ProFormText width="md" name="empName" label="姓名" readonly placeholder="请输入名称" />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="empIdcard"
              label="身份证号"
              readonly
              placeholder="请输入身份证号"
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="departName"
              label="所属部门"
              readonly
              placeholder="请输入所属部门"
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="businessPost"
              label="岗位"
              readonly
              placeholder="请输入岗位"
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ProFormSelect
              width="md"
              name="vacationType"
              label="假勤类型"
              placeholder="请选择假勤类型"
              rules={[{ required: true, message: '请选择假勤类型!' }]}
              disabled={disabledEdit}
              fieldProps={{ onChange: changeSelect }}
              valueEnum={vacationTypeObj}
            />
          </Col>
          <Col span={12}>
            <Form.Item name="vacationNotUsedDuration" label="剩余年假" hidden={hideItem}>
              <Input placeholder="请输入剩余年假" disabled addonAfter="h" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ProFormDatePicker
              width="md"
              name="vacationStartTime"
              label="开始时间"
              placeholder="请选择开始时间"
              rules={[{ required: true, message: '请选择开始时间!' }]}
              fieldProps={{
                getPopupContainer: (triggerNode) => triggerNode.parentNode,
                disabledDate: disabledStartDate,
              }}
              disabled={disabledEdit}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              width="md"
              name="vacationEndTime"
              label="结束时间"
              placeholder="请选择结束时间"
              rules={[{ required: true, message: '请选择结束时间!' }]}
              disabled={disabledEdit}
              fieldProps={{
                getPopupContainer: (triggerNode) => triggerNode.parentNode,
                disabledDate: disabledEndDate,
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="vacationDuration"
              label="假勤时长"
              placeholder="请输入假勤时长"
              rules={[
                { required: true, message: '请输入假勤时长!' },
                {
                  pattern: /^(0\.\d{1}|([1-9]\d*))(\.\d{1})?$/,
                  message: '假勤时长为正整数或者最多一位小数',
                },
              ]}
              disabled={disabledEdit}
              fieldProps={{ addonAfter: 'h', onChange: changeVacation, onBlur: blurVacation }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              name="vacationReason"
              label="假勤事由"
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              rules={[{ max: 200, message: '最多200个字符!' }]}
            >
              <TextArea placeholder="请输入假勤事由" disabled={disabledEdit} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="附件" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {!defaultValues.id ? (
                <ProFormUploadDragger
                  fieldProps={uploadProps}
                  method="get"
                  description=""
                  disabled={disabledEdit}
                />
              ) : (
                <Upload
                  fileList={defaultFileList}
                  showUploadList={{ showRemoveIcon: false }}
                ></Upload>
              )}
            </Form.Item>
          </Col>
        </Row>
        {!defaultValues.id ? null : (
          <Row>
            <Col span={12}>
              <ProFormDatePicker
                width="md"
                name="acturalVacationEndTime"
                label="实际结束时间"
                placeholder="请选择实际结束时间"
                rules={[{ required: true, message: '请选择实际结束时间!' }]}
                fieldProps={{
                  getPopupContainer: (triggerNode) => triggerNode.parentNode,
                  disabledDate: disabledLastDate,
                }}
              />
            </Col>
            <Col span={24}>
              <Form.Item
                name="vacationNote"
                label="销假说明"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                rules={[
                  { required: true, message: '请输入销假说明!' },
                  { max: 200, message: '最多200个字符!' },
                ]}
              >
                <TextArea placeholder="请输入销假说明" />
              </Form.Item>
            </Col>
          </Row>
        )}
      </ModalForm>
    </React.Fragment>
  );
};

export default connect(() => {
  return {};
})(Edit);
