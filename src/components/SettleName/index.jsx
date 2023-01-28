import React, { useEffect, useState } from 'react';
import { tsettledomain } from '@/services/global';

const SettleName = props => {

    const { id, args, net = false } = props;
    const [name, setName] = useState('-');

    useEffect(() => {
        text();
    }, [])

    const text = () => {

        if (args) {
            args.forEach(element => {
                if (element.id === id) {
                    setName(element.departName || '-')
                }
            });
        }

        if (net && id) {
            tsettledomain(id).then(res => {
                if (res.code === 200 && res.data) {
                    setName(res.data.departName || '-')
                }
            })
        }
    }

    return <>{name}</>
}

export default SettleName;
