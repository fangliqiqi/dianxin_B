import React,{useState,useImperativeHandle} from 'react';
import { Form, Row,Col,Timeline } from 'antd';
import { DownOutlined,UpOutlined } from '@ant-design/icons';
import  { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import styles from './index.less';

const Edit = (props) => {
  const { title, visible,defaultValues, handleCancel, handleOk,childRef } = props;  
  const [list, setList] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  
  useImperativeHandle(childRef, () => ({
    getList: (arr) => {
      setList(arr);
    },
  }));

  const downArrow = () => {
    setList(defaultValues.list);
  }
  const upArrow = () => {
    setList(list.slice(0,3));
  }

  const showArrow = (val) => {
    return val>3 ? <UpOutlined onClick={upArrow} className={styles.arrowDown}/> : <DownOutlined className={styles.arrowDown} onClick={downArrow}/>;
  }

  const waitTime = (time=100,values) => {
    return setTimeout(() => {
        handleOk(values)
        setBtnLoading(false)
      }, time);
  };
  
  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{span: 4}}
        wrapperCol={{span: 20}}
        width={700}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          confirmLoading: btnLoading,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        submitter={{
          submitButtonProps:{loading:btnLoading}
        }}
        onFinish={async (values) => {
          setBtnLoading(true);
          const query = {...values,...{vacationMonitorId:defaultValues.id}};
          await waitTime(1000,query);
          return true;
        }}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={24}>
            <Form.Item label="未休时长">
              {defaultValues.notUsedVacationDuration}h
            </Form.Item>
          </Col>
          <Col span={24}>
            <ProFormTextArea
              name="clearNote"
              label="清零说明"
              rules={[{ required: true, message: '请输入清零说明!' },{max:200,message:'最多200个字符!'}]}
            />
          </Col>
          <Col span={24}>
            <p className={styles.title}>操作日志 {(defaultValues.list && defaultValues.list.length>3) ? showArrow(list.length) : null}  </p>
            <Timeline>
              {list.map(item=>{
                return (
                  <Timeline.Item key={item.id} color="green">
                    <div>清零时长: {item.clearDuration}h ({item.vacationYear}年)</div>
                    <div>清零说明: { item.clearNote }</div>
                    <div>{ item.clearUser }</div>
                    <div>{ item.clearTime }</div>
                  </Timeline.Item>
                )
              })}
            </Timeline>
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;
