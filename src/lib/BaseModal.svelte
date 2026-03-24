<script lang='ts'>
    import type { Snippet } from 'svelte';
    import { X } from 'lucide-svelte';

    let { open = $bindable(), title, maxWidth = '480px', children, icon }: {
        open: boolean;
        title: string;
        maxWidth?: string;
        children: Snippet;
        icon?: Snippet;
    } = $props();

    let closing = $state(false);
    let dialog: HTMLDialogElement;

    $effect(() => {
        if (open && !internalOpen) {
            internalOpen = true;
            dialog?.showModal();
        } else if (!open && internalOpen) {
            closing = true;
            setTimeout(() => {
                closing = false;
                internalOpen = false;
                dialog?.close();
            }, 150);
        }
    });

    let internalOpen = $state(false);
</script>

<dialog bind:this={dialog} class:closing onclose={() => open = false} style="max-width:{maxWidth}">
    <div class='modal-header'>
        <div class='title-row'>
            {#if icon}{@render icon()}{/if}
            <h2>{title}</h2>
        </div>
        <button onclick={() => open = false}><X size={16} /></button>
    </div>
    {@render children()}
</dialog>

<style>
    dialog {
        background: #111118;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        font-family: 'DM Sans', sans-serif;
        color: #f0ece4;
        padding: 0;
    }
    dialog::backdrop {
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        animation: fadeIn 0.2s ease both;
    }
    dialog[open]         { animation: slideUp   0.2s  ease both; }
    dialog[open].closing { animation: slideDown 0.15s ease both; }
    dialog[open].closing::backdrop { animation: slideDown 0.15s ease both; }

    @keyframes fadeIn   { from { opacity: 0; }                         to { opacity: 1; } }
    @keyframes slideUp  {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown{
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(16px); }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.25rem 0;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #e8a020;
    }

    h2 {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.4rem;
        color: #f0ece4;
        margin: 0;
        letter-spacing: 0.03em;
    }

    .modal-header button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px; height: 28px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: rgba(240,236,228,0.4);
        cursor: pointer;
        transition: color 0.15s;
    }
    .modal-header button:hover { color: #f0ece4; }
</style>
