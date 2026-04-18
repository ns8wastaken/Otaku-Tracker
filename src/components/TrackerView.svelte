<script lang='ts'>
    import {
        Search,
        SlidersHorizontal,
        Download,
        Plus,
        ChartBar,
        House
    } from 'lucide-svelte';
    import type { TrackedMedia } from '../types/media';
    import { Status, MediaType } from '../types/media';
    import * as DB from '../services/db';
    import { exportData } from '../features/importExport';
    import EntryModal from './modal/EntryModal.svelte';
    import Dropdown from './Dropdown.svelte';
    import { Sorting } from '../types/trackerview';
    import { appState, View } from '../state.svelte';
    import StatsModal from './modal/StatsModal.svelte';
    import EntryCard from './EntryCard.svelte';
    import { statusColor } from '../constants/media';
    import { filterAndSort } from '../features/filter';
    import { computeStats } from '../features/stats';

    let statsModalOpen = $state(false);

    let modalOpen = $state(false);
    let modalEntry = $state<TrackedMedia | null>(null);

    function handleAdd() {
        modalEntry = null;
        modalOpen = true;
    }

    function handleEdit(entry: TrackedMedia) {
        modalEntry = entry;
        modalOpen = true;
    }

    async function handleSave(entry: TrackedMedia) {
        await DB.save(entry);
        appState.entries = await DB.getAll();
    }

    async function handleDelete(id: string) {
        await DB.remove(id);
        appState.entries = appState.entries.filter(e => e.id !== id);
    }

    let search = $state('');
    let activeStatus = $state<string>('all');
    let activeType = $state<string>('all');
    let sort = $state<Sorting>(Sorting.Title);

    const filtered = $derived(filterAndSort(
        appState.entries,
        search,
        activeStatus,
        activeType,
        sort
    ));
    const stats = $derived(computeStats(appState.entries));

    const statusTabs = [
        { label: 'All',       value: 'all' },
        { label: 'Watching',  value: Status.Watching },
        { label: 'Completed', value: Status.Completed },
        { label: 'To Watch',  value: Status.ToWatch },
        { label: 'On Hold',   value: Status.OnHold },
        { label: 'Dropped',   value: Status.Dropped },
    ];

    const statItems = $derived([
        { label: 'Total',    value: stats.total,     color: undefined },
        { label: 'Manga',    value: stats.manga,     color: undefined },
        { label: 'Anime',    value: stats.anime,     color: undefined },
        { label: 'Watching', value: stats.watching,  color: statusColor[Status.Watching] },
        { label: 'Done',     value: stats.completed, color: statusColor[Status.Completed] },
        { label: 'On Hold',  value: stats.onhold,    color: statusColor[Status.OnHold] },
        { label: 'Dropped',  value: stats.dropped,   color: statusColor[Status.Dropped] },
        { label: 'To Watch', value: stats.towatch,   color: statusColor[Status.ToWatch] },
    ]);

    const typeOptions = [
        { label: 'All',   value: 'all' },
        { label: 'Anime', value: MediaType.Anime },
        { label: 'Manga', value: MediaType.Manga },
    ]

    const sortOptions = [
        { label: 'Recently updated', value: Sorting.Updated },
        { label: 'Title A-Z',        value: Sorting.Title },
        { label: 'Rating',           value: Sorting.Rating },
        { label: 'Progress',         value: Sorting.Progress },
    ]
</script>

<StatsModal bind:open={statsModalOpen} />
<EntryModal bind:open={modalOpen} entry={modalEntry} onSave={handleSave} onDelete={handleDelete} />

<div class='tracker'>
    <div class='topbar'>
        <div class='stats'>
            {#each statItems as stat, i}
                {#if i > 0}<div class='stat-sep'></div>{/if}
                <div class='stat'>
                    <span class='stat-val' style={stat.color ? `color:${stat.color}` : ''}>{stat.value}</span>
                    <span class='stat-label'>{stat.label}</span>
                </div>
            {/each}
            <button class='icon-btn' onclick={() => statsModalOpen = true}>
                <ChartBar size={15} />
            </button>
        </div>
        <div class='topbar-actions'>
            <button class='icon-btn' onclick={exportData} title='Export JSON'>
                <Download size={15} />
            </button>
            <button class='btn-add' onclick={handleAdd}>
                <Plus size={15} />
                Add
            </button>
        </div>
    </div>

    <div class='controls'>
        <div class='search-wrap'>
            <Search size={14} class='search-icon' />
            <input
                class='search'
                type='text'
                placeholder='Search...'
                bind:value={search}
            />
        </div>
        <Dropdown bind:value={sort} options={sortOptions}/>
        <Dropdown bind:value={activeType} options={typeOptions}/>
    </div>

    <div class='tabs'>
        {#each statusTabs as tab}
            <button
                class='tab'
                class:active={activeStatus === tab.value}
                onclick={() => activeStatus = tab.value}
            >
                {tab.label}
            </button>
        {/each}
    </div>

    {#if filtered.length === 0}
        <div class='empty'>
            <div class='empty-icon'>
                <SlidersHorizontal size={32} />
            </div>
            <p>No entries found</p>
        </div>
    {:else}
        <div class='grid'>
            {#each filtered as entry, i (entry.id)}
                <EntryCard {entry} {handleEdit} index={i} />
            {/each}
        </div>
    {/if}
</div>

<button
    class="btn-home"
    onclick={() => appState.view = View.Welcome}
    title="Back to Welcome Page"
>
    <House size={20} />
</button>

<style>
    .tracker {
        min-height: 100vh;
        background: #0a0a0f;
        padding: 1.5rem;
        font-family: 'DM Sans', sans-serif;
        color: #f0ece4;
    }

    .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .stats {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
    }

    .stat-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.4rem;
        line-height: 1;
        color: #f0ece4;
    }

    .stat-label {
        font-size: 0.68rem;
        color: rgba(240, 236, 228, 0.35);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .stat-sep {
        width: 1px;
        height: 28px;
        background: rgba(255,255,255,0.08);
    }

    .topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.1);
        background: transparent;
        color: rgba(240,236,228,0.5);
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
    }

    .icon-btn:hover {
        color: #f0ece4;
        border-color: rgba(255,255,255,0.2);
    }

    .btn-add {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 1rem;
        height: 34px;
        border-radius: 6px;
        background: #dc3c3c;
        border: none;
        color: #fff;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.15s;
    }

    .btn-add:hover { opacity: 0.85; }

    .controls {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .search-wrap {
        position: relative;
        flex: 1;
        width: 180px;
        display: flex;
        align-items: center;
    }

    .search-wrap :global(.search-icon) {
        position: absolute;
        left: 10px;
        color: rgba(240,236,228,0.3);
        pointer-events: none;
    }

    .search {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2rem;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        color: #f0ece4;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.15s;
        box-sizing: border-box;
    }

    .search:focus { border-color: rgba(220,60,60,0.5); }
    .search::placeholder { color: rgba(240,236,228,0.25); }

    .tabs {
        display: flex;
        gap: 0.25rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .tab {
        padding: 0.4rem 0.9rem;
        border-radius: 4px;
        border: 1px solid transparent;
        background: transparent;
        color: rgba(240,236,228,0.35);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.83rem;
        cursor: pointer;
        transition: all 0.15s;
    }

    .tab:hover { color: rgba(240,236,228,0.7); }

    .tab.active {
        background: rgba(220,60,60,0.12);
        border-color: rgba(220,60,60,0.3);
        color: #dc3c3c;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.75rem;
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 4rem 0;
        color: rgb(59,58,61);
    }

    .empty p {
        font-size: 0.88rem;
        margin: 0;
    }

    .btn-home {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #1a1a20;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(240, 236, 228, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 100;
    }

    .btn-home:hover {
        background: #4b2327;
        border-color: #a23234;
        color: #dc3c3c;
    }
</style>
