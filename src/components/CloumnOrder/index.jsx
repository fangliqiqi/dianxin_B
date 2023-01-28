import React from 'react';
import { Row, Col, Space,Upload } from 'antd';
import styles from './index.less';

const layoutAlign = (titleAlignRight, isCenter) => {
  // isCenter ? styles.textCenter : (titleAlignRight ? styles.textRight : styles.textLeft)
  if (isCenter) {
    return styles.textCenter;
  }
  if (titleAlignRight) {
    return styles.textRight;
  }
  return styles.textLeft;
};

const valueEnumLayout = (data, item) => {
  const key = Number(data[item.dataIndex] || '');
  const value = item.valueEnum && item.valueEnum[key];
  return (
    <span className={styles.rightTxt}>{value || '-'}</span>
  )
};

const getValueWithItem = (data, item) => {
  if (item) {
    if (item.render) {
      return <span className={styles.rightTxt}>{item.render(data[item.dataIndex], data)}</span>;
    }
    if (item.valueEnum) {
      return valueEnumLayout(data, item);
    }
  }
  return (<span className={styles.rightTxt}>{data[item.dataIndex] ? data[item.dataIndex] : '-'}</span>);
};

const CloumnOrder = props => {

  const { titleAlignRight, isCenter, cloumns, rowGutter, colSpan, data, status, statusColor } = props;

  const incidentDetailStatus = () => {
    return status ? (
      <div className={styles.statusLabel} style={{ color: statusColor }}>{status}</div>
    ) : null
  }

  const descLayout = (item, index) => {
    return (
      <Space key={index+Math.random()} direction="vertical" size={20}>
        <span className={styles.rowTitle}>{item.title}</span>
        <div className={styles.descWrap}>
          {data[item.dataIndex] ? data[item.dataIndex] : '-'}
        </div>
      </Space>
    )
  }

  const renderItem = (item,index) => {
    return item.dataIndex === 'fileList' ? (
      <Col style={{ display: 'flex' }} key={index+Math.random()} span={24}>
        <span className={styles.labelTxt}>{item.title}</span>
        <span className={styles.valuetxt}>
          <Upload
            listType="picture-card"
            showUploadList={{showRemoveIcon:false}}
            fileList={data.fileList}
          ></Upload>
        </span>
      </Col>
    ) : (
        <Col style={{ display: 'flex' }} key={index+Math.random()} span={colSpan ? colSpan : 12}>
          <span className={layoutAlign(titleAlignRight, isCenter)}>{item.title}</span>
          {
            getValueWithItem(data, item)
          }
        </Col>
      )
    
  }

  return (
    <div className='antRowContainer'>
      {
        incidentDetailStatus()
      }
      { data ? (
        <Row gutter={[0, rowGutter ? rowGutter : 32]}>
        {
          cloumns && (
            cloumns.map((item, index) => {
              return item.desc ? (
                descLayout(item, index)
              ) : renderItem(item,index)
              
            })
          )
        }
        </Row>
      ) : null }
      
    </div>
  )
}
export default CloumnOrder;
