import { parseSoundCloudUrl, buildPlayerUrl, sanitisePlaylist } from './soundcloud';

describe('parseSoundCloudUrl', () => {
    test('accepts https SoundCloud permalinks', () => {
        expect(parseSoundCloudUrl('https://soundcloud.com/forss')).toContain('soundcloud.com/forss');
        expect(parseSoundCloudUrl('https://soundcloud.com/forss/sets/all-vows')).toBeTruthy();
        expect(parseSoundCloudUrl('  https://www.soundcloud.com/forss  ')).toBeTruthy();
    });

    test('rejects non-https, other hosts, and malformed values', () => {
        expect(parseSoundCloudUrl('http://soundcloud.com/forss')).toBeNull();
        expect(parseSoundCloudUrl('https://evil.test/forss')).toBeNull();
        expect(parseSoundCloudUrl('javascript:alert(1)')).toBeNull();
        expect(parseSoundCloudUrl('not a url')).toBeNull();
        expect(parseSoundCloudUrl('')).toBeNull();
        expect(parseSoundCloudUrl(null)).toBeNull();
        expect(parseSoundCloudUrl(undefined)).toBeNull();
        expect(parseSoundCloudUrl(42)).toBeNull();
    });

    test('rejects userinfo tricks that spoof the host', () => {
        expect(parseSoundCloudUrl('https://soundcloud.com@evil.test/')).toBeNull();
        expect(parseSoundCloudUrl('https://soundcloud.com:pw@evil.test/')).toBeNull();
    });

    test('rejects oversized values', () => {
        expect(parseSoundCloudUrl(`https://soundcloud.com/forss/${'a'.repeat(3000)}`)).toBeNull();
    });
});

describe('buildPlayerUrl', () => {
    test('always frames through the widget origin', () => {
        const url = buildPlayerUrl('https://soundcloud.com/forss');
        expect(url.startsWith('https://w.soundcloud.com/player/')).toBe(true);
    });

    test('encodes the permalink as a parameter rather than a location', () => {
        const url = buildPlayerUrl('https://soundcloud.com/forss');
        expect(url).toContain('url=https%3A%2F%2Fsoundcloud.com%2Fforss');
        expect(url).not.toContain('auto_play=true');
    });

    test('returns null for unusable input', () => {
        expect(buildPlayerUrl('https://evil.test/x')).toBeNull();
    });
});

describe('sanitisePlaylist', () => {
    test('keeps valid entries and labels them', () => {
        const result = sanitisePlaylist([
            { label: 'One', url: 'https://soundcloud.com/forss' },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('One');
    });

    test('drops invalid entries instead of throwing', () => {
        const result = sanitisePlaylist([
            { label: 'bad host', url: 'https://evil.test/x' },
            { label: 'missing url' },
            'not an object',
            { label: 'good', url: 'https://soundcloud.com/forss' },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('good');
    });

    test('tolerates a non-array config', () => {
        expect(sanitisePlaylist(undefined)).toEqual([]);
        expect(sanitisePlaylist('nope')).toEqual([]);
    });

    test('truncates absurd labels', () => {
        const result = sanitisePlaylist([
            { label: 'x'.repeat(5000), url: 'https://soundcloud.com/forss' },
        ]);
        expect(result[0].label.length).toBeLessThanOrEqual(120);
    });
});
