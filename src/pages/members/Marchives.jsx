import React, { useEffect, useState } from 'react';
import CardDetail from '@/components/CardDetail';
import styles from './index.less';
import { WarningFilled } from '@ant-design/icons';
import { getEmployeeBusinessInfoById } from '@/services/members';
import { Table } from 'antd';
import TypeOfContractToText from '@/components/TypeOfContractToText';
import Dictionanes from '@/components/Dictionaries';
import RemoteFieldName from '@/components/RemoteFieldName';
import { getAllTags } from '@/services/tags';
import { getBusAttaList } from '@/services/settlement';
import moment from 'moment';
// import SettleName from '@/components/SettleName';

// 基本信息
const basicInfo = [
  {
    title: '电信工号',
    dataIndex: 'businessTelecomNumber',
  },
  {
    title: '姓名',
    dataIndex: 'empName',
  },
  {
    title: '身份证号',
    dataIndex: 'empIdcard',
  },
  {
    title: '性别',
    dataIndex: 'empSex',
    valueEnum: {
      1: '男',
      2: '女',
    },
  },
  {
    title: '出生日期',
    dataIndex: 'empBirthday',
  },
  {
    title: '民族',
    dataIndex: 'empNational',
    render: (item) => <Dictionanes type="emp_national">{item}</Dictionanes>,
  },
  {
    title: '户口类型',
    dataIndex: 'empRegisType',
    render: (item) => <Dictionanes type="emp_registype">{item}</Dictionanes>,
  },
  {
    title: '第一学历及专业',
    dataIndex: 'firstDegreeAndMajor',
  },
  {
    title: '第一学历院校',
    dataIndex: 'firstDegreeGraduateSchool',
  },
  {
    title: '最高学历及专业',
    dataIndex: 'highestDegreeAndMajor',
  },
  {
    title: '最高学历院校',
    dataIndex: 'highestDegreeGraduateSchool',
  },
  {
    title: '学信网截图',
    dataIndex: 'fileList',
  },
  {
    title: '联系方式',
    dataIndex: 'contactInfo',
  },
  {
    title: '档案托管地',
    dataIndex: 'archivesAddr',
  },

  {
    title: '工资卡号',
    dataIndex: 'empBankNo',
  },
  {
    title: '工资卡开户行',
    dataIndex: 'empBankName',
  },
  {
    title: '标签名称',
    dataIndex: 'employeeTags',
    render: (item) => (
      <RemoteFieldName remote={getAllTags} field="employeeTags" value={item}></RemoteFieldName>
    ),
  },
];

// 岗位信息
const jobInfo = [
  {
    title: '所属部门',
    dataIndex: 'departName',
  },
  {
    title: '岗位',
    dataIndex: 'businessPost',
  },
  {
    title: '入职日期',
    dataIndex: 'businessEnjoinDate',
  },
  {
    title: '工时制度',
    dataIndex: 'workingHours',
    valueEnum: {
      1: '标准工时',
      2: '综合工时',
      3: '不定时工时制',
      4: '其他',
    },
  },
  {
    title: '劳动合同开始日期',
    dataIndex: 'contractStartDate',
  },
  {
    title: '劳动合同结束日期',
    dataIndex: 'contractEndDate',
  },
  {
    title: '新签/续签',
    dataIndex: 'situation',
  },
  {
    title: '累计请签约次数',
    dataIndex: 'situationCount',
  },

  // {
  //     title: '业务项目',
  //     dataIndex: 'settleDomain',
  //     render: (text) => <SettleName net={true}>{text}</SettleName>,
  // },
  // {
  //     title: '岗位',
  //     dataIndex: 'post',
  // },
];

// 离职信息
const leaveInfo = [
  {
    title: '离职日期',
    dataIndex: 'businessLeaveDate',
  },
  {
    title: '社保停缴月份',
    dataIndex: 'socialReduceDate',
  },
  {
    title: '离职原因',
    dataIndex: 'leaveReason',
    // render: (item) => <Dictionanes type="reduce_reason">{item}</Dictionanes>
  },
  {
    title: '公积金停缴月份',
    dataIndex: 'fundReduceDate',
  },
  // {
  //     title: '离职备注',
  //     dataIndex: 'leaveRemark',
  // }
];

// 表格数据
const tableColumns = [
  {
    title: '合同主体单位',
    dataIndex: 'subjectUnit',
    key: 'subjectUnit',
  },
  {
    title: '合同性质',
    dataIndex: 'contractName',
    key: 'contractName',
    align: 'center',
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    key: 'contractType',
    align: 'center',
    render: (text) => <TypeOfContractToText>{text}</TypeOfContractToText>,
  },
  {
    title: '合同开始日期',
    dataIndex: 'contractStart',
    key: 'contractStart',
    align: 'center',
    render: (text) => <>{text ? moment(text).format('YYYY-MM-DD') : ''}</>,
  },
  {
    title: '合同结束日期',
    dataIndex: 'contractEnd',
    key: 'contractEnd',
    align: 'center',
    render: (text) => <>{text ? moment(text).format('YYYY-MM-DD') : ''}</>,
  },
  {
    title: '合同年限',
    dataIndex: 'contractTerm',
    key: 'contractTerm',
    align: 'center',
  },
  {
    title: '签订情况',
    dataIndex: 'situation',
    key: 'situation',
    align: 'center',
  },
];

const Marchives = (props) => {
  // console.log(props);
  const { location } = props;
  const [data, setData] = useState({});
  const [endTime, setEndTime] = useState(null); // 合同剩余时间
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setSpinning(true);
    const res1 = await getEmployeeBusinessInfoById({
      id: location.query.id,
      settleDomain: location.query.settleDomain,
    });
    const res2 = await getBusAttaList({ relationId: location.query.id });

    if (res1.code === 200) {
      const d = res1.data.employeeBusinessVo;
      d.leaveDate = (d.leaveDate || '').split(' ')[0];
      d.empBirthday = (d.empBirthday || '').split(' ')[0];
      res1.data.fileList = [];
      if (res2.code === 200) {
        res1.data.fileList = res2.data.map((item) => {
          return {
            uid: item.id,
            name: item.attaName,
            status: 'done',
            url: item.attaSrc,
          };
        });
      }
      setData({ ...d, ...res1.data });
      setEndTime(res1.data.contractOverdue);
    }

    setSpinning(false);
  };

  return (
    <div className={styles.archivesContainer}>
      {endTime && (
        <div className={styles.warn}>
          <WarningFilled style={{ color: '#FF6E4C' }} />
          <div style={{ marginLeft: '12px' }}>劳动合同即将到期，还剩{endTime}天</div>
        </div>
      )}
      <CardDetail isCenter title="基本信息" spinning={spinning} data={data} cloumns={basicInfo} />

      <CardDetail isCenter title="岗位信息" spinning={spinning} data={data} cloumns={jobInfo}>
        {data.contractInfoList && (
          <Table
            className="lizhiTable"
            rowKey="id"
            style={{ margin: '34px 0 20px' }}
            pagination={false}
            dataSource={data.contractInfoList}
            columns={tableColumns}
          />
        )}
      </CardDetail>

      <CardDetail isCenter title="离职信息" spinning={spinning} data={data} cloumns={leaveInfo} />
    </div>
  );
};

export default (props) => {
  return (
    <>
      <Marchives {...props} />
    </>
  );
};
