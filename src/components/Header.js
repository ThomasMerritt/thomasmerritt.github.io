import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Power3, gsap } from 'gsap';
import '../styles/Header.css';
import Caption from './Caption';
import scape from '../assets/images/scape.jpg';
import leaderFilm from '../assets/videos/old-film.mp4';
import headerFlash from '../assets/videos/header-flash.mp4';
import grainFilm from '../assets/videos/old-film-grain.mp4';
import { prefersReducedMotion } from '../lib/motion';

const FIRST_FLASH_DELAY_MS = 5000;
const NEXT_FLASH_DELAY_MIN_MS = 20000;
const NEXT_FLASH_DELAY_RANGE_MS = 10000;

// Each stage hands over to the next when its own clip ends; these only exist so
// a stalled or unsupported video cannot leave the header stuck mid-sequence.
const STAGE_MARGIN_MS = 1500;
const STAGE_MAX_MS = 60000;

const IDLE = 'idle';
const LEADER = 'leader';
const FLASH = 'flash';
const GRAIN = 'grain';

const randomDelay = () => NEXT_FLASH_DELAY_MIN_MS + Math.random() * NEXT_FLASH_DELAY_RANGE_MS;

/**
 * Safety timeout for a stage, sized from the clip's own duration when known.
 */
function useStageTimeout(active, videoRef, onExpire) {
    useEffect(() => {
        if (!active) return undefined;

        const video = videoRef.current;
        const durationMs = video && Number.isFinite(video.duration) && video.duration > 0
            ? video.duration * 1000
            : STAGE_MAX_MS;

        const timer = window.setTimeout(onExpire, Math.min(durationMs + STAGE_MARGIN_MS, STAGE_MAX_MS));
        return () => window.clearTimeout(timer);
    }, [active, videoRef, onExpire]);
}

const Header = () => {
    const canvasRef = useRef(null);
    const leaderRef = useRef(null);
    const flashRef = useRef(null);
    const grainRef = useRef(null);
    const scheduledRef = useRef(false);
    const [phase, setPhase] = useState(IDLE);

    useEffect(() => {
        // Reveal by clipping rather than animating height, which would squash the image.
        gsap.fromTo(
            canvasRef.current,
            { clipPath: 'inset(50% 0% 50% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: Power3.easeInOut }
        );
    }, []);

    // First run happens shortly after load; later runs are scheduled when the
    // previous one returns to idle.
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        if (scheduledRef.current) return undefined;
        scheduledRef.current = true;

        const timer = window.setTimeout(() => setPhase(LEADER), FIRST_FLASH_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (phase !== IDLE || !scheduledRef.current || prefersReducedMotion()) return undefined;

        const timer = window.setTimeout(() => setPhase(LEADER), randomDelay());
        return () => window.clearTimeout(timer);
    }, [phase]);

    // Old film leader plays first, over the still image.
    useEffect(() => {
        if (phase !== LEADER) return undefined;

        const video = leaderRef.current;
        if (!video) {
            setPhase(FLASH);
            return undefined;
        }

        video.currentTime = 0;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => setPhase(FLASH));
        }
        return undefined;
    }, [phase]);

    // The main clip follows the leader.
    useEffect(() => {
        if (phase !== FLASH) return undefined;

        const video = flashRef.current;
        if (!video) {
            setPhase(IDLE);
            return undefined;
        }

        video.currentTime = 0;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => setPhase(IDLE));
        }
        return undefined;
    }, [phase]);

    // Grain holds the clip's final frame, so playback must already be parked at
    // the end before it starts.
    useEffect(() => {
        if (phase !== GRAIN) return undefined;

        const flash = flashRef.current;
        if (flash) {
            flash.pause();
            if (Number.isFinite(flash.duration)) {
                flash.currentTime = Math.max(flash.duration - 0.05, 0);
            }
        }

        const grain = grainRef.current;
        if (grain) {
            grain.currentTime = 0;
            const attempt = grain.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(() => setPhase(IDLE));
            }
        }
        return undefined;
    }, [phase]);

    const onLeaderEnd = useCallback(() => setPhase(FLASH), []);
    const onFlashEnd = useCallback(() => setPhase(GRAIN), []);
    const onGrainEnd = useCallback(() => setPhase(IDLE), []);
    // A failed load should reveal the still image straight away.
    const abort = useCallback(() => setPhase(IDLE), []);

    useStageTimeout(phase === LEADER, leaderRef, onLeaderEnd);
    useStageTimeout(phase === FLASH, flashRef, abort);
    useStageTimeout(phase === GRAIN, grainRef, onGrainEnd);

    const showing = phase !== IDLE;
    const classes = ['header'];
    if (showing) classes.push('showing');
    if (phase === LEADER) classes.push('leader');
    if (phase === FLASH) classes.push('flash');
    if (phase === GRAIN) classes.push('grain');

    return (
        <header className={classes.join(' ')}>
            <section>
                <div className="canvas" ref={canvasRef}>
                    <img src={scape} width="1500" alt="Scape" />
                    <video
                        ref={flashRef}
                        className="canvas-media canvas-flash"
                        src={headerFlash}
                        muted
                        playsInline
                        preload="auto"
                        tabIndex={-1}
                        aria-hidden="true"
                        onEnded={onFlashEnd}
                        onError={abort}
                    />
                    <video
                        ref={leaderRef}
                        className="canvas-media canvas-leader"
                        src={leaderFilm}
                        muted
                        playsInline
                        preload="auto"
                        tabIndex={-1}
                        aria-hidden="true"
                        onEnded={onLeaderEnd}
                        onError={onLeaderEnd}
                    />
                    <video
                        ref={grainRef}
                        className="canvas-media canvas-grain"
                        src={grainFilm}
                        muted
                        playsInline
                        preload="auto"
                        tabIndex={-1}
                        aria-hidden="true"
                        onEnded={onGrainEnd}
                        onError={onGrainEnd}
                    />
                </div>
            </section>
            <Caption />
        </header>
    );
};

export default Header;
