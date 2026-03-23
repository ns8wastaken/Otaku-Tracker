<script lang='ts'>
    import { ChevronDown } from 'lucide-svelte';

    let { value = $bindable(), options, id }: {
        value: string;
        options: { label: string; value: string }[];
        id?: string;
    } = $props();

    let open = $state(false);
    let container: HTMLDivElement;

    const selected = $derived(options.find(o => o.value === value));

    function select(val: string) {
        value = val;
        open = false;
    }

    function handleOutsideClick(e: MouseEvent) {
        if (!container.contains(e.target as Node)) open = false;
    }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class='dropdown' bind:this={container}>
    <button {id} class='trigger' onclick={() => open = !open} type='button'>
        <span class='sizer' aria-hidden='true'>
            {#each options as option}<span>{option.label}</span>{/each}
        </span>
        <span>{selected?.label ?? 'Select...'}</span>
        <span class='chevron' class:rotated={open}>
            <ChevronDown size={14} />
        </span>
    </button>
    {#if open}
        <div class='menu'>
            {#each options as option}
                <button
                    class='option'
                    class:active={option.value === value}
                    onclick={() => select(option.value)}
                    type='button'
                >{option.label}</button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .dropdown {
        position: relative;
    }

    .sizer {
        display: flex;
        flex-direction: column;
        visibility: hidden;
        max-height: 0;
        overflow: hidden;
        pointer-events: none;
        white-space: nowrap;
    }

    .trigger {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.55rem 0.75rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        color: #f0ece4;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        cursor: pointer;
        transition: border-color 0.15s;
        text-align: left;
        box-sizing: border-box;
    }

    .trigger span:first-child, /* sizer */
    .trigger span:nth-child(2) { /* visible label */
        grid-column: 1;
        grid-row: 1;
    }

    .trigger:hover { border-color: rgba(255,255,255,0.15); }

    .chevron {
        margin-left: 0.55rem;
        display: flex;
        transition: transform 0.15s;
        grid-column: 2;
        grid-row: 1;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    .menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: #1a1a24;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        overflow: hidden;
        z-index: 200;
        animation: fadeIn 0.1s ease both;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .option {
        display: block;
        width: 100%;
        padding: 0.6rem 0.75rem;
        background: transparent;
        border: none;
        color: rgba(240,236,228,0.6);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        text-align: left;
        cursor: pointer;
        transition: background 0.1s, color 0.1s;
    }

    .option:hover {
        background: rgba(255,255,255,0.05);
        color: #f0ece4;
    }

    .option.active {
        color: #dc3c3c;
        background: rgba(220,60,60,0.08);
    }
</style>
