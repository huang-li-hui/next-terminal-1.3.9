import React, {Suspense, useEffect} from 'react';
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {Breadcrumb, Button, Dropdown, Layout, Modal} from "antd";
import {
    CodeOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DownOutlined,
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import {getCurrentUser, isAdmin} from "../service/permission";
import FooterComponent from "./FooterComponent";
import accountApi from "../api/account";
import LogoWithName from "../images/logo-with-name.png";
import Landing from "../components/Landing";
import {setTitle} from "../hook/title";

const {Header, Content} = Layout;

const breadcrumbNameMap = {
    '/my-asset': '我的资产',
    '/my-command': '我的指令',
    '/my-info': '个人中心',
};

const UserLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    let _current = location.pathname.split('/')[1];

    useEffect(() => {
        setTitle(breadcrumbNameMap['/' + _current]);
    }, [_current]);

    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return {
            key: url,
            title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
        };
    });

    const breadcrumbItems = [
        {key: 'home', title: <Link to="/my-asset">首页</Link>},
    ].concat(extraBreadcrumbItems);

    const menuItems = [
        ...(isAdmin() ? [{
            key: 'dashboard',
            label: <Link to={'/dashboard'}><DashboardOutlined/> 后台管理</Link>,
        }] : []),
        {
            key: 'logout',
            icon: <LogoutOutlined/>,
            label: '退出登录',
            onClick: () => {
                Modal.confirm({
                    title: '您确定要退出登录吗?',
                    onOk: async () => {
                        await accountApi.logout();
                        navigate('/login');
                    },
                    okText: '确定',
                    cancelText: '取消',
                });
            },
        },
    ];

    return (
        <Layout className="layout" style={{minHeight: '100vh'}}>
            <Header style={{padding: 0}}>
                <div className='km-header'>
                    <div style={{flex: '1 1 0%'}}>
                        <Link to={'/my-asset'}>
                            <img src={LogoWithName} alt='logo' width={120}/>
                        </Link>

                        <Link to={'/my-asset'}>
                            <Button type="text" style={{color: 'white'}}
                                    icon={<DesktopOutlined/>}>
                                我的资产
                            </Button>
                        </Link>

                        <Link to={'/my-command'}>
                            <Button type="text" style={{color: 'white'}}
                                    icon={<CodeOutlined/>}>
                                我的指令
                            </Button>
                        </Link>

                        <Link to={'/my-info'}>
                            <Button type="text" style={{color: 'white'}}
                                    icon={<UserOutlined/>}>
                                个人中心
                            </Button>
                        </Link>

                    </div>
                    <div className='km-header-right'>
                        <Dropdown menu={{items: menuItems}}>
                            <div className={'nickname layout-header-right-item'}>
                                {getCurrentUser()['nickname']} &nbsp;<DownOutlined/>
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </Header>

            <Content className='nt-container'>
                <div style={{marginBottom: 16}}>
                    <Breadcrumb items={breadcrumbItems}/>
                </div>
                <Suspense fallback={<Landing/>}>
                    <Outlet/>
                </Suspense>
            </Content>
            <FooterComponent/>
        </Layout>
    );
}

export default UserLayout;