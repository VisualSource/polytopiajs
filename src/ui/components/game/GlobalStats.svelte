<style lang="sass">
    @use "../../_variables"
    #global-stats 
       @include variables.overlay-menu(variables.$z_menu)
       background-color: rgba(33, 37, 41, 0.8)
</style>

<script lang="ts">
    import {fade} from 'svelte/transition';
    import BackButton from './BackButton.svelte';
</script>

<div id="global-stats" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md">
        
    </div>
</div>