import type { TrackedMedia } from '../types/media';
import { Sorting } from '../types/trackerview';

const ratingOrder: Record<string, number> = {
    normal:   0,
    good:     1,
    verygood: 2,
    sublime:  3,
};

export function filterAndSort(
    entries: TrackedMedia[],
    search: string,
    activeStatus: string,
    activeType: string,
    sort: Sorting
) {
    let list = [...entries];

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
        case Sorting.Title: {
            list.sort((a, b) => a.title.localeCompare(b.title));
            break;
        }
        case Sorting.Rating: {
            list.sort((a, b) => ratingOrder[b.rating] - ratingOrder[a.rating]);
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
};
