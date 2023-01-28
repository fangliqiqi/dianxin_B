import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './index.less';

const Dialog = props => {
  const { desc,data, modalVisible, onSubmit: handleSubmit, onCancel } = props;

  // 点击确定按钮
  const handleOk = () => {
    handleSubmit(data);
  };

  // 标题样式
  const titleRender = () => {
    return (
      <span className={styles.dialogTitle}>提示</span>
    )
  };

  const contentRender = () => {
    return (
      <div className={styles.dialogContent}>
        <ExclamationCircleOutlined className={styles.icon} />
        <p className={styles.content}>{desc}</p>
      </div>
    )
  };

  return (
    <Modal
      title={titleRender()}
      visible={modalVisible}
      icon={<ExclamationCircleOutlined />}
      content='Some descriptions'
      onOk={handleOk}
      onCancel={() => onCancel()}>
      {
        contentRender()
      }
    </Modal>
  )
}
export default Dialog
