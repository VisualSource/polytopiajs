<style lang="sass">
    .tech 
        background: var(--bs-light)
        height: 80px 
        width: 80px
        display: flex 
        flex-direction: column 
        justify-content: center
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
    import {Button, Modal, ModalBody,ModalHeader,ModalFooter} from "sveltestrap";
    export let pre: boolean = false;
    export let owned: boolean = false;
    export let canbuy: boolean = false;
    export let title: string = ""; 
    export let cost: number = 0;
    let open = false;

    const toggle = () => (open = !open)
  
    const state = (): string => {
        if(owned) return "tech-owned";
        if(!pre) return "tech-required";
        if(!canbuy) return "tech-no-buy";
        return "tech-available";
    }
</script>

<Modal isOpen={open} class="text-light">
    <ModalHeader class="bg-dark border-dark" {toggle}>{title} { !pre ? "(LOCKED)" : owned ? "(COMPLECTED)" : "" }</ModalHeader>
    <ModalBody class="bg-dark border-dark">
        This tech will eable the following:
    </ModalBody>
    <ModalFooter class="bg-dark border-dark">
        <Button color={pre && !owned ? "secondary": "primary"} on:click={toggle}>BACK</Button>
        {#if pre && !owned}
            <Button color={canbuy ? "primary" : "danger"} on:click={toggle} disabled={!canbuy}>RESEARCH</Button> 
        {/if}
    </ModalFooter>
</Modal>

<div class={`tech ${state()} border border-2 rounded-circle`} on:click={toggle}>
    {title}
    {!pre || owned ? "" : cost }
</div>