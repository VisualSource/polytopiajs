<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { Button, Icon } from 'sveltestrap';
    import EventEmitter from '../../../game/core/EventEmitter';
    import { SystemEvents, ObjectEvents } from '../../../game/events/systemEvents';

    //https://www.leshylabs.com/apps/sstool/
    //https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3
    let show = true;
    let canvas: HTMLCanvasElement;

    onMount(()=>{
        let img = new Image();
        img.src = "http://localhost:3000/temp/ground.png";
        let img2 = new Image();
        img2.src = "http://localhost:3000/temp/village.png";
        let ctx = (canvas as HTMLCanvasElement).getContext("2d");
        ctx?.drawImage(img,0,-35,243,274,0,0,243 / 5,274 / 5);
        ctx?.drawImage(img2,-5,-10,256,177,0,0,256 / 6,177 / 6);
    })


    const events = new EventEmitter();

    const interaction = (event: any) => {
        switch (event.id) {
            case ObjectEvents.SELECTION:
                show = true;
                break;
            case ObjectEvents.DESELECTION: 
            default:
                show = false;
                break;
        }
    }
    const onClose = () => {
        show = false;
        events.emit<SystemEvents,ObjectEvents>({ type: SystemEvents.INTERACTION, id: ObjectEvents.DESELECTION, data: {} });

    }

    events.on(SystemEvents.INTERACTION, interaction);

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
                        <strong>TILE NAME</strong>
                    </h6>
                    <span>TILE DESCRIPTION</span>
                </div>
            </div>
            <div>
                <Button on:click={onClose} class="rounded-circle bg-light">
                    <Icon id="action" class="text-dark" name="chevron-compact-down"/>
                </Button>
            </div>
        </header>
        <main class="border-top border-light">
            <div class="rounded-circle border border-3 bg-primary tile-action">A</div>
            <div class="rounded-circle border border-3 bg-primary tile-action">B</div>
        </main>
    </div>
{/if}

