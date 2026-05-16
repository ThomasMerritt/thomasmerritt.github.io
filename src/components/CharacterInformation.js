import React, { useEffect, useRef } from 'react';
import '../styles/CharacterInformation.css';

const CharacterInformation = ({ children }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const scrollEffect = () => {
            const container = containerRef.current;
            if (!container) return;
            if (window.scrollY >= 150) {
                container.style.opacity = '1';
                container.style.transform = 'translateX(0px)';
                container.style.transition = '1s ease-in-out';
            } else {
                container.style.opacity = '0';
                container.style.transform = 'translate(-20px)';
            }
        };

        window.addEventListener('scroll', scrollEffect);
        scrollEffect();

        return () => window.removeEventListener('scroll', scrollEffect);
    }, []);

    return (
        <div ref={containerRef} className="character-information">
            {children}
        </div>
    );
};

export default CharacterInformation;
