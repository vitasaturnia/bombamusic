import React from 'react';
import SassConverter from '../components/converter.tsx'; // Adjust the import path as necessary

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>SASS to SCSS Converter</h1>
            </header>
            <main>
                <SassConverter />
            </main>
        </div>
    );
}

export default App;
