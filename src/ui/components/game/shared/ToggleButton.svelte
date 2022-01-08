<script lang="ts">
import { writable } from 'svelte/store';

    import { Button } from 'sveltestrap';
    export let on = writable<boolean>(true);
    export let id: string = "";
    export let name: string = "";
    
    const toggle = () => (on.update((value)=>!value));
</script>

<div class="d-flex flex-column justify-content-center align-items-center align-content-center">
    <label for={id} class="text-light">{name}</label>
    <Button on:click={toggle} color={$on ? "primary" : "secondary"} id={id}>{ $on ? "ON" : "OFF" }</Button>
</div>