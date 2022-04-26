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
    import type Player from '../../../../game/managers/Player';

    const game = Game.Get();
    let p: Player;
    game.players.active.player.subscribe(value=>{ p = value; });

    // (technology tier) × (number of cities) + 4. 
    const tech_cost = (level: number): number => {
        return level + p.citys + 4;
    }

    const can_buy = (level: number) => {
        return p.stars >= tech_cost(level);
    }

</script>

<div id="tech-tree" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md d-flex flex-column justify-content-center">
        <div class="row tech-row">
            <TechItem pre={true} canbuy={can_buy(1)} owned={p.tech.riding} title="Riding" cost={tech_cost(1)}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.riding} canbuy={can_buy(2)} owned={p.tech.free_spirit} title="Free spirit" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.free_spirit} canbuy={can_buy(3)} owned={p.tech.chivalry} title="Chivalry" cost={tech_cost(3)}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.riding} canbuy={can_buy(2)} owned={p.tech.roads} title="Roads" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.roads} canbuy={can_buy(3)} owned={p.tech.trade} title="Trade" cost={tech_cost(3)}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={can_buy(1)} owned={p.tech.organization} title="Organization" cost={tech_cost(1)}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.organization} canbuy={can_buy(2)} owned={p.tech.farming} title="Farming" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.farming} canbuy={can_buy(3)} owned={p.tech.construction} title="Construction" cost={tech_cost(3)}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.organization} canbuy={can_buy(2)} owned={p.tech.shields} title="Shields" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.shields} canbuy={can_buy(3)} owned={false} cost={tech_cost(3)}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={can_buy(1)} owned={p.tech.climbing} title="Climbing" cost={tech_cost(1)}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.climbing} canbuy={can_buy(2)} owned={p.tech.mining} title="Mining" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.mining} canbuy={can_buy(3)} owned={p.tech.smithery} title="Smithery" cost={tech_cost(3)}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.climbing} canbuy={can_buy(2)} owned={p.tech.meditation} title="Mediation" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.meditation} canbuy={can_buy(3)} owned={p.tech.philosophy} title="Philosophy" cost={tech_cost(3)}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={can_buy(1)} owned={p.tech.fishing} title="Fishing" cost={tech_cost(1)}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.fishing} canbuy={can_buy(2)} owned={p.tech.whaling} title="Whaling" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.whaling} canbuy={can_buy(3)} owned={p.tech.aquatism} title="Aquatism" cost={tech_cost(3)}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.fishing} canbuy={can_buy(2)} owned={p.tech.sailing} title="Sailing" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.navigation} canbuy={can_buy(3)} owned={p.tech.navigation} title="Navigation" cost={tech_cost(3)}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={can_buy(1)} owned={p.tech.hunting} title="Hunting" cost={tech_cost(1)}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={p.tech.hunting} canbuy={can_buy(2)} owned={p.tech.archery} title="Archery" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.archery} canbuy={can_buy(3)} owned={p.tech.spiritualism} title="Spirtualisms" cost={tech_cost(3)}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={p.tech.hunting} canbuy={can_buy(2)} owned={p.tech.forestry} title="Forestry" cost={tech_cost(2)}/>
                    <hr class="line line-required"/>
                    <TechItem pre={p.tech.forestry} canbuy={can_buy(3)} owned={p.tech.mathematics} title="Mathematices" cost={tech_cost(3)}/>
                </div>
            </div>
        </div>
    </div>
</div>