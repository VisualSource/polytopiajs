import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/containers/App';
import {Auth0Provider} from './components/providor/Auth0Providor';
import history from "./utils/history";
import Files from './game/utils/FileLoader';
import * as serviceWorker from './serviceWorker';
import "./style/index.sass";
import 'shineout/dist/theme.default.css';
import {assets} from './game/utils/files.json';
// Moves this to after HTML CALL
const files = new Files();
assets.forEach((data: any)=>{
    files.load(data);
});
const onRedirectCallback = (appState: any)=> {history.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);}
ReactDOM.render(<Auth0Provider 
                    domain={"visualsource.auth0.com"}
                    client_id={"lMZtNGOs7ZZijZT2Xk0HChwHvyqRSHJX"}
                    redirect_uri={window.location.origin}
                    onRedirectCallback={onRedirectCallback}>
                    <App />
                </Auth0Provider>,document.getElementById('root'));
serviceWorker.unregister();




