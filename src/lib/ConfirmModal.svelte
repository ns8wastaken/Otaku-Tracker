<script lang='ts'>
    import { X, TriangleAlert } from 'lucide-svelte';

    let { open = $bindable(), title, message, confirmLabel = 'Confirm', onConfirm }: {
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
    } = $props();

    let dialog: HTMLDialogElement;

    $effect(() => {
        if (open) dialog?.showModal();
        else dialog?.close();
    });

    function handleConfirm() {
        onConfirm();
        open = false;
    }
</script>

<dialog bind:this={dialog} onclose={() => open = false}>
    <div class='modal-header'>
        <div class='title-row'>
            <TriangleAlert size={16} class='warn-icon' />
            <h2>{title}</h2>
        </div>
        <button onclick={() => open = false}><X size={16} /></button>
    </div>

    <div class='modal-body'>
        <p>{message}</p>
    </div>

    <div class='modal-footer'>
        <button class='btn btn-ghost' onclick={() => open = false}>Cancel</button>
        <button class='btn btn-danger' onclick={handleConfirm}>{confirmLabel}</button>
    </div>
</dialog>

<style>
    dialog {
        background: #111118;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        width: 100%;
        max-width: 360px;
        font-family: 'DM Sans', sans-serif;
        color: #f0ece4;
        padding: 0;
    }

    dialog::backdrop {
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
    }

    dialog[open] {
        animation: fadeIn 0.2s ease both;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
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
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: rgba(240,236,228,0.4);
        cursor: pointer;
        transition: color 0.15s;
    }

    .modal-header button:hover { color: #f0ece4; }

    .modal-body {
        padding: 1rem 1.25rem 1.25rem;
    }

    p {
        margin: 0;
        font-size: 0.9rem;
        color: rgba(240,236,228,0.6);
        line-height: 1.5;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0 1.25rem 1.25rem;
    }

    .btn {
        padding: 0.5rem 1.25rem;
        font-size: 0.82rem;
    }

    .btn-danger {
        border: 1px solid rgba(239,68,68,0.35);
        background: rgba(239,68,68,0.1);
        color: #ef4444;
        transition: all 0.15s;
    }

    .btn-danger:hover {
        background: rgba(239,68,68,0.18);
        border-color: rgba(239,68,68,0.55);
    }
</style>
