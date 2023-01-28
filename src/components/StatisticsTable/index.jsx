import React from 'react';
import Digital from './Digital';
import classnames from 'classnames';
import styles from './style.less';
import { Spin } from 'antd';

const Statistics = (props) => {

    const {
        datas, select, dark, className,
        spinning = false // 加载动画，默认不加载
    } = props;

    return (
        <Spin spinning={spinning}>
            <div className={classnames(styles.statisticsContainer, (dark) ? styles.dark : null, className)}>

                {
                    (datas) ?
                        datas.map((element, index) => {
                            return <Digital
                                key={index}
                                key={element.title}
                                title={element.title} // 标题
                                value={element.value} // 内容
                                tip={element.tip} // 鼠标悬浮提示
                                icon={element.icon} // 标题右边图标或其他内容
                                divider={element.divider} // 右边分割线
                                onClick={element.onClick} // 点击事件
                                select={select === index} // 是否选中
                            />
                        })
                        : null
                }
            </div>
        </Spin>
    );
};

export default Statistics;
