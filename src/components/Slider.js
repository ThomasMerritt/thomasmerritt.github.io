import React, { useEffect } from 'react';
import '../styles/Slider.css';

const Slider = () => {
    useEffect(() => {
        const slider = document.getElementById('slider');
        slider.classList.toggle('fade');
    }, []);

    return <div id="slider"></div>;
};

export default Slider;
