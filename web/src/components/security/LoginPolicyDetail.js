import React, {useState} from 'react';
import {Tabs} from "antd";
import {useParams, useSearchParams} from "react-router-dom";
import LoginPolicyInfo from "./LoginPolicyInfo";
import LoginPolicyUser from "./LoginPolicyUser";
import LoginPolicyUserGroup from "./LoginPolicyUserGroup";


const LoginPolicyDetail = () => {
    let params = useParams();
    const loginPolicyId = params['loginPolicyId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    return (
        <div className="page-detail-warp">
            <Tabs activeKey={activeKey} onChange={handleTagChange}
items={[
                    {key: 'info', label: '基本信息', children: (<LoginPolicyInfo active={activeKey === 'info'} id={loginPolicyId}/>)},
                    {key: 'bind-user', label: '绑定用户', children: (<LoginPolicyUser active={activeKey === 'bind-user'} loginPolicyId={loginPolicyId}/>)},
                    {key: 'bind-user-group', label: '绑定用户组', children: (<LoginPolicyUserGroup active={activeKey === 'bind-user-group'} loginPolicyId={loginPolicyId}/>)}
                ]}>
            </Tabs>
        </div>
    );
};

export default LoginPolicyDetail;