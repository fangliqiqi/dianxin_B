import React, { useState, useRef } from 'react';
import CardDetail from '@/components/CardDetail';
import styles from './index.less';
import { EditOutlined } from '@ant-design/icons';
import { Button, Upload, Timeline, message } from 'antd';
import { editCertInfo } from '@/services/credentials';
import Edit from '@/pages/employeeManage/credentials/edit';

// 基本信息
const basicInfo = [
  {
    title: '姓名',
    dataIndex: 'empName',
  },
  {
    title: '证件号',
    dataIndex: 'certNum',
  },
  {
    title: '性别',
    dataIndex: 'empIdcard',
    render: (item) => {
      let text = '女';
      if (parseInt(item.slice(-2, -1), 10) % 2 === 1) {
        text = '男';
      }
      return text;
    },
  },
  {
    title: '作业类别',
    dataIndex: 'jobClass',
  },
  {
    title: '准操项目',
    dataIndex: 'operationItem',
  },
  {
    title: '初领日期',
    dataIndex: 'receiveTime',
  },
  {
    title: '复审日期',
    dataIndex: 'reviewDate',
  },
  {
    title: '有效期限',
    dataIndex: 'termValidityStart',
    render: (item, record) => {
      return `${record.termValidityStart || ''} ~ ${record.termValidityEnd || ''}`;
    },
  },
  {
    title: '证件类型',
    dataIndex: 'certTypeName',
  },
  {
    title: '证件状态',
    dataIndex: 'certStatusName',
  },
];

const handleFile = (list) => {
  let res = [];
  if (list) {
    res = list.map((item) => {
      return {
        uid: item.id,
        name: item.attaName,
        status: 'done',
        url: item.attaSrc,
      };
    });
  }
  return res;
};

const Certificate = (props) => {
  const { itemData, certStatus, certType, token, certStatusOption, certTypeOption, freshData } =
    props;

  // console.log('[props ] >',props)
  const childRef = useRef();

  const [title, setTitle] = useState('');
  const [visible, setVisible] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});

  const fieldsName = {
    businessTelecomNumber: '电信工号',
    certNum: '证件号',
    certType: '证件类型',
    deleteFlag: '删除状态',
    jobClass: '作业类别',
    label: '标签名称',
    operationItem: '准操项目',
    post: '岗位',
    receiveTime: '初领日期',
    reviewDate: '复审日期',
    status: '证件状态',
    termValidityEnd: '有效期-截止日',
    termValidityStart: '有效期-开始日',
    ossUrlFront: '证件照片地址-正面',
    ossUrlBack: '证件照片地址-反面',
  };

  const editRow = (titleTxt) => {
    setTitle(titleTxt);
    childRef.current.showCertTypeOption(certTypeOption);
    childRef.current.showCertStatusOption(certStatusOption);
    childRef.current.showToken(token);
    const file = itemData.attaInfos.map((item) => {
      return {
        uid: item.id,
        name: item.attaName,
        src: item.attaSrc,
        status: 'done',
        thumbUrl: item.attaSrc,
      };
    });
    childRef.current.showFileList(file);
    setDefaultValues({
      ...itemData.certInfo,
      ...{ termValidity: [itemData.certInfo.termValidityStart, itemData.certInfo.termValidityEnd] },
    });
    setVisible(true);
  };

  const handleRecord = (list) => {
    const lists = list || [];
    return lists.map((item) => {
      const oldInfo = JSON.parse(item.oldInfo);
      const newInfo = JSON.parse(item.newInfo);
      const arr = [];
      item.differenceInfo.split(',').map((element) => {
        let obj = {};
        switch (element) {
          case 'status':
            obj = {
              name: fieldsName[element],
              oldField: certStatus[oldInfo[element]],
              newField: certStatus[newInfo[element]],
            };
            break;
          case 'certType':
            obj = {
              name: fieldsName[element],
              oldField: certType[oldInfo[element]],
              newField: certType[newInfo[element]],
            };
            break;
          default:
            obj = {
              name: fieldsName[element],
              oldField: oldInfo[element],
              newField: newInfo[element],
            };
            break;
        }
        arr.push(`《${obj.name}》:旧值为『${obj.oldField||''}』,新值为『${obj.newField||''}』`);
      });

      return {
        createUserName: item.createUserName,
        createTime: item.createTime,
        fields: arr,
      };
    });
  };

  // 保存
  const handleOk = async (values) => {
    const res = await editCertInfo(values);
    if (res.code === 200) {
      message.success('保存成功!');
      setVisible(false);
      // 刷新页面数据
      freshData();
    } else {
      message.warning(res.msg);
    }
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues({});
  };

  return (
    <div>
      <CardDetail
        isCenter
        title="证件信息"
        data={itemData ? itemData.certInfo : null}
        titleRightRender={
          <Button key="add" onClick={() => editRow('编辑')} icon={<EditOutlined />} type="primary">
            编辑
          </Button>
        }
        cloumns={basicInfo}
      />

      <CardDetail isCenter title="证件照片" />
      <div className={styles.picList}>
        <Upload
          listType="picture-card"
          accept="image/*"
          fileList={handleFile(itemData ? itemData.attaInfos : [])}
          showUploadList={{ showRemoveIcon: false }}
        ></Upload>
      </div>
      <CardDetail isCenter title="变更日志" />
      <div className={styles.picList}>
        <Timeline className={styles.linep}>
          {handleRecord(itemData && itemData.recordList).map((item, index) => {
            return (
              <Timeline.Item color="green" key={index}>
                <p>修改了{item.fields.join(' / ')}</p>
                <p>{item.createUserName}</p>
                <p>{item.createTime}</p>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
      <Edit
        title={title}
        childRef={childRef}
        visible={visible}
        handleCancel={handleCancel}
        handleOk={handleOk}
        defaultValues={defaultValues}
      />
    </div>
  );
};

export default (props) => {
  return (
    <>
      <Certificate {...props} />
    </>
  );
};
