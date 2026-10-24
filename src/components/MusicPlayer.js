import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/MusicPlayer.css';
import MusicConsent, { readConsent, rememberConsent } from './MusicConsent';
import { buildPlayerUrl, randomTrackIndex, sanitisePlaylist } from '../lib/soundcloud';
import { sendCommand, subscribeToPlaybackState } from '../lib/widgetApi';
import playlistConfig from '../config/playlist.json';

/**
 * Drawn rather than typed: text chevrons sit on the font's baseline, which is a
 * couple of pixels off the label's centre, so they looked misaligned.
 */
const Chevron = ({ direction }) => (
    <svg className={`music-chevron${direction === 'right' ? ' right' : ''}`} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d="M8 2 4 6l4 4" />
    </svg>
);

/**
 * The widget is only mounted once music is allowed, so visitors who never play
 * music never load third-party content or hand SoundCloud a page view.
 */
const MusicPlayer = () => {
    const tracks = useMemo(() => sanitisePlaylist(playlistConfig.tracks), []);
    const [consent, setConsent] = useState(readConsent);
    const [mounted, setMounted] = useState(() => readConsent() === true);
    // A stored allowance means the widget should start on its own; visitors
    // who have never decided still get the prompt first.
    const [autoPlay, setAutoPlay] = useState(() => readConsent() === true);
    const [playing, setPlaying] = useState(false);
    // Lazy so the choice is made once per page load rather than on every render.
    const [index, setIndex] = useState(() => randomTrackIndex(tracks.length));
    const frameRef = useRef(null);
    const allowRef = useRef(null);
    const unlockArmed = useRef(true);

    useEffect(() => {
        if (index > 0 && index >= tracks.length) setIndex(0);
    }, [tracks.length, index]);

    // Bound to the widget's own `ready` signal, so it does not matter whether
    // the iframe document finishes loading before or after this effect runs.
    useEffect(() => {
        if (!mounted) return undefined;

        return subscribeToPlaybackState(frameRef.current, setPlaying);
    }, [mounted, index]);

    useEffect(() => {
        if (consent === null && allowRef.current) allowRef.current.focus();
    }, [consent]);

    // Autoplay can still be refused by the browser on a reload, so the first
    // interaction anywhere starts playback instead of leaving it silent. This
    // is armed only for that initial attempt: once the visitor has taken manual
    // control, or music has started, a later pause must stay paused.
    useEffect(() => {
        if (!mounted || playing || !unlockArmed.current) return undefined;

        const unlock = (event) => {
            // Clicking the note is handled by the button itself; unlocking here
            // too would start and immediately pause the track, since pointerdown
            // arrives before click.
            if (event && event.target.closest && event.target.closest('.music-player')) return;
            if (!unlockArmed.current) return;

            unlockArmed.current = false;
            sendCommand(frameRef.current, 'play');
            setPlaying(true);
        };

        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, [mounted, playing]);


    useEffect(() => {
        if (consent !== null) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                rememberConsent(false);
                setConsent(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [consent]);

    if (!tracks.length) return null;

    const track = tracks[index];
    const asking = consent === null;

    const step = (delta) => setIndex((prev) => (prev + delta + tracks.length) % tracks.length);

    const toggle = (method) => {
        unlockArmed.current = false;
        sendCommand(frameRef.current, method);
    };

    // An auto-playing widget emits `play` before our listener can bind, so the
    // icon is set optimistically and corrected by subsequent events.
    const startPlayback = () => {
        setAutoPlay(true);
        setMounted(true);
        setPlaying(true);
    };

    const onToggleClick = () => {
        if (asking) {
            setConsent(null);
            return;
        }
        if (consent === false) {
            setConsent(null);
            return;
        }
        if (!mounted) {
            // Mounting happens inside the click handler, so the widget is
            // allowed to start here even though a restore-on-load is not.
            startPlayback();
            return;
        }
        toggle('toggle');
    };

    const allow = () => {
        rememberConsent(true);
        setConsent(true);
        startPlayback();
    };

    const dismiss = () => {
        rememberConsent(false);
        setConsent(false);
        setMounted(false);
    };

    return (
        <>
            {asking && (
                <MusicConsent onAllow={allow} onDismiss={dismiss} allowRef={allowRef} />
            )}
            <div className={`music-player${playing ? ' playing' : ''}`}>
                <button
                    type="button"
                    className="music-toggle"
                    aria-pressed={playing}
                    aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                    onClick={onToggleClick}
                >
                    <svg className="music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 18V5l10-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="16" cy="16" r="3" />
                    </svg>
                </button>
                <div className="music-reveal">
                    {tracks.length > 1 && (
                        <button
                            type="button"
                            className="music-step"
                            aria-label="Previous track"
                            onClick={() => step(-1)}
                        >
                            <Chevron direction="left" />
                        </button>
                    )}
                    <span className="music-track-label">
                        {track.title}
                        {track.artist && <span className="music-separator"> · </span>}
                        {track.artist}
                    </span>
                    {tracks.length > 1 && (
                        <button
                            type="button"
                            className="music-step"
                            aria-label="Next track"
                            onClick={() => step(1)}
                        >
                            <Chevron direction="right" />
                        </button>
                    )}
                </div>
                {mounted && (
                    <iframe
                        ref={frameRef}
                        className="music-frame"
                        title={`${track.title} by ${track.artist || 'SoundCloud'}`}
                        src={buildPlayerUrl(track.permalink, {
                            autoPlay,
                            origin: window.location.origin,
                        })}
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                    />
                )}
            </div>
        </>
    );
};

export default MusicPlayer;
