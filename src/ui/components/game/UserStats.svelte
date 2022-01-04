<script lang="ts">
    import StatsUI from '../../controllers/StatsUI';

    const {score, star_gain, stars, turn} = new StatsUI();
</script>

<style lang="sass">
    @use "../../_variables"
    #stats
        position: absolute 
        top: 5px 
        color: darken(#f8f9fa, 10%)
        display: flex 
        gap: 5px
        right: 0
        left: 0
        margin: 0 auto
        user-select: none
        z-index: variables.$z_scores
        width: max-content
        > div 
            @include variables.flex-column-center()
            > h6, span 
                font-weight: bold
            

</style>

<div id="stats">
    <div id="score">
        <h6>Score</h6>
        <span>{$score}</span>
    </div>
    <div id="stars">
        <h6>Stars (+{$star_gain})</h6>
        <span>{$stars}</span>
    </div>
    <div id="turn">
        <h6>Turn</h6>
        <span>{$turn}</span>
    </div>
</div>