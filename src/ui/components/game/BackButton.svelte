<script lang="ts">
    import {Button} from 'sveltestrap';
    import {replace} from 'svelte-spa-router';
</script>

<style lang="sass">
    .back 
        position: absolute
        top: 10px 
        left: 10px
</style>

<div class="back">
    <Button on:click={()=>replace("/")}>Back</Button>
</div>