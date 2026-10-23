import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import Slider from './components/Slider';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';

const App = () => {
    return (
        <div className="page">
            <Header />
            <Slider />
            <Footer />
            <ScrollIndicator />
        </div>
    );
};

export default App;
