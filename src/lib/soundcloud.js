// Only the embedded `url` parameter is author-controlled; the frame's own
// origin is always the constant below, so a hostile config value cannot make
// the page embed an arbitrary third-party site.
export const WIDGET_ORIGIN = 'https://w.soundcloud.com';

// The widget API expects messages addressed to the player document's own
// origin, which is this base without the query string.
export const WIDGET_BASE = `${WIDGET_ORIGIN}/player`;

const ALLOWED_HOSTS = new Set(['soundcloud.com', 'www.soundcloud.com']);

const MAX_URL_LENGTH = 2048;

const MAX_LABEL_LENGTH = 120;

/**
 * Accepts only an https SoundCloud permalink. Returns the normalised permalink
 * string, or null if the value is unusable.
 */
export function parseSoundCloudUrl(rawUrl) {
    if (typeof rawUrl !== 'string') return null;

    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch {
        return null;
    }

    if (parsed.protocol !== 'https:') return null;
    if (!ALLOWED_HOSTS.has(parsed.hostname)) return null;
    // Reject credentials smuggled into the authority, e.g. https://soundcloud.com@evil.test
    if (parsed.username || parsed.password) return null;

    return parsed.toString();
}

/**
 * Builds the player URL from a fixed origin. Returns null when the permalink is
 * not a valid SoundCloud resource.
 */
export function buildPlayerUrl(rawUrl, { autoPlay = false, origin } = {}) {
    const permalink = parseSoundCloudUrl(rawUrl);
    if (!permalink) return null;

    const params = new URLSearchParams({
        url: permalink,
        auto_play: autoPlay ? 'true' : 'false',
        hide_related: 'true',
        show_comments: 'false',
        show_user: 'false',
        show_reposts: 'false',
        show_teaser: 'false',
        visual: 'false',
    });

    // The widget only accepts API commands when it knows the embedding origin.
    if (origin) params.set('origin', origin);

    return `${WIDGET_BASE}/?${params.toString()}`;
}

const cleanText = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, MAX_LABEL_LENGTH) : fallback;
};

/**
 * Filters a raw playlist down to entries with a usable permalink, so one bad
 * config value cannot break the player or widen what it can embed.
 */
export function sanitisePlaylist(entries) {
    if (!Array.isArray(entries)) return [];

    return entries
        .map((entry) => {
            const permalink = entry && parseSoundCloudUrl(entry.url);
            if (!permalink) return null;
            return {
                permalink,
                url: buildPlayerUrl(permalink),
                title: cleanText(entry.title, 'Untitled'),
                artist: cleanText(entry.artist, ''),
                label: cleanText(entry.label, cleanText(entry.title, 'Untitled')),
            };
        })
        .filter(Boolean);
}

/**
 * Picks a track to start on. Returns 0 for an empty or single-item playlist so
 * callers never have to guard against a negative or out-of-range index.
 */
export function randomTrackIndex(count) {
    if (!Number.isInteger(count) || count < 2) return 0;

    return Math.floor(Math.random() * count);
}
