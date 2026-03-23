import type { TrackedMedia } from './types/media';

export const View = {
    Welcome: 'welcome',
    Tracker: 'tracker',
} as const;

export type View = typeof View[keyof typeof View];

export const appState = $state({
    entries: [] as TrackedMedia[],
    view: View.Welcome as View,
});
