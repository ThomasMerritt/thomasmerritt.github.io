import React, { useEffect, useMemo, useState } from 'react';
import '../styles/MusicPlayer.css';
import { sanitisePlaylist } from '../lib/soundcloud';
import playlistConfig from '../config/playlist.json';

/**
 * The widget is only mounted once the panel is opened, so visitors who never
 * play music never load third-party content or hand SoundCloud a page view.
 */
const MusicPlayer = () => {
    const tracks = useMemo(() => sanitisePlaylist(playlistConfig.tracks), []);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index > 0 && index >= tracks.length) setIndex(0);
    }, [tracks.length, index]);

    if (!tracks.length) return null;

    const track = tracks[index];
    const multiple = tracks.length > 1;

    const step = (delta) => setIndex((prev) => (prev + delta + tracks.length) % tracks.length);

    return (
        <div className={`music-player${open ? ' open' : ''}`}>
            <div className="music-player-bar">
                <button
                    type="button"
                    className="music-toggle"
                    aria-expanded={open}
                    aria-label={open ? 'Close music player' : 'Open music player'}
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 18V5l10-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="16" cy="16" r="3" />
                    </svg>
                </button>
                {open && multiple && (
                    <span className="music-controls">
                        <button type="button" onClick={() => step(-1)} aria-label="Previous track">‹</button>
                        <span className="music-track-label" title={track.label}>{track.label}</span>
                        <button type="button" onClick={() => step(1)} aria-label="Next track">›</button>
                    </span>
                )}
            </div>
            {open && (
                <iframe
                    className="music-frame"
                    title={track.label}
                    src={track.url}
                    scrolling="no"
                    frameBorder="0"
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            )}
        </div>
    );
};

export default MusicPlayer;
