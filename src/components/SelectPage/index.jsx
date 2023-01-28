import React, { useEffect, useState, useImperativeHandle } from 'react';
import { Select, Divider, Pagination } from 'antd';
import { debounce } from '@/utils/utils';

const SettlePage = (props) => {
  const { Option } = Select;
  const {
    selectProps,
    value,
    resList,
    onChange: change,
    getData: getRemoteData,
    labeltitle,
    labelvalue,
    childRef,
  } = props;

  const [selectArray, setSelectArray] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({}); // 查询参数

  const getDatas = (params) => {
    getRemoteData(params)
      .then((res) => {
        if (res.code === 200 && res.data) {
          // console.log('[res.data ] >',res.data)
          setSelectArray(res.data.records);
          setTotal(res.data.total);
        } else {
          setSelectArray([]);
          setTotal(0);
        }
      })
      .catch((err) => {
        console.log('[ err ] >', err);
      });
  };
  useEffect(() => {
    if (resList && resList.length) {
      setSelectArray(resList);
    } else {
      getDatas();
    }
  }, []);

  useImperativeHandle(childRef, () => ({
    // changeVal 就是暴露给父组件的方法
    changeOption: (val) => {
      if (!val) {
        setQuery({});
        getDatas({ current: 1, size: 10 });
      }
    },
  }));

  const changePage = (page, pageSize) => {
    getDatas({ current: page, size: pageSize, ...query });
  };

  // 搜索查询
  const selectSearch = (val) => {
    const obj = {};
    obj[labeltitle] = val;
    setQuery(obj);
    getDatas(obj);
  };
  // 清除输入框数据
  const clear = () => {
    getDatas({});
  };

  return (
    <>
      <Select
        onChange={change}
        value={value}
        onClear={clear}
        onSearch={(val) => debounce(selectSearch, 500, val)}
        {...selectProps}
        dropdownRender={(menu) => (
          <div>
            {menu}
            {total ? <Divider style={{ margin: '4px 0' }} /> : null}
            <div style={{ textAlign: 'center' }}>
              <Pagination
                size="small"
                showSizeChanger={false}
                total={total}
                onChange={changePage}
                hideOnSinglePage={true}
              />
            </div>
          </div>
        )}
      >
        {selectArray&&selectArray.map((item) => (
          <Option key={item[labelvalue]} value={item[labelvalue]} item={item}>
            {item[labeltitle]}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SettlePage;
