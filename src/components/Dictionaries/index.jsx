import React, { useState, useEffect } from 'react';
import { loadDictionaryValue, filterMultiDictText } from '@/services/global';

// 字典查询封装

const Dictionaries = props => {

    const { children, // 需要显示的key
        type, // 显示字典类型
        matchData, // 可以认为是本地字典数据，防止列表多次请求相同数据
        defaultValue = '-'
    } = props;

    const [name, setName] = useState(defaultValue);

    useEffect(() => {
        text();
    }, [children, matchData])

    function text() {
        if (children && type) {
            if (type === 'local' && matchData) {
                setName(matchData[children] || defaultValue);
            } else {
                loadDictionaryValue(type).then(res => {
                    if (res.code === 200) {
                        setName(filterMultiDictText(res.data || [])[children] || defaultValue);
                    }
                })
            }
        }
    }

    return (<>{name}</>)
}

export default Dictionaries;
