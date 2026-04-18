<script lang="ts">
    import { importData, ImportMode } from './features/importExport';
    import TrackerView from './components/TrackerView.svelte';
    import Welcome from './components/Welcome.svelte';
    import * as DB from './services/db';
    import { appState, View } from './state.svelte';
    import { onMount } from 'svelte';

    onMount(async () => {
        appState.entries = await DB.getAll();
        if (appState.entries.length > 0) {
            appState.view = View.Tracker;
        }
    });

    async function handleOpen(file: File) {
        await importData(file, ImportMode.Replace);
        appState.entries = await DB.getAll();
        appState.view = View.Tracker;
    }

    async function handleContinue() {
        appState.view = View.Tracker;
    }

    async function handleNew() {
        await DB.clearAll();
        appState.entries = [];
        appState.view = View.Tracker;
    }
</script>

{#if appState.view === View.Welcome}
    <Welcome onOpen={handleOpen} onContinue={handleContinue} onNew={handleNew} />
{:else}
    <TrackerView />
{/if}
