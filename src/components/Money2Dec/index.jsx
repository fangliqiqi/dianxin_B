import React from 'react';

const Money2Dec = props => {

    const { children } = props

    function numberFormat(number) {
        return number.toFixed(2); // 将数字返回两位数小数
    }

    const text = () => {

        if (children === ' ') {
            return ' '
        }

        if (Number.isFinite(children)) { // 如果是有穷数字
            return numberFormat(children);
        }

        if (children) {
            const value = Number(children);
            if (Number.isFinite(value)) {
                return numberFormat(value);
            } else {
                return children; // 原样输出
            }
        }
        return '-';
    }

    return <>{text()}</>
}

export default Money2Dec;
