<script lang='ts'>
    import { MediaType, Status, Rating } from '../types/media';
    import { appState } from '../state.svelte';
    import BaseModal from './BaseModal.svelte';

    let { open = $bindable() }: { open: boolean; } = $props();

    // — Counts
    const manga = $derived(appState.entries.filter(e => e.type === MediaType.Manga));
    const anime = $derived(appState.entries.filter(e => e.type === MediaType.Anime));

    // — Chapters / episodes read
    const chaptersRead = $derived(manga.reduce((s, e) => s + e.progress, 0));
    const episodesRead = $derived(anime.reduce((s, e) => s + e.progress, 0));

    // — Read time estimates
    // ~6 min per manga chapter, ~21 min per anime episode
    const mangaMinutes = $derived(chaptersRead * 6);
    const animeMinutes = $derived(episodesRead * 21);
    const totalMinutes = $derived(mangaMinutes + animeMinutes);

    function formatTime(mins: number): string {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        if (h < 24) return `${h}h ${mins % 60}m`;
        const d = Math.floor(h / 24);
        if (d < 365) return `${d}d ${h % 24}h`;
        const y = Math.floor(d / 365);
        return `${y}y ${d % 365}d`;
    }

    // — Ratings breakdown
    const ratingCounts = $derived(
        Object.values(Rating).map(r => ({
            label: r,
            count: appState.entries.filter(e => e.rating === r).length,
        })).reverse()
    );

    // — Status breakdown
    const statusMeta: { value: string; label: string; color: string }[] = [
        { value: Status.Watching,  label: 'Active',     color: '#3b82f6' },
        { value: Status.Completed, label: 'Completed',  color: '#22c55e' },
        { value: Status.OnHold,    label: 'On Hold',    color: '#f59e0b' },
        { value: Status.Dropped,   label: 'Dropped',    color: '#ef4444' },
        { value: Status.ToRead,    label: 'To Read',    color: '#a78bfa' },
    ];

    const statusCounts = $derived(
        statusMeta.map(s => ({
            ...s,
            count: appState.entries.filter(e => e.status === s.value).length,
        }))
    );

    // — Completion rate
    const completionRate = $derived(
        appState.entries.length ? Math.round((appState.entries.filter(e => e.status === Status.Completed).length / appState.entries.length) * 100) : 0
    );

    // — Most read
    const mostReadManga = $derived([...manga].sort((a, b) => b.progress - a.progress).slice(0, 3));
    const mostReadAnime = $derived([...anime].sort((a, b) => b.progress - a.progress).slice(0, 3));
</script>

<BaseModal bind:open={open} title={'Stats'}>
    <div class='body'>
        <div class='time-hero'>
            <div class='time-block'>
                <span class='time-val'>{formatTime(totalMinutes)}</span>
                <span class='time-label'>Total time wasted</span>
            </div>
            <div class='time-split'>
                <div class='time-sub'>
                    <span>{formatTime(mangaMinutes)}</span>
                    <span class='dim'>Manga <span class='muted'>({chaptersRead} ch)</span></span>
                </div>
                <div class='time-div'></div>
                <div class='time-sub'>
                    <span>{formatTime(animeMinutes)}</span>
                    <span class='dim'>Anime <span class='muted'>({episodesRead} ep)</span></span>
                </div>
            </div>
        </div>

        <div class='section-title'>Overview</div>
        <div class='grid-4'>
            <div class='stat-card'>
                <span class='sv'>{appState.entries.length}</span>
                <span class='sl'>Total</span>
            </div>
            <div class='stat-card'>
                <span class='sv'>{manga.length}</span>
                <span class='sl'>Manga</span>
            </div>
            <div class='stat-card'>
                <span class='sv'>{anime.length}</span>
                <span class='sl'>Anime</span>
            </div>
            <div class='stat-card'>
                <span class='sv' style='color:#22c55e'>{completionRate}%</span>
                <span class='sl'>Completed</span>
            </div>
        </div>

        <div class='section-title'>By Status</div>
        <div class='status-list'>
            {#each statusCounts as s}
                <div class='status-row'>
                    <span class='status-dot' style='background:{s.color}'></span>
                    <span class='status-label'>{s.label}</span>
                    <div class='bar-wrap'>
                        <div
                            class='bar'
                            style='width:{appState.entries.length ? (s.count / appState.entries.length) * 100 : 0}%; background:{s.color}'
                        ></div>
                    </div>
                    <span class='status-count'>{s.count}</span>
                </div>
            {/each}
        </div>

        <div class='section-title'>By Rating</div>
        <div class='rating-list'>
            {#each ratingCounts as r}
                <div class='status-row'>
                    <span class='status-label' style='text-transform:capitalize'>{r.label}</span>
                    <div class='bar-wrap'>
                        <div
                            class='bar'
                            style='width:{appState.entries.length ? (r.count / appState.entries.length) * 100 : 0}%; background:#dc3c3c'
                        ></div>
                    </div>
                    <span class='status-count'>{r.count}</span>
                </div>
            {/each}
        </div>

        {#if mostReadManga.length}
            <div class='section-title'>Most Read Manga</div>
            <div class='top-list'>
                {#each mostReadManga as e, i}
                    <div class='top-row'>
                        <span class='top-num'>{i + 1}</span>
                        <span class='top-title'>{e.title}</span>
                        <span class='top-val'>{e.progress} ch</span>
                    </div>
                {/each}
            </div>
        {/if}

        {#if mostReadAnime.length}
            <div class='section-title'>Most Watched Anime</div>
            <div class='top-list'>
                {#each mostReadAnime as e, i}
                    <div class='top-row'>
                        <span class='top-num'>{i + 1}</span>
                        <span class='top-title'>{e.title}</span>
                        <span class='top-val'>{e.progress} ep</span>
                    </div>
                {/each}
            </div>
        {/if}

    </div>
</BaseModal>

<style>
    .body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .time-hero {
        background: rgba(220,60,60,0.07);
        border: 1px solid rgba(220,60,60,0.15);
        border-radius: 8px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .time-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .time-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 2.5rem;
        line-height: 1;
        color: #dc3c3c;
        letter-spacing: 0.02em;
    }

    .time-label {
        font-size: 0.78rem;
        color: rgba(240,236,228,0.4);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .time-split {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .time-sub {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 0.88rem;
        color: rgba(240,236,228,0.7);
    }

    .time-div {
        width: 1px;
        height: 28px;
        background: rgba(255,255,255,0.08);
    }

    .dim { font-size: 0.75rem; color: rgba(240,236,228,0.35); }
    .muted { color: rgba(240,236,228,0.2); }

    .section-title {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(240,236,228,0.3);
        font-weight: 500;
        margin-top: 0.25rem;
    }

    .grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
    }

    .stat-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 6px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .sv {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.5rem;
        line-height: 1;
    }

    .sl {
        font-size: 0.7rem;
        color: rgba(240,236,228,0.35);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .status-list, .rating-list, .top-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .status-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .status-label {
        font-size: 0.82rem;
        color: rgba(240,236,228,0.6);
        min-width: 70px;
    }

    .bar-wrap {
        flex: 1;
        height: 4px;
        background: rgba(255,255,255,0.05);
        border-radius: 2px;
        overflow: hidden;
    }

    .bar {
        height: 100%;
        border-radius: 2px;
        transition: width 0.4s ease;
        opacity: 0.7;
    }

    .status-count {
        font-size: 0.82rem;
        color: rgba(240,236,228,0.35);
        min-width: 28px;
        text-align: right;
    }

    .top-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255,255,255,0.02);
        border-radius: 6px;
    }

    .top-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1rem;
        color: #dc3c3c;
        min-width: 16px;
    }

    .top-title {
        flex: 1;
        font-size: 0.85rem;
        color: rgba(240,236,228,0.75);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .top-val {
        font-size: 0.78rem;
        color: rgba(240,236,228,0.3);
    }
</style>
