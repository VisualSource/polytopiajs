import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/containers/App';
import {Auth0Provider} from './components/providor/Auth0Providor';
import history from "./utils/history";
import * as serviceWorker from './serviceWorker';
import "./style/index.sass";
import 'shineout/dist/theme.default.css';
const onRedirectCallback = (appState: any)=> {history.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);}

ReactDOM.render(<Auth0Provider 
                    domain={"visualsource.auth0.com"}
                    client_id={"lMZtNGOs7ZZijZT2Xk0HChwHvyqRSHJX"}
                    redirect_uri={window.location.origin}
                    onRedirectCallback={onRedirectCallback}>
                    <App />
                </Auth0Provider>,document.getElementById('root'));
serviceWorker.unregister();
