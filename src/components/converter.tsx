import React, { useState } from 'react';

const conversionTypes = [
    { label: 'CSS to SASS', value: 'css_to_sass' },
    { label: 'CSS to SCSS', value: 'css_to_scss' },
    { label: 'SASS to CSS', value: 'sass_to_css' },
    { label: 'SASS to SCSS', value: 'sass_to_scss' },
    // Add other conversion types as needed
];

const SassConverter = () => {
    const [inputStyle, setInputStyle] = useState('');
    const [outputStyle, setOutputStyle] = useState('');
    const [conversionType, setConversionType] = useState(conversionTypes[0].value);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputStyle(e.target.value);
    };

    const handleConversionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConversionType(e.target.value);
    };

    const convertStyle = async () => {
        setError('');
        setIsLoading(true);
        try {
            // Assuming a server endpoint '/convert-style' that handles different conversion types
            const response = await fetch('/convert-style', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ style: inputStyle, type: conversionType }),
            });
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const data = await response.json();
            setOutputStyle(data.convertedStyle);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="select">
                <select value={conversionType} onChange={handleConversionTypeChange}>
                    {conversionTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>
            <div className="field">
                <div className="control">
                    <textarea className="textarea" value={inputStyle} onChange={handleInputChange} placeholder="Enter your style code here"></textarea>
                </div>
            </div>
            <div className="field">
                <button className={`button is-primary ${isLoading ? 'is-loading' : ''}`} onClick={convertStyle}>
                    Convert
                </button>
            </div>
            {error && <p className="help is-danger">Error: {error}</p>}
            <div className="field">
                <div className="control">
                    <textarea className="textarea" value={outputStyle} readOnly></textarea>
                </div>
            </div>
        </div>
    );
};

export default SassConverter;
