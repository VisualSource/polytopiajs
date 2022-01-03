<style lang="sass">
    @use "../../_variables"
    #game-settings 
       @include variables.overlay-menu()
       background-color: var(--bs-dark)
</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import {Button} from 'sveltestrap';
    import {replace} from 'svelte-spa-router';
</script>

<div id="game-settings" in:fade="{{duration: 500}}">
    <Button on:click={()=>replace("/")}>Back</Button>
</div>