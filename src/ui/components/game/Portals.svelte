<style lang="sass">
    @use "../../_variables"
    #portals 
       @include variables.overlay-menu()
       background-color: var(--bs-dark)
       > canvas 
           background: black
           display: block
</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import {Button} from 'sveltestrap';
    import {replace} from 'svelte-spa-router';

    let canvas: HTMLCanvasElement;
</script>

<div id="portals" in:fade="{{duration: 500}}">
    <Button on:click={()=>replace("/")}>Back</Button>
    <canvas bind:this={canvas}></canvas>
</div>