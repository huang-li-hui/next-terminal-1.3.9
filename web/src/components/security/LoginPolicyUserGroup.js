import React, {useState} from 'react';
import {Button, Drawer} from "antd";
import {ProTable} from "@ant-design/pro-components";
import loginPolicyApi from "../../api/login-policy";
import userGroupApi from "../../api/user-group";
import Show from "../../dd/fi/show";

const actionRef = React.createRef();

const LoginPolicyUserGroup = ({active, loginPolicyId}) => {

    let [open, setOpen] = useState(false);

    const handleUnbind = async (userGroupId) => {
        await loginPolicyApi.UnbindUserGroup(loginPolicyId, [{'userGroupId': userGroupId}]);
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
            copyable: true,
        },
        {
            title: '创建时间',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'login-policy-bind-user-group'}>
                    <a
                        key="unbind"
                        onClick={() => {
                            handleUnbind(record['id']);
                        }}
                    >
                        解绑
                    </a>
                </Show>,
            ],
        },
    ];

    return (
        <div>
            <ProTable
                columns={columns}
                actionRef={actionRef}
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
                    let result = await loginPolicyApi.GetUserGroupPagingByLoginPolicyId(loginPolicyId, queryParams);
                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                        defaultPageSize: 10,
                    }}
                dateFormatter="string"
                headerTitle="绑定用户组列表"
                toolBarRender={() => [
                    <Show menu={'login-policy-bind-user-group'}>
                        <Button key="button" type="primary" onClick={() => {
                            setOpen(true);
                        }}>
                            绑定
                        </Button>
                    </Show>,
                ]}
            />

            <LoginPolicyUserGroupBind open={open}
                                      loginPolicyId={loginPolicyId}
                                      onClose={() => {
                                          setOpen(false);
                                          actionRef.current.reload();
                                      }}/>
        </div>
    );
};

const bindActionRef = React.createRef();

const LoginPolicyUserGroupBind = ({open, loginPolicyId, onClose}) => {

    let [bindKeys, setBindKeys] = useState([]);

    React.useEffect(() => {
        const x = async () => {
            let ids = await loginPolicyApi.GetUserGroupIdByLoginPolicyId(loginPolicyId);
            setBindKeys(ids);
        }
        x();
    }, [open]);

    const handleBind = async (userGroupId) => {
        await loginPolicyApi.BindUserGroup(loginPolicyId, [{'userGroupId': userGroupId}]);
        bindKeys.push(userGroupId);
        setBindKeys([...bindKeys]);
        bindActionRef.current.reload();
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
            copyable: true,
        },
        {
            title: '创建时间',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="bind"
                    onClick={() => {
                        handleBind(record['id']);
                    }}
                    disabled={bindKeys.includes(record['id'])}
                >
                    绑定
                </a>,
            ],
        },
    ];

    return (
        <Drawer title="绑定用户组"
                placement="right"
                width={window.innerWidth * 0.7}
                onClose={onClose}
                open={open}
        >
            <ProTable
                columns={columns}
                actionRef={bindActionRef}
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
                    let result = await userGroupApi.getPaging(queryParams);
                    return {
                        data: result['items'],
                        success: true,
                        total: result['total']
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                        defaultPageSize: 10,
                    }}
                dateFormatter="string"
                headerTitle="用户组列表"
            />
        </Drawer>
    );
};

export default LoginPolicyUserGroup;
