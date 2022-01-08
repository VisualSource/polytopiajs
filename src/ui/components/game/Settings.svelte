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
    import BackButton from './shared/BackButton.svelte';
    import ToggleButton from './shared/ToggleButton.svelte';

    import SettingsUI from '../../controllers/SettingsUI';
    import { onDestroy } from 'svelte';
    const { volume, sound_effects, ambience, tribe_music, suggestions, info_on_build, confirm_turn, destory } = new SettingsUI();

    onDestroy(()=>{
        destory();
    });
</script>

<div id="game-settings" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md d-flex flex-column justify-content-center align-content-center align-items-center">
        <h3 class="text-light"> -MENU- </h3>
        <label for="audio-v" class="form-label text-light">Audio Volume {$volume}</label>
        <input type="range" class="form-range" id="audio-v" bind:value={$volume}>
        <div class="d-flex">
            <ToggleButton id="sound_effects" name="Sound Effects"  on={sound_effects} />
            <ToggleButton id="ambience" name="Ambience" on={ambience}/>
            <ToggleButton id="tribe_music" name="Tribe Music" on={tribe_music} />
        </div>
        <hr/>
        <div class="d-flex">
            <ToggleButton id="suggestions" name="Suggestions" on={suggestions} />
            <ToggleButton id="info_on_build" name="Info on Build" on={info_on_build}/>
            <ToggleButton id="confirm_turn" name="Confirm turn" on={confirm_turn}/>
        </div>
        <hr/>
        <Button color="danger">EXIT TO MENU</Button>
    </div>
</div>