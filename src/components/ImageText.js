import React from 'react';
import '../styles/ImageText.css';

const ImageText = ({ id, image, sections }) => {
    return (
        <div id={id} className='image-text-section'>
            <div className='image-text-section-left'>
                <img className='image-text-section-image' src={image} alt='image-text' />
            </div>
            <div className='image-text-section-right'>
                {sections.map((section, index) => (
                    <div key={index} className='image-text-section-right-items'>
                        <h1 className='image-text-section-text'>{section.title}</h1>
                        <h3 className='image-text-section-text'>{section.subtitle}</h3>
                        {section.description.map((text, idx) => (
                            <p key={idx} className='image-text-section-text'>{text}</p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageText;
