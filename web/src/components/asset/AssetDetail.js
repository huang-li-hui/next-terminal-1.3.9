import React, {useState} from 'react';
import {useParams, useSearchParams} from "react-router-dom";
import {Tabs} from "antd";
import AssetInfo from "./AssetInfo";
import AssetUser from "./AssetUser";
import AssetUserGroup from "./AssetUserGroup";
import {hasMenu} from "../../service/permission";


const AssetDetail = () => {
    let params = useParams();
    const id = params['assetId'];
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
                          ...(hasMenu('asset-detail') ? [{key: 'info', label: '基本信息',
                              children: (<AssetInfo active={activeKey === 'info'} id={id}/>)}] : []),
                          ...(hasMenu('asset-authorised-user') ? [{key: 'bind-user', label: '授权的用户',
                              children: (<AssetUser active={activeKey === 'bind-user'} id={id}/>)}] : []),
                          ...(hasMenu('asset-authorised-user-group') ? [{key: 'bind-user-group', label: '授权的用户组',
                              children: (<AssetUserGroup active={activeKey === 'bind-user-group'} id={id}/>)}] : []),
                      ]}>
                  </Tabs>
        </div>
    );
};

export default AssetDetail;