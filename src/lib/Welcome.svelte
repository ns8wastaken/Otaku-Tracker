<script lang='ts'>
    import { FolderOpen, StepForward, TriangleAlert } from 'lucide-svelte';
    import ConfirmModal from './ConfirmModal.svelte';

    let { onOpen, onContinue, onNew }: {
        onOpen:     (file: File) => void;
        onContinue: () => void;
        onNew:      () => void
    } = $props();

    function handleButtonClick() {
        fileInput.click();
    }

    let fileInput: HTMLInputElement;

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) onOpen(file);
    }

    const taglines = [
        'Top 10% gooner activities.',
        'No bitches?',
        'Anime waifu body pillow go brrrr!',
    ];
    const tagline = taglines[Math.floor(Math.random() * taglines.length)];

    let confirmOpen = $state(false);
</script>

<div class='welcome'>
    <div class='bg-grid'></div>
    <div class='bg-glow'></div>

    <div class='content'>
        <header class='hero'>
            <div class='kana'>オタク</div>
            <h1>Tracker</h1>
            <p class='tagline'>{@html tagline}</p>
        </header>

        <div class='actions'>
            <button class='btn btn-primary' onclick={handleButtonClick}>
                <FolderOpen size={16} />
                Open existing file
            </button>
            <button class='btn btn-ghost' onclick={onContinue}>
                <StepForward size={16} />
                Continue previous session
            </button>
            <div class='actions-sep'></div>
            <button class='btn btn-ghost' onclick={() => {confirmOpen = true}}>
                <TriangleAlert size={16} />
                Start fresh
            </button>
            <ConfirmModal
                bind:open={confirmOpen}
                title='Start Fresh'
                message='This will wipe all data from your previous session and cannot be undone.'
                confirmLabel='Start fresh'
                onConfirm={onNew}
            />
            <input
                bind:this={fileInput}
                type='file'
                accept='.json'
                style='display:none'
                onchange={handleFileChange}
            />
        </div>

        <div class='how'>
            <div class='step'>
                <span class='step-num'>01</span>
                <span class='step-text'>Open or create a <code>tracker.json</code> file on your computer.</span>
            </div>
            <div class='step'>
                <span class='step-num'>02</span>
                <span class='step-text'>Track anime &amp; manga with progress, scores, and notes.</span>
            </div>
            <div class='step'>
                <span class='step-num'>03</span>
                <span class='step-text'>Export the list again or keep it saved on the browser.</span>
            </div>
        </div>
    </div>
</div>

<style>
    .welcome {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0f;
        position: relative;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
    }

    h1 {
        animation: fadeDown 0.6s 0.1s ease both;
    }

    .bg-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
    }

    .bg-glow {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(220, 60, 60, 0.12) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        pointer-events: none;
    }

    .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
        padding: 2rem;
        max-width: 520px;
        width: 100%;
    }

    .hero {
        text-align: center;
    }

    .kana {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1rem;
        letter-spacing: 0.4em;
        color: #dc3c3c;
        margin-bottom: 0.25rem;
        animation: fadeDown 0.6s ease both;
    }

    .tagline {
        margin: 1.25rem 0 0;
        font-size: 1rem;
        color: rgba(240, 236, 228, 0.45);
        line-height: 1.7;
        font-weight: 300;
        animation: fadeDown 0.6s 0.2s ease both;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        max-width: 280px;
        animation: fadeDown 0.6s 0.3s ease both;
    }

    .actions-sep {
        /* width: 28px; */
        width: 100%;
        height: 1px;
        background: rgba(255,255,255,0.18);
    }

    .how {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        animation: fadeDown 0.6s 0.4s ease both;
    }

    .step {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 0.85rem 1rem;
        border-radius: 6px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
    }

    .step-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.1rem;
        color: #dc3c3c;
        line-height: 1.4;
        min-width: 24px;
    }

    .step-text {
        font-size: 0.88rem;
        color: rgba(240, 236, 228, 0.45);
        line-height: 1.6;
        font-weight: 300;
    }

    code {
        font-size: 0.82rem;
        background: rgba(220, 60, 60, 0.15);
        color: #dc3c3c;
        padding: 1px 5px;
        border-radius: 3px;
    }

    @keyframes fadeDown {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
</style>
