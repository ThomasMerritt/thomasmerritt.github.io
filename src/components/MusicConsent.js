import React from 'react';
import '../styles/MusicConsent.css';

const STORAGE_KEY = 'music-consent';

/**
 * Reads the stored choice, returning null when nothing has been decided yet.
 * localStorage throws in Safari private mode and when cookies are blocked, so
 * an unavailable store simply means we ask again rather than breaking the page.
 */
export function readConsent() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'granted') return true;
        if (stored === 'denied') return false;
        return null;
    } catch {
        return null;
    }
}

export function rememberConsent(granted) {
    try {
        window.localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
    } catch {
        // Nothing to do; the prompt will simply appear next visit too.
    }
}

/**
 * Blocking dialog shown once per visitor. Its "Play music" button is the user
 * activation that lets the player start, which a native alert() could never be.
 */
const MusicConsent = ({ onAllow, onDismiss, allowRef }) => (
    <div className="music-consent-backdrop">
        <div
            className="music-consent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="music-consent-title"
            aria-describedby="music-consent-body"
        >
            <h2 id="music-consent-title" className="music-consent-title">Play music?</h2>
            <p id="music-consent-body" className="music-consent-body">
                This site would like to load a SoundCloud player. It plays third-party
                audio and reports a page view to SoundCloud.
            </p>
            <div className="music-consent-actions">
                <button
                    type="button"
                    className="music-consent-allow"
                    onClick={onAllow}
                    ref={allowRef}
                >
                    Play music
                </button>
                <button type="button" className="music-consent-dismiss" onClick={onDismiss}>
                    No thanks
                </button>
            </div>
        </div>
    </div>
);

export default MusicConsent;
