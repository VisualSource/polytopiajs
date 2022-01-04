<style lang="sass">
    .tech 
        background: var(--bs-light)
        height: 80px 
        width: 80px
        &:hover 
            transform: scale(1.1)
        &:active 
            transform: translate(1px,1px)
    .tech-owned
        background: var(--bs-success)
    .tech-available
        background: var(--bs-primary)
    .tech-required
        background: var(--bs-warning)
    .tech-no-buy
        background: var(--bs-danger)
</style>

<script lang="ts">
    export let pre: boolean = false;
    export let owned: boolean = false;
    export let canbuy: boolean = false;
    // owned = 0
    // avaiable = 1
    // required = 2

    const state = (): string => {
        if(!pre) return "tech-required";
        if(!canbuy) return "tech-no-buy";
        if(owned) return "tech-owned";
        return "tech-available";
    }

    const onClick = () => {}
</script>

<div class={`tech ${state()} border border-2 rounded-circle`} on:click={onClick}>
    
</div>