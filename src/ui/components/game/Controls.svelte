<script lang="ts">
    import {replace} from 'svelte-spa-router';
    import { _ } from 'svelte-i18n';
    import ControlsUI from '../../controllers/ControlsUI';
    const { turnText, turnColor, nextTurn } = new ControlsUI();
</script>

<style lang="sass">
    @use "../../_variables"
    #controls 
        @include variables.flex-row-center()
        z-index: variables.$z_base
        position: absolute
        bottom: 5px
        width: max-content
        margin: 0 auto
        left: 0
        right: 0
        gap: 6px
        > div.ctrl-btn
            opacity: 0.95
            color: var(--bs-light) 
            cursor: pointer
            @include variables.flex-column-center()
            &:hover
                transform: scale(1.1)
            &:active
                transform: translate(1px,1px)
            > span 
                user-select: none
            > div 
                @include variables.flex-column-center()
    .btn-size 
        width: 50px
        height: 50px

    .portal-bg 
        background: var(--bs-indigo)
            
</style>

<div id="controls">
    <div class="ctrl-btn" on:click={()=>replace("/playing/settings")}>
        <div role="button" class="rounded-circle border border-2 btn-size bg-dark">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>
            </svg>
        </div>
        <span>{$_("game.ui.btn.settings")}</span>
    </div>
    <div class="ctrl-btn" on:click={()=>replace("/playing/stats")}>
        <div role="button" class="rounded-circle border border-2 btn-size bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
            </svg>
        </div>
        <span>{$_("game.ui.btn.game_stats")}</span>
    </div>
    <div class="ctrl-btn" on:click={()=>replace("/playing/tech-tree")}>
        <div role="button" class="rounded-circle border border-2 btn-size bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                <g>
                    <rect fill="none" height="24" width="24"/>
                </g>
                <g>
                    <path d="M7,19c-1.1,0-2,0.9-2,2h14c0-1.1-0.9-2-2-2h-4v-2h3c1.1,0,2-0.9,2-2h-8c-1.66,0-3-1.34-3-3c0-1.09,0.59-2.04,1.47-2.57 c0.41,0.59,1.06,1,1.83,1.06c0.7,0.06,1.36-0.19,1.85-0.62l0.59,1.61l0.94-0.34l0.34,0.94l1.88-0.68l-0.34-0.94l0.94-0.34 L13.76,2.6l-0.94,0.34L12.48,2L10.6,2.68l0.34,0.94L10,3.97l0.56,1.55C9.39,5.48,8.37,6.27,8.08,7.38C6.27,8.14,5,9.92,5,12 c0,2.76,2.24,5,5,5v2H7z M12.86,4.52l1.71,4.7l-0.94,0.34l-1.71-4.7L12.86,4.52z M10.5,7c0.55,0,1,0.45,1,1c0,0.55-0.45,1-1,1 c-0.55,0-1-0.45-1-1C9.5,7.45,9.95,7,10.5,7z"/>
                </g>
            </svg>
        </div>
        <span>{$_("game.ui.btn.tech_tree")}</span>
    </div>
    <div class="ctrl-btn" on:click={()=>replace("/playing/portals")}>
        <div role="button" class="rounded-circle border border-2 btn-size portal-bg">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M19 19V4h-4V3H5v16H3v2h12V6h2v15h4v-2h-2zm-6 0H7V5h6v14zm-3-8h2v2h-2z"/>
            </svg>
        </div>
        <span>{$_("game.ui.btn.portal")}</span>
    </div>
    <div class="ctrl-btn">
        <div role="button" class={"rounded-circle border border-2 btn-size " + $turnColor} on:click={nextTurn}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                <path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
        </div>
        <span>{$_($turnText)}</span>
    </div>
</div>