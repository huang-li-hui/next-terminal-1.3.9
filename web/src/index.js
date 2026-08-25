import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import zhCN from 'antd/locale/zh_CN';
import {ConfigProvider} from 'antd';
import {HashRouter as Router} from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import {QueryClient, QueryClientProvider,} from 'react-query';

// rc-resize-observer（pro-components 依赖，已最新版）内部使用 findDOMNode，
// React 18 每次渲染都刷告警且上游未修复，开发环境仅屏蔽这一条
if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Warning: findDOMNode is deprecated')) {
            return;
        }
        originalError(...args);
    };
}

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root'));

root.render(
    <ConfigProvider locale={zhCN}>
        <Router future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </Router>
    </ConfigProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

