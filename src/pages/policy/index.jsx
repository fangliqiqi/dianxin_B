import React, { useState, useRef, useEffect } from 'react';
import { history, KeepAlive, connect } from 'umi';
import { message, Button, Divider } from 'antd';
import ProTable from '@ant-design/pro-table';
import { loadPolicyList, deletePolicy } from '@/services/policy';
import styles from './index.less';
import moment from 'moment';
import Dialog from '@/components/DialogModal';
import Pagination from '@/components/PaginationB';
import IconFont from '@/components/IconFont';

const PlicyList = (props) => {
  const { poliyStatus } = props; // 政策编辑或新增后，标记列表需要刷新参数
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();
  const [delVisible, setDelVisible] = useState(false); // 控制删除弹出框的显示隐藏
  const [delId, setDelId] = useState(null); // 设置删除id

  useEffect(() => {
    if (actionRef.current) {
      // 监听政策编辑或新增后刷新列表
      actionRef.current.reload();
    }
  }, [poliyStatus]);

  // 点击添加政策
  const addPolicyBtnClick = () => {
    history.push({
      pathname: '/policy/edit',
      query: {
        pageType: 0, // 0：添加，1：编辑
      },
    });
  };

  // 点击编辑
  const editPolicyBtnClick = (e, record) => {
    // 阻止事件穿透
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    history.push({
      pathname: '/policy/edit',
      query: {
        pageType: 1, // 0：添加，1：编辑
        policyID: record.id,
      },
    });
  };

  // 点击删除
  const deletePolicyBtnClick = (e, record) => {
    // 阻止事件穿透
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setDelId(record.id); // 需要删除的政策ID
    setDelVisible(true); // 显示弹出对话框
  };

  const handleRemove = (rows) => {
    const hide = message.loading('正在删除');
    try {
      hide();

      deletePolicy(rows).then((resp) => {
        if (Number(resp.code) === 200) {
          setDelVisible(false); // 隐藏弹出对话框
          setDelId(null); // 需要删除的政策ID
          message.success('删除成功，即将刷新');
          if (actionRef.current) {
            actionRef.current.reload();
          }
        } else {
          message.error(resp.msg || '删除失败，请重试!');
        }
      });
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'title',
      ellipsis: false,
      width: '88%',
      render: (text, record, index) => {
        const month = moment(record.createTime, 'YYYY-MM-DD HH:mm:ss').format('MM.DD');
        return (
          <div className={styles.titleWrap}>
            <span className={styles.titleText}>
              <span className={styles.dateText}>{`${month} / `}</span>
              {record.title}
            </span>
          </div>
        );
      },
    },
    {
      title: '',
      valueType: 'option',
      dataIndex: 'option',
      width: '12%',
      render: (text, record, index) => [
        <a key={index} onClick={(e) => editPolicyBtnClick(e, record)}>
          编辑
        </a>,

        <Divider key={index + 'i'} type="vertical" />,

        <a
          key={index + 'j'}
          style={{ color: '#969696' }}
          onClick={(e) => deletePolicyBtnClick(e, record)}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <div className={styles.boxContainer}>
      <Button
        type="primary"
        icon={<IconFont type="iconxinjian_icon" />}
        onClick={addPolicyBtnClick}
        style={{ marginLeft: '30px' }}
      >
        添加政策
      </Button>

      <div className={styles.line}></div>

      <ProTable
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        options={false}
        search={false}
        showHeader={false}
        hideOnSinglePage={true}
        className={`policyContainer gesture`}
        pagination={false}
        request={(parameters) =>
          loadPolicyList({
            current: current,
            size: pageSize,
          }).then((res) => {
            let records = [];

            if (res.code === 200) {
              const data = res.data;
              records = data.records;
              setTotal(data.total);
              setCurrent(data.current);
              setPageSize(data.size);
            }

            return {
              data: records,
            };
          })
        }
        onRow={(record) => {
          return {
            onClick: () => {
              history.push({
                pathname: '/detail/policy/policydetail',
                query: {
                  title: record.title,
                  policyID: record.id,
                },
              });
            },
          };
        }}
      />
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        actionRef={actionRef}
        onChange={(page, pagesize) => {
          setCurrent(page);
          setPageSize(pagesize);
        }}
      />
      {delVisible ? (
        <Dialog
          desc="删除后，该政策的信息将不能恢复？"
          data={{ id: delId }}
          modalVisible={delVisible}
          onCancel={() => {
            setDelVisible(false);
          }}
          onSubmit={(value) => handleRemove(value.id)}
        />
      ) : (
        ''
      )}
    </div>
  );
};

const PlicyListPage = (props) => {
  return (
    <>
      <KeepAlive>
        <PlicyList {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(({ policyModels }) => {
  return {
    poliyStatus: policyModels && policyModels.policyChanged,
  };
})(PlicyListPage);
