import React from 'react';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import App from './App';
import playlistConfig from './config/playlist.json';

// Derived so editing the playlist does not break the suite.
const firstTrackTitle = playlistConfig.tracks[0].title;

const realRect = Element.prototype.getBoundingClientRect;

// jsdom reports every rect as all zeros, which would make the links section
// look permanently in view. Drive its position from the test instead.
const stubLinksTop = (getter) => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () {
        if (this.id === 'footer-links-navigation-point') {
            const top = getter();
            return { top, bottom: top + 1000, left: 0, right: 1440, width: 1440, height: 1000, x: 0, y: top, toJSON: () => ({}) };
        }
        return realRect.call(this);
    });
};

afterEach(() => {
    jest.restoreAllMocks();
});

test('renders the header image and the footer links', () => {
    render(<App />);

    expect(within(screen.getByRole('banner')).getByAltText('Scape')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    ['EMAIL', 'LINKEDIN', 'RESUME', 'GITHUB'].forEach((label) => {
        expect(footer).toHaveTextContent(label);
    });
});

test('indicator points down while the links are below the fold', () => {
    stubLinksTop(() => window.innerHeight + 100);
    render(<App />);

    const indicator = screen.getByRole('button', { name: 'Scroll to links' });
    expect(indicator).not.toHaveClass('up');
});

describe('music consent', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('asks before loading any player', () => {
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        expect(screen.getByRole('dialog', { name: 'Play music?' })).toBeInTheDocument();
        expect(document.querySelector('.music-frame')).toBeNull();
    });

    test('allowing loads the player and is remembered', () => {
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'Play music' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.querySelector('.music-frame')).not.toBeNull();
        expect(window.localStorage.getItem('music-consent')).toBe('granted');
    });

    test('the mounted widget is addressed to the player origin so it accepts commands', () => {
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'Play music' }));

        const src = document.querySelector('.music-frame').getAttribute('src');
        expect(src.startsWith('https://w.soundcloud.com/player/')).toBe(true);
        expect(src).toContain('auto_play=true');
    });

    test('a returning visitor gets the widget but not autoplay', () => {
        window.localStorage.setItem('music-consent', 'granted');
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        const src = document.querySelector('.music-frame').getAttribute('src');
        expect(src).toContain('auto_play=false');
    });

    test('declining loads nothing and is remembered', () => {
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: 'No thanks' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.querySelector('.music-frame')).toBeNull();
        expect(window.localStorage.getItem('music-consent')).toBe('denied');
    });

    test('a stored decision skips the prompt', () => {
        window.localStorage.setItem('music-consent', 'granted');
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('a prior refusal can be reopened from the note button', () => {
        window.localStorage.setItem('music-consent', 'denied');
        stubLinksTop(() => window.innerHeight + 100);
        render(<App />);

        fireEvent.click(screen.getByRole('button', { name: new RegExp(firstTrackTitle) }));

        expect(screen.getByRole('dialog', { name: 'Play music?' })).toBeInTheDocument();
    });
});

test('indicator rotates up once the links are in view', () => {
    let linksTop = window.innerHeight + 100;
    stubLinksTop(() => linksTop);
    render(<App />);

    expect(screen.getByRole('button', { name: 'Scroll to links' })).not.toHaveClass('up');

    linksTop = 0;
    act(() => {
        window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByRole('button', { name: 'Scroll to top' })).toHaveClass('up');
});
