import Game from '../../game/core/Game';
import { SystemEvents, ObjectEvents, ActionEvent } from '../../game/events/systemEvents';
import { writable } from 'svelte/store';
import tilejson from '../data/tiles.json';
import tileimage from '../data/tiles.webp';

type Action = { id: ActionEvent, data: { [key: string]: any } };

const compare_list = <T = string>(a: T[], b: T[]): boolean => {
    if(!b) return false;
    if(a.length !== b.length) return false;
    let i = 0;
    while(i < a.length) {
        if(a[i] !== b[i]) return false;
        i++;
    }
    return true;
}

//https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3
export default class TileUI {
    public show = writable(false);
    public name = writable("Title");
    public description = writable("");
    public canvas = writable<HTMLCanvasElement>();
    public actions = writable<Action[]>([]);
    public game = new Game();
    private img: HTMLImageElement = new Image();
    private rendered_last: string[] = [];
    constructor(){
        this.game.events.on(SystemEvents.INTERACTION,this.interaction);
        this.loadSpritesheet();
    }
    private async loadSpritesheet(): Promise<void> {
        if(this.img.src === tileimage) return;

        await new Promise<void>((ok,err)=>{
            this.img.onload = () => ok();
            this.img.onerror = ()=> err("Failed to load resource");
            this.img.src = tileimage;
        });
    }
    private interaction = (event: any): void => {
        console.log("Event");
        switch (event.id) {
            case ObjectEvents.SELECTION:
                this.game.ui.setContext(event.data.world.row,event.data.world.col);
                this.show.set(true);
                this.render();
                this.actions.set(this.game.ui.getActions());
                break;
            case ObjectEvents.DESELECTION: 
            default:
                this.show.set(false);
                this.actions.set([]);
                this.game.ui.ignore();
                break
        }
    }
    public onClose = (): void => {
        this.game.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: {} });
        this.show.set(false);
    }
    public onAction = (event: Action): void => {
        this.game.events.emit<SystemEvents,ActionEvent>({ type: SystemEvents.ACTION, ...event });
    }
    public async render(): Promise<void> {
        const icon = this.game.ui.getIcon();

        if(compare_list(this.rendered_last,icon)) return;

        await this.loadSpritesheet();

        this.name.set(this.game.ui.getTitle());
        this.description.set(this.game.ui.getDescription());

        const canvas = await this.getCanvas();

        if(!canvas) return;

        const ctx = canvas.getContext("2d");

        if(!ctx) return;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        for(const imgData of icon) {
            //@ts-ignore
            const imgFrame = tilejson.frames[imgData];
            
            if(!imgFrame) continue;
            const {frame} = imgFrame;

            ctx.drawImage(this.img,frame.x,frame.y,frame.w,frame.h,0,0,frame.w / 4, frame.h / 4);
        }

        this.rendered_last = icon;
    }
    public async getCanvas(): Promise<HTMLCanvasElement | null> {
        return new Promise<HTMLCanvasElement | null>((ok,err)=>{
            const drop = this.canvas.subscribe((canvas)=>{
                if(!canvas) {
                    ok(null);
                    return;
                }
                ok(canvas);
            });
            drop();
        });
    }
}