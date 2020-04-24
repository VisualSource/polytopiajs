import React from 'react';
import GameMenu from '../game/GameMenu';
import {SettingsLoader} from '../../utils/Loaders';
import {settings} from '../../assets/lang.json';
import { Slider, Switch } from 'shineout';
import ScrollMenu from 'react-horizontal-scrolling-menu'
export default function Settings({game = false}){
    return <GameMenu id="settigs">
                <h1>{settings.title}</h1>
                <Slider defaultValue={100} step={1} formatValue={()=>false} formatScale={()=>false}/>
                <section>
                    <div>
                        <label>{settings.soundeffects}</label>
                        <Switch/>
                    </div>
                    <div>
                        <label>{settings.ambience}</label>
                        <Switch/>
                    </div>
                    <div>
                        <label>{settings.tribemusic}</label>
                        <Switch/>
                    </div>
                </section>
                <br/>
                <section>
                    <div>
                        <label>{settings.suggestions}</label>
                        <Switch/>
                    </div>
                    <div>
                        <label>{settings.info}</label>
                        <Switch/>
                    </div>
                    <div>
                        <label>{settings.confirm}</label>
                        <Switch/>
                    </div>
                </section>
                <ScrollMenu data={[
                    <div>English</div>
                ]}/>
           </GameMenu>
}