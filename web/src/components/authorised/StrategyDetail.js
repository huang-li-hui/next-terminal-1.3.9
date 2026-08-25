import React, {useState} from 'react';
import {useParams, useSearchParams} from "react-router-dom";
import {Layout, Tabs} from "antd";
import StrategyInfo from "./StrategyInfo";

const StrategyDetail = () => {
    let params = useParams();
    const id = params['strategyId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    return (
        <div>
            <Layout.Content className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange}
items={[
                        {key: 'info', label: '基本信息', children: (<StrategyInfo active={activeKey === 'info'} id={id}/>)}
                    ]}>
                </Tabs>
            </Layout.Content>
        </div>
    );
};

export default StrategyDetail;