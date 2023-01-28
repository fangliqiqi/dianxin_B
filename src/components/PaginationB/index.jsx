import React from 'react';
import styles from './style.less';
import { Pagination } from 'antd';
import classnames from 'classnames';

const PaginationB = (props) => {

    const {
        title,// 总数描述
        current, // 当前选中的页面
        pageSize,  // 一页选择的条数
        total, // 数据总量
        onChange, // 分页器变化
        actionRef,// table刷新监听器
        className
    } = props;


    return (<div className={classnames(styles.paginationContainer, className)}>
           <div className={styles.title}>共 {total} 条{title}数据</div>
        {
            // (total > pageSize) ?
                <Pagination
                    total={total}
                    current={current}
                    showSizeChanger={true}
                    showLessItems={true}
                    hideOnSinglePage={true}
                    pageSize={pageSize}
                    onChange={(page, size) => {

                        if (onChange && size === pageSize) { // 非切换分页数量触发
                            onChange(page, size);
                        }

                        if (actionRef && actionRef.current) { // 刷新列表
                            actionRef.current.reload();
                        }

                    }}
                    onShowSizeChange={(_, size) => {
                        if (onChange) {
                            onChange(1, size);
                        }
                        if (actionRef && actionRef.current) { // 刷新列表
                            actionRef.current.reload();
                        }
                    }}
                />
                // : <div />
        }
    </div>)

}

export default PaginationB;
