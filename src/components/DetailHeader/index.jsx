import React from 'react';
import styles from './styles.less';
import classnames from 'classnames';
import { history } from 'umi';
import IconFont from '@/components/IconFont';

const DetailHeader = props => {
    const { children, title,backUrl} = props;

    const backBtnClick = ()=>{
        if(backUrl){
            history.push('/employeeManage/employeeList');
        }else{
            history.goBack();
        }
    };

    return (
        <div className={styles.container}>
            <div className={classnames(styles.headerContent, styles.shadow)}>
                <div className={styles.header}>

                    <div className={styles.btnBack} onClick={backBtnClick}>
                    <IconFont  type="iconxiangzuo_icon" style={{fontSize:"12px",color:'#646464',marginRight:'3px'}}/>
                    返回
                    </div>

                    <h2 className={styles.pageTitle}>{title}</h2>
                </div>
                {children}
            </div>
        </div>
    )
}
export default DetailHeader;
