<script lang='ts'>
    import BaseModal from './BaseModal.svelte';
    import { Trash2 } from 'lucide-svelte';
    import { Status, MediaType, Rating, createEntry, updateEntry } from '../../types/media';
    import type { TrackedMedia } from '../../types/media';
    import Dropdown from '../Dropdown.svelte';

    let { open = $bindable(), entry, onSave, onDelete }: {
        open: boolean;
        entry: TrackedMedia | null;
        onSave: (entry: TrackedMedia) => void;
        onDelete?: (id: string) => void;
    } = $props();

    let title    = $state('');
    let type     = $state<MediaType>(MediaType.Anime);
    let status   = $state<Status>(Status.Watching);
    let progress = $state(0);
    let total    = $state<number | undefined>(undefined);
    let rating   = $state<Rating>(Rating.Normal);
    let notes    = $state('');

    $effect(() => {
        if (open) {
            title    = entry?.title         ?? '';
            type     = entry?.type          ?? MediaType.Anime;
            status   = entry?.status        ?? Status.Watching;
            progress = entry?.progress      ?? 0;
            total    = entry?.totalProgress ?? undefined;
            rating   = entry?.rating        ?? Rating.Normal;
            notes    = entry?.notes         ?? '';
        }
    });

    function handleSave() {
        if (!title.trim()) return;
        const data = {
            title: title.trim(),
            type, status, progress,
            totalProgress: total || undefined,
            rating,
            notes: notes.trim() || undefined,
        };
        onSave(entry ? updateEntry(entry, data) : createEntry(data));
        open = false;
    }

    function handleDelete() {
        if (entry && onDelete) {
            onDelete(entry.id);
            open = false;
        }
    }

    const progressUnit = $derived(type === MediaType.Manga ? 'Chapter' : 'Episode');
    const statusUnit = $derived(type === MediaType.Manga ? 'Read' : 'Watch');

    const typeOptions = [
        { label: 'Anime', value: MediaType.Anime },
        { label: 'Manga', value: MediaType.Manga },
    ];

    const statusOptions = $derived([
        { label: `${statusUnit}ing`, value: Status.Watching },
        { label: 'Completed',        value: Status.Completed },
        { label: `To ${statusUnit}`, value: Status.ToWatch },
        { label: 'On Hold',          value: Status.OnHold },
        { label: 'Dropped',          value: Status.Dropped },
    ]);
</script>

<BaseModal bind:open={open} title={entry ? 'Edit Entry' : 'New Entry'}>
    <div class='modal-body'>
        <div class='field'>
            <label for='f-title'>Title</label>
            <input id='f-title' type='text' bind:value={title} placeholder='e.g. Berserk' />
        </div>

        <div class='field-row'>
            <div class='field'>
                <label for='f-type'>Type</label>
                <Dropdown bind:value={type} options={typeOptions} id='f-type' />
            </div>
            <div class='field'>
                <label for='f-status'>Type</label>
                <Dropdown bind:value={status} options={statusOptions} id='f-status' />
            </div>
        </div>

        <div class='field-row'>
            <div class='field'>
                <label for='f-progress'>{progressUnit}</label>
                <input id='f-progress' type='number' bind:value={progress} min='0' />
            </div>
            <div class='field'>
                <label for='f-total'>Total {progressUnit}s</label>
                <input id='f-total' type='number' bind:value={total} min='0' placeholder='?' />
            </div>
        </div>

        <div class='field'>
            <label for='rating-group'>Rating</label>
            <div class='rating-group'>
                {#each Object.entries(Rating) as [key, val]}
                    <button
                        class='btn rating-btn'
                        class:active={rating === val}
                        onclick={() => rating = val}
                    >{key}</button>
                {/each}
            </div>
        </div>

        <div class='field'>
            <label for='f-notes'>Notes</label>
            <textarea id='f-notes' bind:value={notes} placeholder='Your thoughts...'></textarea>
        </div>
    </div>
    <div class='modal-footer'>
        {#if entry && onDelete}
            <button class='btn btn-delete' onclick={handleDelete}>
                <Trash2 size={14} />
                Delete
            </button>
        {/if}
        <div class='footer-right'>
            <button class='btn btn-ghost' onclick={() => open = false}>Cancel</button>
            <button class='btn btn-primary' onclick={handleSave} disabled={!title.trim()}>
                {entry ? 'Save changes' : 'Add entry'}
            </button>
        </div>
    </div>
</BaseModal>

<style>
    .modal-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(240,236,228,0.35);
        font-weight: 500;
    }

    input, textarea {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        color: #f0ece4;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        padding: 0.55rem 0.75rem;
        outline: none;
        transition: border-color 0.15s;
        width: 100%;
        box-sizing: border-box;
    }

    input:focus, textarea:focus {
        border-color: rgba(220,60,60,0.5);
    }

    input::placeholder, textarea::placeholder {
        color: rgba(240,236,228,0.2);
    }

    textarea {
        resize: vertical;
        min-height: 80px;
    }

    .rating-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
    }

    .rating-btn {
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        color: rgba(240,236,228,0.45);
        transition: all 0.15s;
    }

    .rating-btn:hover {
        border-color: rgba(220,60,60,0.3);
        color: #f0ece4;
    }

    .rating-btn.active {
        background: rgba(220,60,60,0.12);
        border-color: rgba(220,60,60,0.4);
        color: #dc3c3c;
    }

    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.25rem 1.25rem;
        gap: 0.75rem;
    }

    .footer-right {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
    }

    .btn-delete {
        gap: 4px;
        border: 1px solid rgba(239,68,68,0.25);
        background: transparent;
        color: rgba(239,68,68,0.6);
        font-size: 0.82rem;
        transition: all 0.15s;
    }

    .btn-delete:hover {
        background: rgba(239,68,68,0.08);
        color: #ef4444;
        border-color: rgba(239,68,68,0.4);
    }

    .btn {
        padding: 0.5rem 1.25rem;
        font-size: 0.82rem;
    }

    input[type='number'] {
        appearance: textfield;
    }
</style>
