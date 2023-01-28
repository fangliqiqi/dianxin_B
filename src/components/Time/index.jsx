import React from 'react';
import moment from 'moment';

const Time = props => {

    const { children, type, className } = props;

    const text = () => {
        return moment(children, "YYYYMMDDhhmmss").format(type || "YYYYMMDD");
    }

    return <span className={className}>{(children)?text():'-'}</span>
}

export default Time;
