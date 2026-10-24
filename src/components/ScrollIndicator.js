import React, { useEffect, useState, useCallback } from 'react';
import '../styles/ScrollIndicator.css';
import { prefersReducedMotion } from '../lib/motion';

const scrollTo = (options) => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (typeof options === 'number') {
        window.scrollTo({ top: options, behavior });
    } else {
        options.scrollIntoView({ block: 'center', behavior });
    }
};

const ScrollIndicator = () => {
    const [pointingUp, setPointingUp] = useState(false);

    useEffect(() => {
        const linksSection = document.getElementById('footer-links-navigation-point');
        if (!linksSection) return undefined;

        // Flip once the links section crosses the middle of the viewport.
        const onScroll = () => {
            setPointingUp(linksSection.getBoundingClientRect().top < window.innerHeight / 2);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const goDown = useCallback(() => {
        const links = document.querySelector('.footer-links');
        scrollTo(links || document.getElementById('footer-links-navigation-point'));
    }, []);

    const goUp = useCallback(() => scrollTo(0), []);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                goDown();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                goUp();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [goDown, goUp]);

    return (
        <button
            type="button"
            className={`scroll-indicator${pointingUp ? ' up' : ''}`}
            aria-label={pointingUp ? 'Scroll to top' : 'Scroll to links'}
            onClick={pointingUp ? goUp : goDown}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3v16" />
                <path d="M5 13l7 7 7-7" />
            </svg>
        </button>
    );
};

export default ScrollIndicator;
