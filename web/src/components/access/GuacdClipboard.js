import React, {useEffect, useState} from 'react';
import {Form, Input, Modal} from "antd";

const GuacdClipboard = ({open, clipboardText, handleOk, handleCancel}) => {

    const [form] = Form.useForm();
    let [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        form.setFieldsValue({
            'clipboard': clipboardText
        })
    }, [open]);

    return (
        <div>
            <Modal
                title="剪贴板"
                maskClosable={false}
                open={open}
                onOk={() => {
                    form.validateFields()
                        .then(values => {
                            setConfirmLoading(true);
                            try {
                                handleOk(values['clipboard']);
                            } finally {
                                setConfirmLoading(false);
                            }
                        })
                        .catch(info => {

                        });
                }}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Form form={form}>
                    <Form.Item name='clipboard'>
                        <Input.TextArea rows={10}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GuacdClipboard;