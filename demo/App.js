/**
 * @file App
 * @author zhanglili
 */

import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {sortBy, get} from 'lodash';
import {bind} from 'lodash-decorators';
import withTimeout from 'react-timeout';
import ECharts from 'echarts-for-react';
import {Button, notification} from 'antd';
import {fetchSummary, acceptSummary} from './actions';
import {selectSummaryQuery} from './selectors';
import 'antd/dist/antd.min.css';

class App extends PureComponent {

    componentDidMount() {
        const {setInterval, fetchSummary} = this.props;
        fetchSummary();
        setInterval(fetchSummary, 10 * 1000);
    }

    componentDidUpdate(prevProps) {
        const nextResponse = get(this.props, 'summaryQuery.nextResponse');
        const prevNextResponse = get(prevProps, 'summaryQuery.nextResponse');

        if (nextResponse && nextResponse !== prevNextResponse) {
            const confirmButton = <Button type="primary" onClick={this.acceptSummary}>Confirm</Button>;
            const config = {
                message: 'Received new data',
                description: 'New data is received, click "Confirm" to refresh chart',
                btn: confirmButton,
                key: 'newSummary'
            };
            notification.open(config);
        }
    }

    @bind()
    acceptSummary() {
        this.props.acceptSummary();
        notification.close('newSummary');
    }

    render() {
        const {summaryQuery: {response}} = this.props;

        if (!response) {
            return null;
        }

        const seriesData = [
            {value: response.data.direct, name: '直接访问'},
            {value: response.data.email, name: '邮件营销'},
            {value: response.data.union, name: '联盟广告'},
            {value: response.data.video, name: '视频广告'},
            {value: response.data.search, name: '搜索引擎'}
        ];

        const options = {
            backgroundColor: '#2c343c',
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            visualMap: {
                show: false,
                min: 500,
                max: 5000,
                inRange: {
                    colorLightness: [0, 1]
                }
            },
            series : [
                {
                    name: 'PV Source',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '50%'],
                    data: sortBy(seriesData, 'value'),
                    roseType: 'radius',
                    label: {
                        normal: {
                            textStyle: {
                                color: 'rgba(255, 255, 255, 0.3)'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.3)'
                            },
                            smooth: 0.2,
                            length: 10,
                            length2: 20
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#c23531',
                            shadowBlur: 200,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay() {
                        return Math.random() * 200;
                    }
                }
            ]
        };

        return (
            <div>
                <header className="header">
                    <h1>PV Source</h1>
                    <span className="subtitle">Data refreshes every 10 seconds</span>
                </header>
                <ECharts style={{height: 600}} option={options} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        summaryQuery: selectSummaryQuery(state) || {}
    };
};

const mapDispatchToProps = dispatch => bindActionCreators({fetchSummary, acceptSummary}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withTimeout(App));
