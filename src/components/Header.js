import React, { useEffect, useRef } from 'react';
import { Power3, gsap } from 'gsap';
import '../styles/Header.css';
import Caption from './Caption';
import scape from '../scape.jpg';

const Header = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        gsap.timeline().fromTo(canvasRef.current, 2, { height: "0%" }, { height: "80%", ease: Power3.easeInOut });
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
