<style lang="sass">
    @use "../../_variables"
    #game-settings 
       @include variables.overlay-menu(variables.$z_menu)
       background-color: rgba(33, 37, 41, 0.8)
       > div.container-md 
           height: 100%
           > div 
               gap: 15px
</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import { Button } from 'sveltestrap';
    import BackButton from './BackButton.svelte';
    import ToggleButton from './ToggleButton.svelte';
</script>

<div id="game-settings" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md d-flex flex-column justify-content-center align-content-center align-items-center">
        <h3 class="text-light"> -MENU- </h3>
        <label for="audio-v" class="form-label text-light">Audio Volume 50</label>
        <input type="range" class="form-range" id="audio-v">
        <div class="d-flex">
            <ToggleButton id="sound_effects" name="Sound Effects" />
            <ToggleButton id="ambience" name="Ambience" />
            <ToggleButton id="tribe_music" name="Tribe Music" />
        </div>
        <hr/>
        <div class="d-flex">
            <ToggleButton id="suggestions" name="Suggestions" />
            <ToggleButton id="info_on_build" name="Info on Build" />
            <ToggleButton id="confirm_turn" name="Confirm turn" />
        </div>
        <hr/>
        <Button color="danger">EXIT TO MENU</Button>
    </div>
</div>