import React, {useEffect, useState} from 'react';
import {message, Modal} from "antd";
import {ProTable} from "@ant-design/pro-components";
import loginPolicyApi from "../../../api/login-policy";

const actionRef = React.createRef();

const UserLoginPolicyBind = ({open, userId, handleOk, handleCancel}) => {

    let [bindKeys, setBindKeys] = useState([]);

    useEffect(() => {
        const x = async () => {
            if (!open || !userId) {
                return;
            }
            // 获取该用户已绑定的策略，需要逐个策略查询绑定的用户ID
            let items = [];
            let page = {pageIndex: 1, pageSize: 1000};
            let result = await loginPolicyApi.getPaging(page);
            items = result['items'] || [];
            let boundIds = [];
            for (let policy of items) {
                let userIds = await loginPolicyApi.GetUserIdByLoginPolicyId(policy['id']);
                if (userIds.includes(userId)) {
                    boundIds.push(policy['id']);
                }
            }
            setBindKeys(boundIds);
        }
        x();
    }, [open]);

    const handleBind = async (record) => {
        let success;
        if (bindKeys.includes(record['id'])) {
            success = await loginPolicyApi.Unbind(record['id'], [{'userId': userId}]);
            if (success) {
                message.success('解绑成功');
            } else {
                message.error('解绑失败');
                return;
            }
            setBindKeys(bindKeys.filter(id => id !== record['id']));
        } else {
            success = await loginPolicyApi.Bind(record['id'], [{'userId': userId}]);
            if (success) {
                message.success('绑定成功');
            } else {
                message.error('绑定失败');
                return;
            }
            setBindKeys([...bindKeys, record['id']]);
        }
        actionRef.current.reload();
    }

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: 'IP列表',
            key: 'ipGroup',
            dataIndex: 'ipGroup',
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '优先级',
            key: 'priority',
            dataIndex: 'priority',
            hideInSearch: true,
        },
        {
            title: '动作',
            key: 'rule',
            dataIndex: 'rule',
            hideInSearch: true,
            render: (text => {
                if (text === 'allow') {
                    return '允许';
                } else {
                    return '拒绝';
                }
            })
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="bind"
                    onClick={() => {
                        handleBind(record);
                    }}
                >
                    {bindKeys.includes(record['id']) ? '解绑' : '绑定'}
                </a>,
            ],
        },
    ];

    return (
        <div>
            <Modal
                title={'绑定登录策略'}
                open={open}
                width={window.innerWidth * 0.8}
                footer={null}
                onCancel={handleCancel}
                destroyOnHidden
            >
                <ProTable
                    columns={columns}
                    actionRef={actionRef}
                    search={false}
                    request={async (params = {}, sort, filter) => {

                        let field = '';
                        let order = '';
                        if (Object.keys(sort).length > 0) {
                            field = Object.keys(sort)[0];
                            order = Object.values(sort)[0];
                        }

                        let queryParams = {
                            pageIndex: params.current,
                            pageSize: params.pageSize,
                            name: params.name,
                            field: field,
                            order: order
                        }
                        let result = await loginPolicyApi.getPaging(queryParams);
                        return {
                            data: result['items'],
                            success: true,
                            total: result['total']
                        };
                    }}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle="登录策略列表"
                />
            </Modal>
        </div>
    );
};

export default UserLoginPolicyBind;
