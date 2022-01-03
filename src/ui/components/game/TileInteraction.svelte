<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { Button } from 'sveltestrap';
    import TileUI from '../../controllers/TileUI';

    const { show, name, description, onClose, canvas, actions, onAction } = new TileUI();

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
        z-index: variables.$z_tiles
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

{#if $show } 
    <div id="tile-actions" class="bg-dark" in:fly="{{ y: 200, duration: 200 }}" out:fade>
        <header>
            <div class="preview">
                <div class="preview-img">
                  <canvas bind:this={$canvas} width="60" height="60"></canvas>
                </div>
                <div class="title-desc">
                    <h6>
                        <strong>{$name}</strong>
                    </h6>
                    <span>{$description}</span>
                </div>
            </div>
            <div>
                <Button on:click={onClose} class="rounded-circle bg-light">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
                        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                    </svg>
                </Button>
            </div>
        </header>
        {#if $actions.length > 0 }
            <main class="border-top border-light">
                {#each $actions as action}
                    <div class="rounded-circle border border-3 bg-primary tile-action" on:click={()=>onAction(action)}>{action.id}</div>
                {/each}
            </main>
        {/if}
    </div>
{/if}

