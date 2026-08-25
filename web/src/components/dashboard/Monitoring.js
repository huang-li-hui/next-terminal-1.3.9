import React from 'react';
import {Progress, Space, Tooltip} from "antd";
import {ProCard, StatisticCard} from '@ant-design/pro-components';
import dayjs from "dayjs";
import {renderSize} from "../../utils/utils";
import {Area, Line} from "@ant-design/charts";
import './Monitoring.css'
import {renderWeekDay} from "../../utils/week";
import {useQuery} from "react-query";
import monitorApi from "../../api/monitor";

const {Statistic} = StatisticCard;

const renderLoad = (percent) => {
    if (percent >= 0.9) {
        return '堵塞';
    } else if (percent >= 0.8) {
        return '缓慢';
    } else if (percent >= 0.7) {
        return '正常';
    } else {
        return '流畅';
    }
}

const initData = {
    loadStat: {
        load1: 0, load5: 0, load15: 0, percent: 0
    },
    mem: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    cpu: {
        count: 0,
        usedPercent: 0,
        info: [{
            'modelName': ''
        }]
    },
    disk: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    diskIO: [], netIO: [], cpuStat: [], memStat: [],
}

const areaConfig = (data, color) => ({
    height: 170,
    data: data,
    xField: 'time',
    yField: 'value',
    shapeField: 'smooth',
    style: {
        fill: `linear-gradient(270deg, ${color} 0%, rgba(255,255,255,0) 100%)`,
        fillOpacity: 0.3,
        stroke: color,
        lineWidth: 2,
    },
    axis: {
        y: {
            labelFormatter: (v) => `${v}%`,
        },
        x: {
            labelFormatter: (v) => `${v}`.slice(0, 5),
        },
    },
});

const ioConfig = (data, readLabel, writeLabel) => ({
    height: 170,
    data: [
        ...data.map(d => ({time: d.time, type: readLabel, value: Number(d.read.toFixed(2))})),
        ...data.map(d => ({time: d.time, type: writeLabel, value: Number(d.write.toFixed(2))})),
    ],
    xField: 'time',
    yField: 'value',
    colorField: 'type',
    color: ['#5B8FF9', '#2AAE67'],
    smooth: true,
    style: {
        lineWidth: 2,
    },
    axis: {
        y: {
            labelFormatter: (v) => Number(v.toFixed(2)),
        },
    },
});

const progressProps = (percent, color) => ({
    type: 'circle',
    percent: Math.max(0, Math.min(Number(percent) * 100, 100)),
    format: (p) => (Number.isFinite(p) ? `${p.toFixed(0)}%` : '-'),
    size: 116,
    strokeWidth: 9,
    strokeLinecap: 'round',
    strokeColor: {'0%': color, '100%': `${color}66`},
    trailColor: `${color}1a`,
});

const Monitoring = () => {

    let monitorQuery = useQuery('getMonitorData', monitorApi.getData, {
        initialData: initData,
        refetchInterval: 5000
    });

    let loadPercent = monitorQuery.data?.loadStat['percent'];
    let loadColor = '#5B8FF9';
    if (loadPercent > 0.9) {
        loadColor = '#F5222D';
    } else if (loadPercent > 0.8) {
        loadColor = '#FA8C16';
    }
    if (loadPercent > 0.9) {
        loadColor = '#F5222D';
    } else if (loadPercent > 0.8) {
        loadColor = '#FA8C16';
    }

    const loadStatConfig = progressProps(loadPercent, loadColor);

    let cpuPercent = monitorQuery.data?.cpu['usedPercent'] / 100;
    let cpuColor = '#2AAE67';
    if (cpuPercent > 0.9) {
        cpuColor = '#F5222D';
    } else if (cpuPercent > 0.8) {
        cpuColor = '#FA8C16';
    }
    const cpuStatConfig = progressProps(cpuPercent, cpuColor);

    let memPercent = monitorQuery.data?.mem['usedPercent'] / 100;
    let memColor = '#9E6BFF';
    if (memPercent > 0.9) {
        memColor = '#F5222D';
    } else if (memPercent > 0.75) {
        memColor = '#FA8C16';
    }

    const memStatConfig = progressProps(memPercent, memColor);

    let diskPercent = monitorQuery.data?.disk['usedPercent'] / 100;
    let diskColor = '#13C2C2';
    if (diskPercent > 0.9) {
        diskColor = '#F5222D';
    } else if (diskPercent > 0.8) {
        diskColor = '#FA8C16';
    }

    const diskStatConfig = progressProps(diskPercent, diskColor);

    const diskIOConfig = ioConfig(monitorQuery.data['diskIO'], '读取（MB/s）', '写入（MB/s）');
    const netIOConfig = ioConfig(monitorQuery.data['netIO'], '接收（MB/s）', '发送（MB/s）');

    const cpuConfig = areaConfig(monitorQuery.data['cpuStat'], '#5B8FF9');

    const memConfig = areaConfig(monitorQuery.data['memStat'], '#9E6BFF');

    const cpuModelName = monitorQuery.data['cpu']['info'][0]['modelName'].length > 10 ? monitorQuery.data['cpu']['info'][0]['modelName'].substring(0, 10) + '...' : monitorQuery.data['cpu']['info'][0]['modelName'];

    return (<>
        <div style={{margin: 16}}>
            <ProCard
                title="系统监控"
                extra={dayjs().format("YYYY[年]MM[月]DD[日] HH:mm:ss") + ' ' + renderWeekDay(dayjs().day())}
                split={'horizontal'}
                headerBordered
                bordered
            >
                <ProCard split={'vertical'}>
                    <ProCard>
                        <StatisticCard
                            statistic={{
                                title: '负载',
                                value: renderLoad(monitorQuery.data['loadStat']['percent']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="Load1" value={monitorQuery.data['loadStat']['load1'].toFixed(2)}/>
                                    <Statistic title="Load5" value={monitorQuery.data['loadStat']['load5'].toFixed(2)}/>
                                    <Statistic title="Load15"
                                               value={monitorQuery.data['loadStat']['load15'].toFixed(2)}/>
                                </Space>,
                            }}
                            chart={<Progress {...loadStatConfig} />}
                            chartPlacement="left"
                        />

                        <StatisticCard
                            statistic={{
                                title: 'CPU',
                                value: monitorQuery.data['cpu']['count'],
                                suffix: '个',
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="利用率"
                                               value={monitorQuery.data['cpu']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="物理核数"
                                               value={monitorQuery.data['cpu']['phyCount'] + ' 个'}/>
                                    <Tooltip title={monitorQuery.data['cpu']['info'][0]['modelName']}>
                                        <Statistic title="型号" value={cpuModelName}/>
                                    </Tooltip>
                                </Space>,
                            }}
                            chart={<Progress {...cpuStatConfig} />}
                            chartPlacement="left"
                        />
                    </ProCard>
                    <ProCard>
                        <StatisticCard
                            statistic={{
                                title: '内存',
                                value: renderSize(monitorQuery.data['mem']['total']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="利用率"
                                               value={monitorQuery.data['mem']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="可用的"
                                               value={renderSize(monitorQuery.data['mem']['available'])}/>
                                    <Statistic title="已使用" value={renderSize(monitorQuery.data['mem']['used'])}/>
                                </Space>,
                            }}
                            chart={<Progress {...memStatConfig} />}
                            chartPlacement="left"
                        />

                        <StatisticCard
                            statistic={{
                                title: '硬盘',
                                value: renderSize(monitorQuery.data['disk']['total']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="利用率"
                                               value={monitorQuery.data['disk']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="剩余的"
                                               value={renderSize(monitorQuery.data['disk']['available'])}/>
                                    <Statistic title="已使用" value={renderSize(monitorQuery.data['disk']['used'])}/>
                                </Space>,
                            }}
                            chart={<Progress {...diskStatConfig} />}
                            chartPlacement="left"
                        />
                    </ProCard>
                </ProCard>

                <ProCard split={'vertical'}>
                    <ProCard title="CPU负载">
                        <Area {...cpuConfig} />
                    </ProCard>
                    <ProCard title="内存负载">
                        <Area {...memConfig} />
                    </ProCard>
                </ProCard>

                <ProCard split={'vertical'}>
                    <ProCard title="网络吞吐">
                        <Line {...netIOConfig} />
                    </ProCard>
                    <ProCard title="磁盘IO">
                        <Line {...diskIOConfig} />
                    </ProCard>

                </ProCard>


            </ProCard>
        </div>
    </>);
}

export default Monitoring;
