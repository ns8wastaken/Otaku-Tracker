import { openDB, type DBSchema } from 'idb';
import type { TrackedMedia } from '../types/media';

export interface TrackerDB extends DBSchema {
    entries: {
        key: string;
        value: TrackedMedia;
        indexes: { 'by-title': string; 'by-status': string };
    };
}

const dbPromise = openDB<TrackerDB>('otaku-tracker', 1, {
    upgrade(db) {
        const store = db.createObjectStore('entries', { keyPath: 'id' });
        store.createIndex('by-title', 'title');
        store.createIndex('by-status', 'status');
    },
});

export async function getAll(): Promise<TrackedMedia[]> {
    return (await dbPromise).getAll('entries');
}

export async function save(entry: TrackedMedia): Promise<void> {
    await (await dbPromise).put('entries', entry);
}

export async function saveAll(items: TrackedMedia[]): Promise<void> {
    for (const item of items) {
        await save(item);
    }
}

export async function remove(id: string): Promise<void> {
    await (await dbPromise).delete('entries', id);
}

export async function clearAll(): Promise<void> {
    await (await dbPromise).clear('entries');
}
