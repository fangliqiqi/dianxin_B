import React from 'react';

const TypeOfContractToText = props => {

    const { children } = props;

    const text = () => {

        if (children === 0 || children === "0") {
            return "已完成一定工作任务为期限";
        }

        if (children === 1 || children === "1") {
            return "固定期限";
        }

        if (children === 2 || children === "2") {
            return "无固定期限";
        }

        return "-"
    }


    return (<>{text()}</>);
}

export default TypeOfContractToText;
