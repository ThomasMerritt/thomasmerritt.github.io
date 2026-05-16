import React, { useEffect } from "react";
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import '../styles/Footer.css';
import scape_no_human from '../scape-no-human.jpg';
import resume from '../Resume.pdf';

const Footer = () => {
    useEffect(() => {
        const footer = document.getElementsByClassName('footer-links-wrapper')[0];
        if (footer) footer.classList.toggle('fade');
    }, []);

    return (
        <ParallaxProvider>
            <Parallax y={[-10, 10]}>
                <footer id='footer-links-navigation-point' className='footer-links-wrapper' style={{
                    background: `linear-gradient(rgba(9, 23, 42), rgba(0, 0, 0, 0.2)),url(${scape_no_human}) no-repeat center center`,
                    backgroundSize: 'cover',
                    color: '#fff',
                    textAlign: 'center'
                    }}>
                    <Parallax y={[-20, 20]} speed={20}>
                        <ul className="footer-links">
                            <li><a href="mailto:thomasolivermerritt@gmail.com?subject=Feedback&body=Message">EMAIL</a></li>
                            <li><a href="https://www.linkedin.com/in/thomas-merritt-6630ab232?trk=people-guest_people_search-card">LINKEDIN</a></li>
                            <li><a href={resume}>RESUME</a></li>
                            <li><a href="https://github.com/ThomasMerritt">GITHUB</a></li>
                        </ul>
                    </Parallax>
                </footer>
            </Parallax>
        </ParallaxProvider>
    )
}

export default Footer;
