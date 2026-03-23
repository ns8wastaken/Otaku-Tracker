import * as DB from '../services/db'
import type { TrackedMedia } from '../types/media';

export const ImportMode = {
    Merge: 'merge',
    Replace: 'replace',
} as const;

export type ImportMode = typeof ImportMode[keyof typeof ImportMode];

export async function importData(file: File, mode: ImportMode): Promise<void> {
    const text = await file.text();
    const incoming: TrackedMedia[] = JSON.parse(text);

    if (!Array.isArray(incoming)) throw new Error('Invalid format');

    if (mode === ImportMode.Replace) {
        await DB.clearAll();
        await DB.saveAll(incoming);
    } else {
        const existing = await DB.getAll();
        const merged = [
            ...existing.filter(e => !incoming.find(i => i.id === e.id)),
            ...incoming,
        ];
        await DB.saveAll(merged);
    }
}

export async function exportData(): Promise<void> {
    const data = await DB.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `otaku-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
