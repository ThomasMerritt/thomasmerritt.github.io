import React, { useEffect, useRef } from 'react';
import { Power3, gsap } from 'gsap';
import '../styles/Header.css';
import Caption from './Caption';
import scape from '../scape.jpg';

const Header = () => {
    const canvasRef = useRef(null);
    const navlinksRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(canvasRef.current, 2, { height: "0%" }, { height: "80%", ease: Power3.easeInOut })
            .fromTo(navlinksRef.current, .75, { height: "0%" }, { height: "8%", ease: Power3.easeInOut });
    }, []);

    return (
        <header>
            <nav>
                <ul className="nav-links" ref={navlinksRef}>
                    <li><a id="link" href="#hero-section">RESUME</a></li>
                    <li><a id="link" href="#about-section">DRIVE</a></li>
                    <li><a id="link" href="#footer-links-navigation-point">LINKS</a></li>
                </ul>
            </nav>
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
