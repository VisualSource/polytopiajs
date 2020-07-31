import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import * as serviceWorker from './serviceWorker';
import 'shineout/dist/theme.default.css';
import './style/index.sass';

ReactDOM.render(<App/>, document.getElementById('root'));
serviceWorker.unregister();




