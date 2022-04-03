<style lang="sass">
    @use "../../../_variables"
    #tech-tree 
        @include variables.flex-column()
        @include variables.overlay-menu(variables.$z_techtree)
        background-color: black
        > div.container-md 
            height: 100%
            gap: 20px
    .tech-row 
        display: flex 
        flex-direction: row
        align-items: center
        align-content: center
    .tech-col 
        display: flex
        flex-direction: column
        width: max-content
        gap: 15px
    .line-owned
        background: var(--bs-success)
    .line-available
        background: var(--bs-primary)
    .line-required 
        background: var(--bs-danger)
    .line 
        height: 5px 
        width: 15em
        margin: 0

</style>

<script lang="ts">
    import {fade} from 'svelte/transition'
    import TechItem from './TechItem.svelte';
    import BackButton from '../shared/BackButton.svelte';
    import Game from '../../../../game/core/Game';

    const game = new Game();

    const p = game.players.getActivePlayer();

    const tier_one_cost = (): number => {
        return 1 * p.citys + 4;
    }
    const tier_two_cost = (): number => {
        return 2 * p.citys + 4;
    }
    const tier_three_cost = (): number => {
        return 3 * p.citys + 4;
    }

    const tier_one = () => {
        return p.stars >= tier_one_cost();
    }

    const tier_two = () => {
        return p.stars >= tier_two_cost();
    }
    
    const tier_three = () => {
        return p.stars >= tier_three_cost();
    }

    

</script>

<div id="tech-tree" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md d-flex flex-column justify-content-center">
        <div class="row tech-row">
            <TechItem pre={true} canbuy={tier_one()} owned={p.tech.riding} title="Riding" cost={tier_one_cost()}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.riding} canbuy={tier_two()} owned={p.tech.free_spirit} title="Free spirit" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.free_spirit} canbuy={tier_three()} owned={p.tech.chivalry} title="Chivalry" cost={tier_three_cost()}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.riding} canbuy={tier_two()} owned={p.tech.roads} title="Roads" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.roads} canbuy={tier_three()} owned={p.tech.trade} title="Trade" cost={tier_three_cost()}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={tier_one()} owned={p.tech.organization} title="Organization" cost={tier_one_cost()}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.organization} canbuy={tier_two()} owned={p.tech.farming} title="Farming" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.farming} canbuy={tier_three()} owned={p.tech.construction} title="Construction" cost={tier_three_cost()}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.organization} canbuy={tier_two()} owned={p.tech.shields} title="Shields" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.shields} canbuy={tier_three()} owned={false} cost={tier_three_cost()}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={tier_one()} owned={p.tech.climbing} title="Climbing" cost={tier_one_cost()}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.climbing} canbuy={tier_two()} owned={p.tech.mining} title="Mining" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.mining} canbuy={tier_three()} owned={p.tech.smithery} title="Smithery" cost={tier_three_cost()}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.climbing} canbuy={tier_two()} owned={p.tech.meditation} title="Mediation" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.meditation} canbuy={tier_three()} owned={p.tech.philosophy} title="Philosophy" cost={tier_three_cost()}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={tier_one()} owned={p.tech.fishing} title="Fishing" cost={tier_one_cost()}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.fishing} canbuy={tier_two()} owned={p.tech.whaling} title="Whaling" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.whaling} canbuy={tier_three()} owned={p.tech.aquatism} title="Aquatism" cost={tier_three_cost()}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.fishing} canbuy={tier_two()} owned={p.tech.sailing} title="Sailing" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.navigation} canbuy={tier_three()} owned={p.tech.navigation} title="Navigation" cost={tier_three_cost()}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={tier_one()} owned={p.tech.hunting} title="Hunting" cost={tier_one_cost()}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.hunting} canbuy={tier_two()} owned={p.tech.archery} title="Archery" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.archery} canbuy={tier_three()} owned={p.tech.spiritualism} title="Spirtualisms" cost={tier_three_cost()}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.hunting} canbuy={tier_two()} owned={p.tech.forestry} title="Forestry" cost={tier_two_cost()}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.forestry} canbuy={tier_three()} owned={p.tech.mathematics} title="Mathematices" cost={tier_three_cost()}/>
                </div>
            </div>
        </div>
    </div>
</div>