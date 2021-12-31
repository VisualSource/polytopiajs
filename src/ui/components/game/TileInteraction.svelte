<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { Button, Icon } from 'sveltestrap';
    import { SystemEvents, ObjectEvents, ActionEvent } from '../../../game/events/systemEvents';
    import Game from '../../../game/core/Game';
    import tilejson from '../../data/tiles.json';
    import tileimage from '../../data/tiles.webp';

    //https://www.leshylabs.com/apps/sstool/
    //https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3
    let show = false;
    let name = "TILE NAME";
    let description = "";
    let actions: { id: ActionEvent, data: { [key: string]: any } }[] = [];

    let rendered_last: string[] = [];
    let canvas: HTMLCanvasElement;
    const img = new Image();
    const game = new Game();

    const compare_list = (a: string[], b: string[]): boolean => {
        if(!b) return false;
        if(a.length !== b.length) return false;
        let i = 0;
        while(i < a.length) {
            if(a[i] !== b[i]) return false;
            i++;
        }
        return true;
    }

    const render_ui = async (request: any): Promise<void> => {

        const tile = game.world.level.get(request.data.world.row,request.data.world.col).getPreivew;
        // check if the rendered last array is the same as the new tile array.
        if(compare_list(rendered_last,tile)) return;

        const { title, desc } = game.world.level.get(request.data.world.row,request.data.world.col).uiText();
        name = title;
        description = desc;

        if(img.src !== tileimage) {
            await new Promise<void>((ok,err)=>{
                img.onload = () => ok();
                img.src = tileimage;
            });
        } 
        if(!canvas) return;
        
        const ctx = canvas.getContext("2d");

        ctx?.clearRect(0,0,canvas.width,canvas.height);

        for(const imgData of tile) {
            //@ts-ignore
            const imgFrame = tilejson.frames[imgData];
            
            if(!imgFrame) continue;
            const {frame} = imgFrame;

            ctx?.drawImage(img,frame.x,frame.y,frame.w,frame.h,0,0,frame.w / 4, frame.h / 4);
        }

        rendered_last = tile;
    }
    const render_actions = async (event: any) : Promise<void> => {
        const tile = game.world.level.get(event.data.world.row,event.data.world.col);

        if(tile.unit !== null) {
            const unit = game.world.units.get(tile.unit);
            if(!unit || game.world.players.activePlayer !== unit.tribe) return;
            
            if(unit.health < unit.maxHealth) {
                actions.push({ id: ActionEvent.RECOVER, data: { unit: tile.unit, tile: tile.uuid } });
            }

            if(game.world.players.activePlayerHas("free_spirit")) {
                actions.push({ id: ActionEvent.DISBAND, data: { unit: tile.unit, tile: tile.uuid } });
            }

            if(unit.type === "MIND_BENDER") {
                actions.push({ id: ActionEvent.HEAL, data: { unit: tile.unit, tile: tile.uuid } });
            }

            return;
        }
        //@ts-ignore
        if(tile.base?.isCity) {
            if(tile.owning_tribe !== game.world.players.activePlayer) return;
            actions.push({ id: ActionEvent.SPAWN, data: { tile: tile.uuid, type: "WARRIOR" } });

            return;
        }

    }
    const interaction = (event: any) => {
        switch (event.id) {
            case ObjectEvents.SELECTION:
                show = true;
                render_ui(event);
                render_actions(event);
                break;
            case ObjectEvents.DESELECTION: 
            default:
                show = false;
                actions = [];
                break;
        }
    }
    const onClose = () => {
        show = false;
        game.events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: {} });
    }

    const actionEvent = (data: { id: any, data: any }) => {
        game.events.emit<SystemEvents,ActionEvent>({ type: SystemEvents.ACTION, ...data });
    }

    game.events.on(SystemEvents.INTERACTION, interaction);

</script>

<style lang="sass">
    @use "../../_variables"
    #tile-actions 
        @include variables.flex-column()
        position: absolute
        bottom: 5px
        right: 0
        left: 0
        margin: 0 auto
        user-select: none
        color: var(--bs-light)
        width: 25%
        border-top-left-radius: 6px 
        border-top-right-radius: 6px
        > main 
            @include variables.flex-row-center()
            height: 80px
            gap: 20px
            overflow-x: scroll
        > header 
            padding: 10px
            display: flex 
            justify-content: space-between
            > div.preview 
                display: flex
                > div.preview-img 
                    display: flex
                    overflow: visible
                    margin-right: 10px
                    overflow: visible
              
                    > canvas
                        display: block             
                > div.title-desc 
                    @include variables.flex-column()
                    > h6 
                        margin-bottom: 1px
                    > span 
                        font-size: 0.875em
                        word-wrap: anywhere
                    
    .tile-action 
        @include variables.flex-column-center()
        height: 50px
        width: 50px
        margin: 5px
        user-select: none
        &:active
            transform: translate(1px,1px)
      
    @media screen and (max-width: 765px) 
        #tile-actions 
            bottom: 0
            width: 100%
</style>

{#if show} 
    <div id="tile-actions" class="bg-dark" in:fly="{{ y: 200, duration: 200 }}" out:fade>
        <header>
            <div class="preview">
                <div class="preview-img">
                  <canvas bind:this={canvas} width="60" height="60"></canvas>
                </div>
                <div class="title-desc">
                    <h6>
                        <strong>{name}</strong>
                    </h6>
                    <span>{description}</span>
                </div>
            </div>
            <div>
                <Button on:click={onClose} class="rounded-circle bg-light">
                    <Icon id="action" class="text-dark" name="chevron-compact-down"/>
                </Button>
            </div>
        </header>
        {#if actions.length > 0 }
            <main class="border-top border-light">
                {#each actions as action}
                    <div class="rounded-circle border border-3 bg-primary tile-action" on:click={()=>actionEvent(action)}>{action.id}</div>
                {/each}
            </main>
        {/if}
    </div>
{/if}

