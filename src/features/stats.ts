import type { TrackedMedia } from '../types/media';
import { Status, MediaType } from '../types/media';

export function computeStats(entries: TrackedMedia[]) {
    const stats = {
        total:     0,
        manga:     0,
        anime:     0,
        watching:  0,
        completed: 0,
        onhold:    0,
        dropped:   0,
        towatch:   0,
    };

    stats.total = entries.length;

    for (const entry of entries) {
        if (entry.type === MediaType.Manga) stats.manga++;
        else if (entry.type === MediaType.Anime) stats.anime++;

        if (entry.status === Status.Watching)       stats.watching++;
        else if (entry.status === Status.Completed) stats.completed++;
        else if (entry.status === Status.OnHold)    stats.onhold++;
        else if (entry.status === Status.Dropped)   stats.dropped++;
        else if (entry.status === Status.ToWatch)   stats.towatch++;
    }

    return stats;
}
