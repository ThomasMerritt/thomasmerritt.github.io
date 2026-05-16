import React, { useEffect, useState } from 'react';
import '../styles/Caption.css';

const positivity = [
    "こんにちは",
    "stay frosty",
    "i'm here",
    "hola",
    "good day!",
    '<3',
    '(╯°□°)╯',
    'ノ( º _ ºノ)'
];

const Caption = () => {
    const [caption, setCaption] = useState('');
    const [captionIndex, setCaptionIndex] = useState(0);

    useEffect(() => {
        const captionElement = document.getElementById('caption');
        captionElement.classList.toggle('fade');

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        const changeCaption = () => {
            shuffleArray(positivity);
            const el = document.getElementById('caption');
            el.style.opacity = '0';
            setTimeout(() => {
                let newCaption = positivity[captionIndex];
                setCaption(newCaption);
                setCaptionIndex((prevIndex) => (prevIndex + 1) % positivity.length);
                el.style.opacity = '1';
            }, 1000);
        };

        const interval = setInterval(changeCaption, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <h1
            id="caption"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
            {caption}
        </h1>
    );
};

export default Caption;
