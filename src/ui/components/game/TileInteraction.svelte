<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import EventEmitter from '../../../game/core/EventEmitter';
    import { Button, Icon } from 'sveltestrap';
    import { SystemEvents, ObjectEvents } from '../../../game/events/systemEvents';

    let show = true;
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
        height: 140px
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
                    margin-right: 10px
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
    <div id="tile-actions" class="bg-dark" in:fly="{{ y: 100, duration: 200 }}" out:fade>
        <header>
            <div class="preview">
                <div class="preview-img">
                    <img src="" alt="tile preview"/>
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

