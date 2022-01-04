<style lang="sass">
    @use "../../_variables"
    #portals 
       @include variables.overlay-menu()
       background: url("/background/portals_dt.jpg") var(--bs-dark) no-repeat
       background-size: cover
       > div.container-md
           height: 100%
           @include variables.flex-column-center()
           > div 
               height: 100%
               display: flex
               flex-direction: column 
               justify-content: center
    .island 
        width: 400px
        height: 400px
        display: flex 
        justify-content: center
        transition: 1.0s transform
        &:hover 
            transform: scale(1.2)
        &:active
            transform: translate(2px,2px)
        > img 
            height: 100%
            width: auto
</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import BackButton from './BackButton.svelte';
</script>

<div id="portals" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md">
        <header>
            <h3>Select a dimension</h3>
        </header>
        <div>
            <div class="island" id="main_world">
                <img src="/background/main_island.png" alt="current island"/>
            </div>
        </div>
    </div>
</div>