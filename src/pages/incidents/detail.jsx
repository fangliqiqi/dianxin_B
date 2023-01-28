import React, { useEffect, useState } from 'react';
import CardDetail from '@/components/CardDetail';
import { loadDictionaryValue, filterMultiDictText } from '@/services/global';
import { loadIncidentsDetail } from '@/services/incidents';
import Time from '@/components/Time';

const Detail = props => {
  const { location } = props;
  const pageType = Number(location.query.emergencyType); // 页面类型（0: '工伤事故', 1: '非因公事故', 2: '退工', 3: '劳动仲裁', 4: '诉讼争议'）
  const statusStr = location.query.statusStr; // 办理状态

  const [eventData, setEventData] = useState({}); // 网络请求的事件详情数据
  const [detailData, setDetailData] = useState({}) // 不同突发事件的页面显示详情
  const [treatmentType, setTreatmentType] = useState({}); // 设置治疗类型
  const [eventType, setEventType] = useState({}); // 事故类型
  const typeToTitle = {
    0: '工伤事故', 1: '非因公事故', 2: '退工', 3: '劳动仲裁', 4: '诉讼争议'
  };// 标题显示

  useEffect(() => {
    if (pageType === 0 || pageType === 1) { // 工伤、非因工
      // 事故类型
      loadDictionaryValue('emergency_event_type').then(res => {
        setEventType(filterMultiDictText(res.data));
      });
      // 治疗类型
      loadDictionaryValue('treatment_type').then(res => {
        setTreatmentType(filterMultiDictText(res.data));
      });
    } else if (pageType === 2) { // 退工
      loadDictionaryValue('retired_type').then(res => {
        setEventType(filterMultiDictText(res.data));
      }); // 退工事件类别
    }

    // 不同类型，取返回数据的不同对象（各个类型对应的对象名）
    const eventTypeOfObject = {
      0: 'workInjuryEvent', 1: 'nonWorkEvent', 2: 'retiredWorkEvent', 3: 'abitrationEvent', 4: 'litigationEvent'
    };
    // 获取详情数据
    loadIncidentsDetail({ emergencyType: pageType, id: location.query.id }).then(res => {
      if (Number(res.code) === 200) {
        if (res.data) {
          setEventData(res.data);
          const type = Number(pageType);
          const key = eventTypeOfObject[type];
          const resultData = key ? res.data[key] : {};
          setDetailData(resultData);
        }
      }
    });
  }, []);


  // 工伤事故/非因工事故
  const workInjuryCloumns = [
    {
      title: '事故类型',
      dataIndex: 'eventType',
      valueEnum: eventType,
    },
    {
      title: '伤害部位',
      dataIndex: 'injuryPosition',
      render: (_, record) => {
        return (record.injuryPosition || '') + (record.injuredArea || '')
      }
    },
    {
      title: '发生日期',
      dataIndex: 'eventOccurrenceTime',
      render: (text, record) => {
        return <Time type="YYYY.MM.DD">{record.eventOccurrenceTime}</Time>;
      }
    },
    {
      title: '发生地点',
      dataIndex: 'eventOccurrenceAddr',
    },
    {
      title: '治疗类型',
      dataIndex: 'curingType',
      valueEnum: treatmentType,
    },
    {
      title: '就诊医院',
      dataIndex: 'curingHospital',
    },
    {
      title: '评定结果',
      dataIndex: 'disabilityLevel',
    },
    {
      title: '商业保险',
      dataIndex: 'insuranceStr',
      render: () => {
        const list = (eventData.insurance && Array.isArray(eventData.insurance)) ? eventData.insurance : []
        const resultList = [];
        list.forEach(item => {
          const text = `医疗额度${item.medicalMoney},身故或残疾${item.deathDisabilityMoney}`;
          resultList.push(text);
        })
        return resultList.length ? resultList.join(' / ') : '未购买';
      }
    },
    {
      title: '事发经过',
      dataIndex: 'eventThrough',
      desc: true,
    },
    {
      title: '赔付方案',
      dataIndex: 'payPlan',
      desc: true,
    },
  ];

  // 退工
  const nonWorkCloumns = [
    {
      title: '事故类型',
      dataIndex: 'eventType',
      valueEnum: eventType,
    },
    {
      title: '发生时间',
      dataIndex: 'eventOccurrenceTime',
      render: (text, record) => {
        return <Time type="YYYY.MM.DD">{record.eventOccurrenceTime}</Time>;
      }
    },
    {
      title: '事件说明',
      dataIndex: 'eventThrough',
      desc: true,
    },
    {
      title: '赔付方案',
      dataIndex: 'payPlan',
      desc: true,
    },
    {
      title: '客户意见',
      dataIndex: 'customerOpinion',
      desc: true,
    },
  ];

  // 劳动仲裁
  const laborCloumns = [
    {
      title: '仲裁时间',
      dataIndex: 'eventOccurrenceTime',
      render: (text, record) => {
        return <Time type="YYYY.MM.DD">{record.eventOccurrenceTime}</Time>;
      }
    },
    {
      title: '仲裁委员会',
      dataIndex: 'eventOccurrenceAddr',
    },
    {
      title: '事件说明',
      dataIndex: 'eventThrough',
      desc: true,
    },
  ];

  // 诉讼争议
  const litigationCloumns = [
    {
      title: '诉讼时间',
      dataIndex: 'eventOccurrenceTime',
      render: (text, record) => {
        return <Time type="YYYY.MM.DD">{record.eventOccurrenceTime}</Time>;
      }
    },
    {
      title: '法院',
      dataIndex: 'eventOccurrenceAddr',
    },
    {
      title: '原告诉求',
      dataIndex: 'eventThrough',
      desc: true,
    },
  ];

  // 根据状态返回颜色值
  const colorWithStatus = (status) => {
    status = parseInt(status);
    if (status === 7) {
     return '#1aad19';
    } else if (status === 5) {
      return '#FFBA12';
    } else if (status === 3) {
      return '#969696';
    } else {
      return '#2E77F3';
    }
  };

  // 根据页面类型返回不同的工伤事件详情
  const returnCloumns = (pageType) => {
    switch (Number(pageType)) {
      case 0: return workInjuryCloumns;
      case 1: return workInjuryCloumns;
      case 2: return nonWorkCloumns;
      case 3: return laborCloumns;
      case 4: return litigationCloumns;
      default: return [];
    }
  };
  return (
    <React.Fragment>
      <CardDetail
        title={typeToTitle[pageType]}
        status={statusStr}
        statusColor={colorWithStatus(detailData.auditStatus)}
        data={{ ...detailData }}
        cloumns={returnCloumns(pageType)} />
    </React.Fragment>
  )
}
export default Detail
