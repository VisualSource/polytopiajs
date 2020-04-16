import React from 'react';
import {scene} from '../../game/main';
import {useQuery} from '../../utils/history';
import GameMenu from './GameMenu';
import BackButton from '../parts/BackButton';
import ScrollMenu from 'react-horizontal-scrolling-menu';
import GameState from '../../game/GameStateHandler';
import {Image} from 'shineout';
export default function View(){
    const {id} = useQuery();
    const player = new GameState().currentPlayer;
    const object = scene.getObjectById(Number(id));
    const name = (object as Polytopia.Objects.Dynamic.IDynamicBlock).blockType;
    
    return <GameMenu id="viewer">
                <div>
                    <Image height={50} width={50}/>
                    <section>
                        <h2>{name}</h2>
                        <p>{}</p>
                    </section>
                    <BackButton/>
                </div>
                <ScrollMenu hideArrows={true} data={[]}/>
          </GameMenu>
}