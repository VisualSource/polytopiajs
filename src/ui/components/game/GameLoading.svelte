<script lang="ts">
    import {fade} from 'svelte/transition';
</script>

<style lang="sass">
    @use "../../_variables"
    #turn-change
        @include variables.overlay-menu(variables.$z_loading)
        background: black 
        > div.container-md 
            height: 100%
            @include variables.flex-column-center()
            > div.icon 
                height: 50px
                width: 5px
</style>

<div id="turn-change" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <div class="container-md">
        <!--<img src="" alt="-LOADING-">-->
        <iframe title="loading" src="https://giphy.com/embed/xUOxfj6cTg3ezmjIoo" width="480" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
        <h1>-LOADING-</h1>
    </div>
</div>