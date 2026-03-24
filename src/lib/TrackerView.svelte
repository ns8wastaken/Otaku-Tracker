<script lang='ts'>
    import { onMount } from 'svelte';
    import { Search, SlidersHorizontal, Download, Plus, ChartBar } from 'lucide-svelte';
    import type { TrackedMedia } from '../types/media';
    import { Status, MediaType, Rating } from '../types/media';
    import * as DB from '../services/db';
    import { exportData } from '../features/importExport';
    import EntryModal from './EntryModal.svelte';
    import Dropdown from './Dropdown.svelte';
    import { Sorting } from '../types/trackerview';
    import { appState } from '../state.svelte';
    import StatsModal from './StatsModal.svelte';

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
    let sort = $state<Sorting>(Sorting.Updated);

    onMount(async () => {
        appState.entries = await DB.getAll();
    });

    const ratingLabel: Record<string, string> = {
        [Rating.Normal]:   '○',
        [Rating.Good]:     '◑',
        [Rating.VeryGood]: '●',
        [Rating.Sublime]:  '★',
    };

    const statusColor: Record<string, string> = {
        [Status.Watching]:  '#3b82f6',
        [Status.Completed]: '#22c55e',
        [Status.ToRead]:    '#a78bfa',
        [Status.OnHold]:    '#f59e0b',
        [Status.Dropped]:   '#ef4444',
    };

    let filtered = $derived((() => {
        let list = [...appState.entries];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(e => {
                const title = e.title.toLowerCase();
                let qi = 0;
                for (let i = 0; i < title.length && qi < q.length; i++) {
                    if (title[i] === q[qi]) qi++;
                }
                return qi === q.length;
            });
        }
        if (activeStatus !== 'all') list = list.filter(e => e.status === activeStatus);
        if (activeType !== 'all')   list = list.filter(e => e.type === activeType);

        switch (sort) {
            case Sorting.Title:  list.sort((a, b) => a.title.localeCompare(b.title)); break;
            case Sorting.Rating: {
                const order = { sublime: 3, verygood: 2, good: 1, normal: 0 };
                list.sort((a, b) => order[b.rating] - order[a.rating]);
                break;
            }
            case Sorting.Progress: {
                list.sort((a, b) => {
                    const aHas = a.totalProgress != null;
                    const bHas = b.totalProgress != null;
                    if (aHas && !bHas) return -1;
                    if (!aHas && bHas) return 1;
                    if (aHas && bHas)
                        return (b.progress / b.totalProgress!) - (a.progress / a.totalProgress!);
                    return b.progress - a.progress;
                });
                break;
            }
            default: list.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return list;
    })());

    const stats = $derived({
        total:     appState.entries.length,
        manga:     appState.entries.filter(e => e.type === MediaType.Manga).length,
        anime:     appState.entries.filter(e => e.type === MediaType.Anime).length,
        watching:  appState.entries.filter(e => e.status === Status.Watching).length,
        completed: appState.entries.filter(e => e.status === Status.Completed).length,
        onhold:    appState.entries.filter(e => e.status === Status.OnHold).length,
        dropped:   appState.entries.filter(e => e.status === Status.Dropped).length,
        toread:    appState.entries.filter(e => e.status === Status.ToRead).length,
    });

    const statusTabs = [
        { label: 'All',       value: 'all' },
        { label: 'Watching',  value: Status.Watching },
        { label: 'Completed', value: Status.Completed },
        { label: 'To Read',   value: Status.ToRead },
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
        { label: 'To Read',  value: stats.toread,    color: statusColor[Status.ToRead] },
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
            <button class="icon-btn" onclick={() => statsModalOpen = true}>
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
            {#each filtered as entry (entry.id)}
                <button class='card' onclick={() => handleEdit(entry)}>
                    <div class='card-top'>
                        <div class='type-badge' style='color:{statusColor[entry.status] ?? '#888'}'>{entry.type}</div>
                        <div class='card-rating'>{ratingLabel[entry.rating] ?? '○'}</div>
                    </div>
                    <div class='card-title'>{entry.title}</div>
                    <div class='card-bottom'>
                        <span class='progress'>
                            {entry.progress}{entry.totalProgress ? `/${entry.totalProgress}` : ''}
                            <span class='progress-unit'>{entry.type === MediaType.Manga ? 'ch' : 'ep'}</span>
                        </span>
                    </div>
                    <div
                        class='status-bar'
                        style='background:{statusColor[entry.status] ?? '#333'};width:{entry.totalProgress ? Math.min(100, (entry.progress / entry.totalProgress) * 100) : 0}%'
                    ></div>
                </button>
            {/each}
        </div>
    {/if}
</div>

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
        min-width: 180px;
    }

    .search-wrap :global(.search-icon) {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
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

    /* .select { */
    /*     padding: 0.5rem 0.75rem; */
    /*     background: rgba(255,255,255,0.04); */
    /*     border: 1px solid rgba(255,255,255,0.08); */
    /*     border-radius: 6px; */
    /*     color: rgba(240,236,228,0.7); */
    /*     font-family: 'DM Sans', sans-serif; */
    /*     font-size: 0.88rem; */
    /*     outline: none; */
    /*     cursor: pointer; */
    /* } */

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

    .card {
        position: relative;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        text-align: left;
        color: #f0ece4;
        font-family: 'DM Sans', sans-serif;
        transition: border-color 0.15s, background 0.15s;
        overflow: hidden;
    }

    .card:hover {
        background: rgba(255,255,255,0.055);
        border-color: rgba(255,255,255,0.13);
    }

    .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .type-badge {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 500;
    }

    .card-rating {
        font-size: 0.85rem;
        color: rgba(240,236,228,0.4);
    }

    .card-title {
        font-size: 0.92rem;
        font-weight: 500;
        line-height: 1.35;
        margin-bottom: 0.75rem;
        display: -webkit-box;
        -line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .progress {
        font-size: 0.82rem;
        color: rgba(240,236,228,0.45);
    }

    .progress-unit {
        font-size: 0.72rem;
        color: rgba(240,236,228,0.25);
        margin-left: 1px;
    }

    .status-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        transition: width 0.3s ease;
        border-radius: 0 0 8px 8px;
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
</style>
