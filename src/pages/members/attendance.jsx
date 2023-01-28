import React, { useEffect, useState } from 'react';
import ComContainer from '@/components/ComContainer';
import PageHeader from '@/components/PageHeader';
import ProTable from '@ant-design/pro-table';
import { loadDictionaryValue } from '@/services/global';
import { attendanceList } from '@/services/attendance';

const Attendance = (props) => {
  const { location } = props;
  const [vacationTypeObj, setVacationTypeObj] = useState({});

  useEffect(() => {
    // 获取字典
    loadDictionaryValue('HROB_VACATION_TYPE')
      .then((res) => {
        if (res.code === 200) {
          const obj = {};
          res.data.map((item) => {
            obj[item.value] = item.label;
          });
          setVacationTypeObj(obj);
        }
      })
      .catch((err) => {
        console.log('获取字典失败', err);
      });
  }, []);

  const vacationStatusObj = { 0: '待休', 1: '休假中', 2: '到期待销假', 3: '已销假' };

  const columns = [
    {
      title: '假勤类型',
      dataIndex: 'vacationType',
      valueType: 'select',
      valueEnum: vacationTypeObj,
    },
    {
      title: '开始时间',
      dataIndex: 'vacationStartTime',
      valueType: 'text',
      render: (text, record) => {
        return record.vacationStartTime ? record.vacationStartTime.substring(0, 10) : '';
      },
    },
    {
      title: '结束时间',
      dataIndex: 'vacationEndTime',
      valueType: 'text',
      render: (text, record) => {
        return record.vacationEndTime ? record.vacationEndTime.substring(0, 10) : '';
      },
    },
    {
      title: '假勤时长',
      dataIndex: 'vacationDuration',
      valueType: 'text',
      render: (text, record) => {
        return record.vacationDuration ? `${record.vacationDuration}h` : '';
      },
    },
    {
      title: '假勤状态',
      dataIndex: 'vacationStatus',
      valueType: 'select',
      valueEnum: vacationStatusObj,
      render: (text, record) => {
        return vacationStatusObj[record.vacationStatus];
      },
    },
    {
      title: '实际结束时间',
      dataIndex: 'acturalVacationEndTime',
      valueType: 'text',
      render: (text, record) => {
        return record.acturalVacationEndTime ? record.acturalVacationEndTime.substring(0, 10) : '';
      },
    },
  ];

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params, ...{ empIdcard: location.query.empIdcard } };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    return attendanceList(query).then((res) => {
      let records = [];
      let totalAll = 0;
      if (res.code === 200) {
        const dataRes = res.data;
        if (dataRes) {
          records = dataRes.records;
          totalAll = dataRes.total;
        } else {
          totalAll = 0;
        }
      }
      return { data: records, total: totalAll };
    });
  };

  return (
    <div>
      <ComContainer>
        <PageHeader title="假勤信息" hideDivider={true}>
          <ProTable
            rowClassName="gesture"
            search={false}
            rowKey="id"
            columns={columns}
            options={false}
            request={(params) => requestList(params)}
            pagination={{ 
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
             }}
          />
        </PageHeader>
      </ComContainer>
    </div>
  );
};

export default (props) => {
  return (
    <>
      <Attendance {...props} />
    </>
  );
};
