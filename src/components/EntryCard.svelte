<script>
    import { MediaType } from '../types/media';
    import { ratingLabel, statusColor } from '../constants/media';
    let { entry, handleEdit, index } = $props();
</script>

<button
    class='card'
    onclick={() => handleEdit(entry)}
    style='--status-color:{statusColor[entry.status] ?? '#888'}; --index:{index}'
>
    <div class='card-top'>
        <div class='type-badge'>{entry.type}</div>
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
        style='
            background:{statusColor[entry.status] ?? "#333"};
            width:calc({
                entry.totalProgress
                    ? Math.min(100, (entry.progress / entry.totalProgress) * 100)
                    : 0
            }% - 16px)'
    ></div>
</button>

<style>
    .card {
        position: relative;
        border: 1px solid #fff;
        border-radius: 8px;
        background-color: color-mix(in srgb, var(--status-color) 13%, transparent);
        border-color: color-mix(in srgb, var(--status-color) 40%, transparent);
        padding: 1rem;
        cursor: pointer;
        text-align: left;
        color: #f0ece4;
        font-family: 'DM Sans', sans-serif;
        transition: border-color 0.15s, background 0.15s;
        overflow: hidden;

        animation: spawn 0.2s ease both;
        animation-delay: calc(var(--index) * 10ms);
    }

    @keyframes spawn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .card:hover {
        background-color: color-mix(in srgb, var(--status-color) 20%, transparent);
        border-color: color-mix(in srgb, var(--status-color) 60%, transparent);
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
        bottom: 4px;
        left: 8px;
        height: 2px;
        border-radius: 2px;
        background: var(--status-color);
        transition: width 0.3s ease;
    }
</style>
