import React,{PureComponent} from 'react';
import MainMenu from '../menus/MainMenu';
import Game from './Game';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";


export default class App extends PureComponent{
  constructor(props: any){
    super(props);
  }
  render(){
    return <Router>
              <Switch>
                  <Route exact path="/">
                     <MainMenu />
                  </Route>
                  <Route path="/game">
                     <Game/>
                  </Route>
              </Switch>
           </Router>
  }
};
