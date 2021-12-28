<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import EventEmitter from '../../../game/core/EventEmitter';
    import { Button, Icon } from 'sveltestrap';
    import { SystemEvents, ObjectEvents } from '../../../game/events/systemEvents';

    let show = false;
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
    .menu-interaction 
        position: absolute
        bottom: 5px 
        left: 50%
        background-color: var(--bs-dark)
        color: var(--bs-light)
        border-top-left-radius: 6px
        border-top-right-radius: 6px
        height: 5rem
        width: 25em
        > header 
            display: flex
            flex-direction: row
            justify-content: space-between
            align-content: center 
            align-items: center
            > div.desc-img
                display: flex
                > div.title-desc
                    display: flex
                    flex-direction: column
        

</style>

{#if show} 
    <div class="menu-interaction" in:fly="{{ y: 200, duration: 200 }}" out:fade>
        <header>
            <div class="desc-img">
                <div>
                    <img src="" alt="tile preview"/>
                </div>
                <div class="title-desc">
                    <h6>TILE NAME</h6>
                    <span>TILE DESCRIPTION</span>
                </div>
            </div>
            <div>
                <Button on:click={onClose} class="rounded-circle">
                    <Icon name="chevron-compact-down"/>
                </Button>
            </div>
        </header>
    </div>
{/if}

