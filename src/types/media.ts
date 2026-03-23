export const Status = {
    Watching:  'watching',
    Completed: 'completed',
    OnHold:    'onhold',
    Dropped:   'dropped',
    ToRead:    'toread',
} as const;

export const MediaType = {
    Manga: 'manga',
    Anime: 'anime',
} as const;

export const Rating = {
    Normal:   'normal',
    Good:     'good',
    VeryGood: 'verygood',
    Sublime:  'sublime',
} as const;

export type Status = typeof Status[keyof typeof Status];
export type MediaType = typeof MediaType[keyof typeof MediaType];
export type Rating = typeof Rating[keyof typeof Rating];

export interface TrackedMedia {
    id: string;               // crypto.randomUUID()
    type: MediaType;
    title: string;
    status: Status;
    progress: number;         // chapter (manga) or episode (anime)
    totalProgress?: number;   // total chapters/episodes if known
    rating: Rating;
    notes?: string;
    createdAt: number;
    updatedAt: number;
}

export function createEntry(
    data: Omit<TrackedMedia, 'id' | 'createdAt' | 'updatedAt'>
): TrackedMedia {
    const now = Date.now();
    return {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    };
}

export function updateEntry(
    existing: TrackedMedia,
    changes: Partial<Omit<TrackedMedia, 'id' | 'createdAt'>>
): TrackedMedia {
    return {
        ...existing,
        ...changes,
        updatedAt: Date.now(),
    };
}
