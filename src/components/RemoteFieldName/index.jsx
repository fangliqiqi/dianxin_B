import React, { useState, useEffect } from 'react';

const FieldName = (props) => {
  const { remote, allList, value, id, fieldName, field, defaultValue = '-', flag } = props;

  const [name, setName] = useState(defaultValue);

  const text = async () => {
    if (value) {
      if (allList) {
        const res = allList.find((item) => String(item[id]) === String(value));
        setName(res ? res[fieldName] : defaultValue);
      } else {
        // 请求远程数据
        const res = await remote();
        if (res.code === 200) {
          if (field === 'employeeTags') {
            const arr = value.split(',').map((item) => {
              const temp = res.data.find((elent) => Number(elent.id) === Number(item));
              return temp ? temp.name : defaultValue;
            });
            setName(arr.join(','));
          }
        }
      }
    }
  };

  useEffect(() => {
    text();
  }, [value]);

  return <>{name}</>;
};

export default FieldName;
