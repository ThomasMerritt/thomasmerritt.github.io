import React from 'react';
import '../styles/TextImage.css';

const TextImage = ({ id, image, aboutContent, borderRadius, width, height, buttons, link}) => {
    return (
        <div id={id} className='text-image-section'>
            <div className='text-image-section-right'>
                <div className='text-image-section-right-items'>
                    {aboutContent.map((section, index) => (
                        <div key={index}>
                            <h1 className='text-image-section-text'>{section.title}</h1>
                            {section.paragraphs.map((text, idx) => (
                                <p key={idx} className='text-image-section-text'>{text}</p>
                            ))}
                        </div>
                    ))}
                    <div className='button-container'>
                        {buttons.map((button, idx) => (
                            <button key={idx} className={'resume-button'}><a href={link}>{button.text}</a></button>
                        ))}
                    </div>
                </div>
            </div>
            <div className='text-image-section-left'>
                <img className='text-image-section-image' style={{ borderRadius: borderRadius, width: width, height: height }}
                 src={image} alt='about'/>
            </div>
        </div>
    );
};

export default TextImage;