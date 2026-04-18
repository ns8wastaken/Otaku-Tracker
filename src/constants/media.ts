import { Status, Rating } from '../types/media';

export const ratingLabel: Record<string, string> = {
    [Rating.Normal]:   '○',
    [Rating.Good]:     '◑',
    [Rating.VeryGood]: '●',
    [Rating.Sublime]:  '★',
};

export const statusColor: Record<string, string> = {
    [Status.Watching]:  '#3b82f6',
    [Status.Completed]: '#22c55e',
    [Status.ToWatch]:   '#a78bfa',
    [Status.OnHold]:    '#f59e0b',
    [Status.Dropped]:   '#ef4444',
};
