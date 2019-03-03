/**
 * @file 示例页面
 * @author zhanglili
 */

import {render} from 'react-dom';
import {Provider} from 'react-redux';
import App from '../App';
import store from '../store';
import '../index.css';

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.body.appendChild(document.createElement('div'))
);
