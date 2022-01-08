<script lang="ts">
    import { replace } from 'svelte-spa-router';
    import {fade} from 'svelte/transition';
    import { Button } from 'sveltestrap';
</script>

<style lang="sass">
    @use "../../_variables"
    #turn-change
        @include variables.overlay-menu(variables.$z_menu)
        background: black 
        > div.container-md 
            height: 100%
            @include variables.flex-column-center()
            > div.icon 
                height: 50px
                width: 5px
</style>

<div id="turn-change" in:fade="{{duration: 10}}" out:fade="{{duration: 10}}">
    <div class="container-md">
        <h3>-Next up-</h3>
        <h3>NAME</h3>

        <div class="icon">HEAD ICON</div>

        <Button color="primary" on:click={()=>replace("/")}>START</Button>

        <Button color="link" class="text-light" on:click={()=>replace("/")}>Exit</Button>
    </div>
</div>