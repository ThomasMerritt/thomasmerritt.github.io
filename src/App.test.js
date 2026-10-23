import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import App from './App';

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
