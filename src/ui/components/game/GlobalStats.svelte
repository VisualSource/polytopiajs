<style lang="sass">
    @use "../../_variables"
    #global-stats 
       @include variables.overlay-menu()
       background-color: var(--bs-dark)
</style>

<script lang="ts">
    import {fade} from 'svelte/transition';
    import {Button} from 'sveltestrap';
    import {replace} from 'svelte-spa-router';
</script>

<div id="global-stats" in:fade="{{duration: 500}}">
    <Button on:click={()=>replace("/")}>Back</Button>
</div>