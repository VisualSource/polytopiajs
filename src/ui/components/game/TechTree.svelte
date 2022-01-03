<style lang="sass">
    @use "../../_variables"
    #tech-tree 
        @include variables.overlay-menu()
        background-color: var(--bs-dark)
        > canvas 
            display: block
            height: 100%
            width: 100%
        > .back 
            position: absolute
</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import {Button} from 'sveltestrap';
    import {replace} from 'svelte-spa-router';
    import { onMount } from 'svelte';

    let canvas: HTMLCanvasElement;

    onMount(()=>{
        //@ts-ignore
        let a = canvas?.getContext("2d");
        if(a){
            a.strokeStyle = "red";
            a.strokeRect(canvas.width/ 2, canvas.height/ 2,20,20);
        }
    });
        
    
</script>

<div id="tech-tree" in:fade="{{duration: 500}}">
    <div class="back">
        <Button on:click={()=>replace("/")}>Back</Button>
    </div>
    <canvas bind:this={canvas}></canvas>
</div>