<style lang="sass">
    @use "../../../_variables"
    #tech-tree 
        @include variables.flex-column()
        @include variables.overlay-menu()
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
    import BackButton from '../BackButton.svelte';
</script>

<div id="tech-tree" in:fade="{{duration: 200}}" out:fade="{{duration: 200}}">
    <BackButton/>
    <div class="container-md d-flex flex-column justify-content-center">
        <div class="row tech-row">
            <TechItem pre={true} canbuy={true} owned={false}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={true} owned={false}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={true} owned={false}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={true} owned={false}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={true} owned={false}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
            </div>
        </div>
        <div class="row tech-row">
            <TechItem pre={true} canbuy={true} owned={false}/>
            <hr class="line line-required"/>
            <div class="tech-col">
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
                <div class="tech-row">
                    <TechItem pre={true} canbuy={true} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                    <hr class="line line-required"/>
                    <TechItem pre={false} canbuy={false} owned={false}/>
                </div>
            </div>
        </div>
    </div>
</div>