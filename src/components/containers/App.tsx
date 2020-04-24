import React,{PureComponent} from 'react';
import MainMenu from '../menus/MainMenu';
import Game from './Game';
import history from '../../utils/history';
import { Router, Switch, Route} from "react-router-dom";
import Settings from '../menus/Settings';

export default class App extends PureComponent{
  constructor(props: any){
    super(props);
  }
  componentDidMount(){
    history.push("/");
  }
  render(){
    return <Router history={history}>
              <Switch>
                  <Route exact path="/">
                    <MainMenu/>
                  </Route>
                  <Route path="/settings">
                      <Settings game={false}/>
                  </Route>
                  <Route path="/game">
                    <Game/>
                  </Route>
                  <Route path="/singleplayer">
                    <h1>Singleplayer</h1>
                  </Route>
                  <Route path="/multiplayer">
                    <h1>Multiplayer</h1>
                  </Route>
                  <Route path="/throneroom">
                    <h1>Throne Room</h1>
                  </Route>
                  <Route path="/highscores">
                    <h1>High Scores</h1>
                  </Route>
              </Switch>
           </Router>
  }
};
