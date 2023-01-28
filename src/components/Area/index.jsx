import React, { useEffect, useState } from 'react';
import { getArea } from '@/services/members';
// 将地区码转成文本
const Area = (props) => {
  const { children } = props;
  const [name, setName] = useState('-');

  useEffect(() => {
    if (children) {
      // console.log('[children ] >',children)
      // 如果有值再处理
      getArea(children)
        .then((res) => {
          if (res.code === 200) {
            setName(res.data.areaName);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return <>{name}</>;
};

export default Area;
