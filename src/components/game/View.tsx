import React from 'react';
import {scene} from '../../game/main';
import {useQuery} from '../../utils/history';
import GameMenu from './GameMenu';
import BackButton from '../parts/BackButton';
import ScrollMenu from 'react-horizontal-scrolling-menu';
import GameState from '../../game/GameStateHandler';
import {Image, Button, Modal} from 'shineout';
import {tooltip, building, resource_names} from '../../assets/lang.json';
import IconButton from '../parts/IconButton';
const resource: { [any: string]: Polytopia.ITech} = {
    "fruit": "organization",
    "crop": "farming",
    "metal":"mining",
    "fish":"fishing",
    "whale":"whaling",
    "wild_animal":"hunting"
};
export default function View(){
    const {id} = useQuery();
    const player = new GameState().currentPlayer;
    const object = (scene.getObjectById(Number(id)) as Polytopia.Objects.Dynamic.IDynamicBlock);
    
    const genName = (): string =>{
        //@ts-ignore
        return `${object.blockType}${ object.resource !== null ? `, ${resource_names[object.resource]}` : ""}`;
    }
    const genDesc = (): string =>{
        if(player.faction !== object.faction && object.resource){
            return tooltip.tile.outside;
        }
        if(player.faction === object.faction && object.resource){
            if(player.tech.includes(resource[object.resource])){
                return tooltip.tile.extract.upgrade;
            }else{
                return tooltip.tile.extract.research.replace("{0}",resource[object.resource].charAt(0).toUpperCase() + resource[object.resource].slice(1));
            }
        }
        return "";
    }
    const genOptions = (): any[]=>{
        return [];
    }
    const createModal = (ruin = false)=>{
        if(ruin){
            //@ts-ignore
            Modal.info({
                title: building.names.ruin,
                content: building.ability.ruin,
              });
        }else{
        //@ts-ignore
        Modal.info({
            title: object.blockType,
            //@ts-ignore
            content: building.ability[object.blockType.toLocaleLowerCase()],
          });
        }
    }
    return <GameMenu id="viewer">
        {
            object?.userData.ruin ?
                  <div>
                    <div>
                        <Button type="success"  onClick={()=>createModal(true)}>!</Button>
                        <Image height={50} width={50}/>
                    </div>
                    <section>
                        <h2>{building.names.ruin}</h2>
                        <p>{tooltip.tile.ruin}</p>
                    </section>
                    <BackButton/>
                </div> :
                <>
                <div>
                    <div>
                        <Image height={50} width={50}/>
                    </div>
                    <section>
                        <h2>{genName()}</h2>
                        <p>{genDesc()}</p>
                    </section>
                    <BackButton/>
                </div>
                <ScrollMenu hideArrows={true} data={genOptions()}/>
                </>
        }
          </GameMenu>
}