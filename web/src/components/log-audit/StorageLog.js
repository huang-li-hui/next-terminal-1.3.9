import React, {useState} from 'react';

import {Button, Layout, Popconfirm, Tag, Tooltip} from "antd";
import {formatDate, isEmpty} from "../../utils/utils";
import {ProTable} from "@ant-design/pro-components";
import storageLogApi from "../../api/storage-log";
import ColumnState, {useColumnState} from "../../hook/column-state";
import Show from "../../dd/fi/show";

const api = storageLogApi;
const {Content} = Layout;

const actionRef = React.createRef();

const ACTION_COLORS = {
    '上传': 'blue',
    '下载': 'green',
    '删除': 'red',
    '重命名': 'orange',
    '编辑': 'purple',
};

const StorageLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.STORAGE_LOG);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '资产名称',
            dataIndex: 'assetName',
            key: 'assetName',
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '操作用户',
            dataIndex: 'userName',
            key: 'userName',
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '操作类型',
            dataIndex: 'action',
            key: 'action',
            render: text => {
                if (isEmpty(text)) {
                    return '-';
                }
                return <Tag color={ACTION_COLORS[text] || 'default'}>{text}</Tag>
            },
        }, {
            title: '文件名称',
            dataIndex: 'fileName',
            key: 'fileName',
            hideInSearch: true,
            ellipsis: true,
            render: (text, record) => {
                if (isEmpty(text)) {
                    return '-';
                }
                return <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
            }
        }, {
            title: '操作时间',
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return formatDate(text);
            }
        }, {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => {
                return [
                    <Show menu={'storage-log-del'} key={'storage-log-del'}>
                        <Popconfirm
                            title="您确认要删除此行吗?"
                            onConfirm={async () => {
                                await api.deleteById(record.id);
                                actionRef.current.reload();
                            }}
                            okText="确认"
                            cancelText="取消"
                        >
                            <a className='danger'>删除</a>
                        </Popconfirm>
                    </Show>,
                ];
            },
        },
    ];

    return (
        <div>
            <Content className="page-container">
                <ProTable
                    columns={columns}
                    actionRef={actionRef}
                    columnsState={{
                        value: columnsStateMap,
                        onChange: setColumnsStateMap
                    }}
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
                            action: params.action,
                            field: field,
                            order: order
                        }
                        let result = await api.getPaging(queryParams);
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
                        showSizeChanger: true,
                        onChange: (page, pageSize) => {
                            setTotal(page * pageSize);
                        }
                    }}
                    dateFormatter="string"
                    headerTitle="文件日志"
                    toolBarRender={() => [
                        <Show menu={'storage-log-clear'} key={'storage-log-clear'}>
                            <Popconfirm
                                title="您确认要清空全部文件日志吗?"
                                onConfirm={async () => {
                                    await api.Clear();
                                    actionRef.current.reload();
                                }}
                                okText="确认"
                                cancelText="取消"
                            >
                                <Button key="clear" danger type="primary">清空</Button>
                            </Popconfirm>
                        </Show>,
                    ]}
                />
            </Content>
        </div>
    );
}

export default StorageLog;
