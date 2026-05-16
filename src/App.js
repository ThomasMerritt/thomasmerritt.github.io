import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import Slider from './components/Slider';
import CharacterInformation from './components/CharacterInformation';
import ImageText from './components/ImageText';
import TextImage from './components/TextImage';
import Footer from './components/Footer';
import days from './10000_days.jpg';
import cursed from './cursed_image.JPEG';
import path from './path.jpg';
import resume from './Resume.pdf';

const App = () => {
    return (
        <div>
            <Header />
            <Slider />
            <CharacterInformation>
                <ImageText
                    id="hero-section"
                    image={cursed}
                    sections={[
                        {
                            title: "Heyo!",
                            description: [
                                "Feel free to look around! I'm not watching...",
                                "Yet anyways. <⁠(⁠￣⁠︶⁠￣⁠)⁠>",
                            ]
                        }
                    ]}
                />
                <TextImage
                    id="about-section"
                    image={days}
                    aboutContent={[
                        {
                            title: "Le Resume",
                            paragraphs: [
                                "I'll just shamelessly plug my resume here.",
                                "Also, feel free to check out my LinkedIn and GitHub!",
                            ]
                        },
                    ]}
                    buttons={[
                        { className: 'button-container', text: '(╯°□°)╯︵ ┻━┻' },
                    ]}
                    link={resume}
                />
                <TextImage
                    id="experience-section"
                    image={path}
                    borderRadius="0%"
                    width='100%'
                    height='100%'
                    aboutContent={[
                        {
                            title: "le Drive",
                            paragraphs: [
                                "Things I'm doing on the side.",
                                "Feel free to check it out!",
                                "Don't worry, it's absolutely virus free. ദ്ദി(ᵔᗜᵔ)",
                            ]
                        },
                       
                    ]}
                    buttons={[
                        { className: 'button-container', text: 'ԅ(≖‿≖ԅ)' },
                    ]}
                    link={'https://drive.google.com/drive/folders/1v0BPKVr6FP31BqPCi6fE-JNdGGam-Ej7?usp=sharing'}
                />
                
            </CharacterInformation>
            <Footer />
        </div>
    );
};

export default App;
