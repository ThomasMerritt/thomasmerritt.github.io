// Only the embedded `url` parameter is author-controlled; the frame's own
// origin is always the constant below, so a hostile config value cannot make
// the page embed an arbitrary third-party site.
export const WIDGET_ORIGIN = 'https://w.soundcloud.com';

const ALLOWED_HOSTS = new Set(['soundcloud.com', 'www.soundcloud.com']);

const MAX_URL_LENGTH = 2048;

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
export function buildPlayerUrl(rawUrl) {
    const permalink = parseSoundCloudUrl(rawUrl);
    if (!permalink) return null;

    const params = new URLSearchParams({
        url: permalink,
        auto_play: 'false',
        hide_related: 'true',
        show_comments: 'false',
        show_user: 'false',
        show_reposts: 'false',
        show_teaser: 'false',
        visual: 'false',
    });

    return `${WIDGET_ORIGIN}/player/?${params.toString()}`;
}

/**
 * Filters a raw playlist down to entries with a usable permalink, so one bad
 * config value cannot break the player or widen what it can embed.
 */
export function sanitisePlaylist(entries) {
    if (!Array.isArray(entries)) return [];

    return entries
        .map((entry) => {
            const url = entry && buildPlayerUrl(entry.url);
            if (!url) return null;
            return {
                url,
                label: entry.label && typeof entry.label === 'string'
                    ? entry.label.slice(0, 120)
                    : 'Untitled',
            };
        })
        .filter(Boolean);
}
