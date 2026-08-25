import React, {useState} from 'react';
import {Tabs} from "antd";
import UserInfo from "./UserInfo";
import UserLoginPolicy from "./UserLoginPolicy";
import UserAsset from "./UserAsset";
import {useParams, useSearchParams} from "react-router-dom";
import {hasMenu} from "../../../service/permission";
import AssetUser from "../../asset/AssetUser";

const UserDetail = () => {

    let params = useParams();
    const id = params['userId'];
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
                      ...(hasMenu('user-detail') ? [{key: 'info', label: '基本信息',
                          children: (<UserInfo active={activeKey === 'info'} userId={id}/>)}] : []),
                      ...(hasMenu('user-authorised-asset') ? [{key: 'asset', label: '授权的资产',
                          children: (<UserAsset active={activeKey === 'asset'} id={id} type={'userId'}/>)}] : []),
                      ...(hasMenu('user-login-policy') ? [{key: 'login-policy', label: '登录策略',
                          children: (<UserLoginPolicy active={activeKey === 'login-policy'} userId={id}/>)}] : []),
                  ]}>
              </Tabs>
        </div>
    );
}

export default UserDetail;