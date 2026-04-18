<script lang='ts'>
    import { TriangleAlert } from 'lucide-svelte';
    import BaseModal from './BaseModal.svelte';

    let { open = $bindable(), message, confirmLabel = 'Confirm', onConfirm }: {
        open: boolean;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
    } = $props();

    function handleConfirm() {
        onConfirm();
        open = false;
    }
</script>

<BaseModal bind:open={open} title={'Start Fresh'}>
    {#snippet icon()}
        <TriangleAlert size={16} class='warn-icon' />
    {/snippet}

    <div class='modal-body'>
        <p>{message}</p>
    </div>

    <div class='modal-footer'>
        <button class='btn btn-ghost' onclick={() => open = false}>Cancel</button>
        <button class='btn btn-danger' onclick={handleConfirm}>{confirmLabel}</button>
    </div>
</BaseModal>

<style>
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
