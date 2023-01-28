
import { Tooltip } from 'antd';
import React from 'react';

const Ellipsis = props => {

  const { title,length = 10 } = props;

  const elipsis = (text) => {
    let res = text;
    if(text && text.length > length){
      res = `${text.substring(0,length)}...`;
    }
    return res;
  }
  const renderHtml = (text) => {
    return (text && text.length <= length) ? text : (
      <Tooltip title={title}>
        <span>{elipsis(title)}</span>
      </Tooltip>
    )
  }
  return (
    renderHtml(title)
  );
};

export default Ellipsis;
