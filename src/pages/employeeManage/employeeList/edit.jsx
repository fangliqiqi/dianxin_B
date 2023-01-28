import React, { useState, useImperativeHandle } from 'react';
import { Form, TreeSelect, Row, Col, Divider, Upload, message } from 'antd';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
} from '@ant-design/pro-form';
import Dictionanes from '@/components/Dictionaries';
import { PlusOutlined } from '@ant-design/icons';
import { getAllTags } from '@/services/tags';
import { uploadFile, delUploadFile } from '@/services/global';
import styles from './index.less';

const Edit = (props) => {
  const { title, visible, treeData, defaultValues, handleCancel, handleOk, childRef } = props;
  const [departCode, setDepartCode] = useState(null);
  const [departName, setDepartName] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [token, setToken] = useState({});

  const sexDict = { 1: '男', 2: '女' };
  const workingHours = {
    1: '标准工时',
    2: '综合工时',
    3: '不定时工时制',
    4: '其他',
  };

  useImperativeHandle(childRef, () => {
    return {
      showToken: (obj) => {
        setToken(obj);
      },
      showFileList: (arr) => {
        setFileList(arr);
      },
    };
  });

  const getAllTagList = async () => {
    const res = await getAllTags();
    if (res.code === 200) {
      const data = [];
      res.data.forEach((item) => {
        data.push({
          value: item.id,
          label: item.name,
          disabled: item.status ? true : false,
        });
      });
      return data;
    }
  };

  const changeTree = (value, label, extra) => {
    setDepartCode(extra.allCheckedNodes[0].node.props.extra);
    setDepartName(label[0]);
  };

  const uploadButton = (text) => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  );

  const handleDelFile = (uid) => {
    const list = [...fileList];
    const index = list.findIndex((item) => item.uid === uid);
    list.splice(index, 1);
    setFileList(list);
  };
  // 上传证件
  const uploadProps = {
    beforeUpload: (file) => {
      if (file.size / 1024 / 1024 > 5) {
        message.error('图片大小大于5MB!');
        return false;
      }
      if (defaultValues.id) {
        // 编辑时上传文件
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 8);
        formData.append('domain', defaultValues.id);
        uploadFile(formData).then((res) => {
          if (res.code === 200) {
            setFileList([...fileList, res.data]);
            message.success(`${file.name}上传成功`);
          } else {
            message.warning(res.msg);
          }
        });
      } else {
        setFileList([...fileList, file]);
      }
    },
    onRemove: (file) => {
      if (/^\d+$/.test(file.uid)) {
        delUploadFile(file.uid).then((res) => {
          if (res.code === 200) {
            handleDelFile(file.uid);
            message.success(`${file.name}删除成功`);
          } else {
            message.warning(res.msg);
          }
        });
      } else {
        handleDelFile(file.uid);
      }
    },
  };

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
        width={800}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText: '保存',
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          const code = departCode || defaultValues.departCode;
          const name = departName || defaultValues.departName;
          const tags = values.employeeTags.length ? values.employeeTags.join(',') : '';
          values.businessEnjoinDate = values.businessEnjoinDate ? values.businessEnjoinDate : null;
          const params = {
            ...values,
            ...{
              extendId: defaultValues.extendId,
              departCode: code,
              departName: name,
              employeeTags: tags,
              empIdcard: defaultValues.empIdcard,
            },
          };

          handleOk(params);
        }}
        initialValues={defaultValues}
      >
        <Row>
          <Divider orientation="left">基本信息</Divider>
          <Col span={12}>
            <ProFormText
              name="businessTelecomNumber"
              label="电信工号"
              placeholder="请输入电信工号"
              rules={[
                { required: true, message: '请输入电信工号!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Item label="姓名">{defaultValues && defaultValues.empName}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="身份证号">{defaultValues && defaultValues.empIdcard}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="性别">{defaultValues && sexDict[defaultValues.empSex]}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="出生日期">
              {defaultValues &&
                (defaultValues.empBirthday ? defaultValues.empBirthday.substring(0, 10) : '')}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="民族">
              <Dictionanes type="nation">{defaultValues && defaultValues.empNational}</Dictionanes>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="户口">
              <Dictionanes type="household_nature">
                {defaultValues && defaultValues.empRegisType}
              </Dictionanes>
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="firstDegreeAndMajor"
              label="第一学历及专业"
              rules={[
                { required: true, message: '请输入第一学历及专业!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="firstDegreeGraduateSchool"
              label="第一学历院校"
              rules={[
                { required: true, message: '请输入第一学历院校!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="highestDegreeAndMajor"
              label="最高学历和专业"
              rules={[
                { required: true, message: '请输入最高学历和专业!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="highestDegreeGraduateSchool"
              label="最高学历院校"
              rules={[
                { required: true, message: '请输入最高学历院校!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={24} className={styles.row}>
            <Form.Item label="学信网截图">
              <Upload
                action="/api/yifu-business/method/tbusdept/getParentList"
                method="get"
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

          <Col span={12}>
            <ProFormText
              width="md"
              name="contactInfo"
              label="联系方式"
              rules={[
                { required: true, message: '请输入联系方式!' },
                { pattern: /^1\d{10}$/, message: '联系方式格式错误！' },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="archivesAddr"
              label="档案托管地"
              rules={[
                { required: true, message: '请输入档案托管地!' },
                { max: 20, message: '最多不超过20个字符!' },
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Item label="工资卡号">{defaultValues && defaultValues.empBankNo}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="工资卡开户行">{defaultValues && defaultValues.empBankName}</Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              width="md"
              name="employeeTags"
              label="标签名称"
              request={getAllTagList}
              fieldProps={{ mode: 'multiple' }}
            />
          </Col>
          <Divider orientation="left">岗位信息</Divider>
          <Col span={12}>
            <Form.Item
              name="departId"
              label="所属部门"
              rules={[{ required: true, message: '请输入所属部门!' }]}
            >
              <TreeSelect
                style={{ width: 219 }}
                dropdownStyle={{ width: 450 }}
                allowClear={true}
                showSearch={true}
                onChange={changeTree}
                dropdownMatchSelectWidth={false}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                treeNodeFilterProp="title"
                placeholder="请选择所属部门"
                treeDefaultExpandAll
                treeData={treeData}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormText
              width="md"
              name="businessPost"
              label="岗位"
              rules={[{ max: 50, message: '最多不超过50个字符!' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              width="md"
              name="businessEnjoinDate"
              label="入职日期"
              rules={[{ required: true, message: '请选择入职日期!' }]}
            />
          </Col>
          <Col span={12}>
            <Form.Item label="工时制度">
              {defaultValues && workingHours[defaultValues.workingHours]}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="劳动合同开始日期">
              {defaultValues && defaultValues.contractStartDate}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="劳动合同结束日期">
              {defaultValues && defaultValues.contractEndDate}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="新签/续签">{defaultValues && defaultValues.situation}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="累计请签约次数">
              {defaultValues && defaultValues.situationCount}
            </Form.Item>
          </Col>
          <Divider orientation="left">离职信息</Divider>
          <Col span={12}>
            <Form.Item label="离职日期">
              {defaultValues &&
                (defaultValues.businessLeaveDate
                  ? defaultValues.businessLeaveDate.substring(0, 10)
                  : '')}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="社保停缴月份">
              {defaultValues && defaultValues.socialReduceDate}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="离职原因">{defaultValues && defaultValues.leaveReason}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="公积金停缴月份">
              {defaultValues && defaultValues.fundReduceDate}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="离职备注">{defaultValues && defaultValues.leaveRemark}</Form.Item>
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  );
};

export default Edit;
