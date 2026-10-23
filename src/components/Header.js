import React, { useEffect, useRef } from 'react';
import { Power3, gsap } from 'gsap';
import '../styles/Header.css';
import Caption from './Caption';
import scape from '../assets/images/scape.jpg';

const Header = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Reveal by clipping rather than animating height, which would squash the image.
        gsap.fromTo(
            canvasRef.current,
            { clipPath: 'inset(50% 0% 50% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: Power3.easeInOut }
        );
    }, []);

    return (
        <header>
            <section>
                <div className="canvas" ref={canvasRef}>
                    <img src={scape} width="1500" alt="Scape" />
                </div>
            </section>
            <Caption />
        </header>
    );
};

export default Header;
