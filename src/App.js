import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import Slider from './components/Slider';
import Footer from './components/Footer';

const App = () => {
    return (
        <div className="page">
            <Header />
            <Slider />
            <Footer />
        </div>
    );
};

export default App;
