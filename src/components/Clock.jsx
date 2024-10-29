import { useState, useEffect } from 'react';
import '../styles/Clock.css';

const key = import.meta.env.VITE_GOOGLE_FONT_API_KEY;

function Clock() {
    const [date, setDate] = useState(new Date());
    const [font, setFont] = useState(localStorage.getItem('currentFont') || 'Roboto');
    const [fontList, setFontList] = useState({});
    const [uploadedFonts, setUploadedFonts] = useState(localStorage.getItem('uploadedFonts') || {});
    const [clockControl, setClockControl] = useState(false);
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSizes') || {date: 24, time: 64});
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(intervalID);
    }, []);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${key}`);
                const data = await response.json();
                const fonts = data.items.reduce((acc, font) => {
                    acc[font.family] = font;
                    return acc;
                }, {});
                setFontList(fonts);
            } catch (error) {
                console.error(error);
            };
        }

        fetchFonts();
    }, []);

    useEffect(() => {
        const fontURL = `https://fonts.googleapis.com/css2?family=${font.replaceAll(/ /g, '+')}&display=swap`;
        const link = document.createElement('link');
        link.href = fontURL;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => document.head.removeChild(link);
    }, [font]);

    useEffect(() => {
        const storedFonts = localStorage.getItem('uploadedFonts');
        if (storedFonts) {
            const parsedFonts = JSON.parse(storedFonts);
            setUploadedFonts(parsedFonts);

            Object.keys(parsedFonts).forEach(fontName => {
                const fontURL = parsedFonts[fontName].files.regular;
                const newFontFace = new FontFace(fontName, `url(${fontURL})`);
                newFontFace.load().then((loadedFont) => {
                    document.fonts.add(loadedFont);
                }).catch((error) => {
                    console.error(error);
                });
            });
        }
    }, []);

    useEffect(() => {
        const storedFontSizes = localStorage.getItem('fontSizes');
        if (storedFontSizes) {
            setFontSize(JSON.parse(storedFontSizes));
        }
    }, []);

    const saveCurrentFont = (fontName) => {
        localStorage.setItem('currentFont', fontName);
        setFont(fontName);
    }

    const handleClick = () => {
        setClockControl(!clockControl);
    }

    const fontOptions = [
        ...Object.keys(uploadedFonts),
        ...Object.keys(fontList)
    ].map(fontName => (
        <option key={fontName} value={fontName} style={{ fontFamily: fontName}}>{fontName}</option>
    ))

    const handleSubmit = (event) => {
        event.preventDefault();
        const fileInput = document.getElementById('upload');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fontName = file.name.split('.')[0];
                const fontURL = e.target.result;
                const style = document.createElement('style');

                style.innerHTML = `
                    @font-face {
                        font-family: '${fontName}';
                        src: url('${fontURL}');
                }`; 
                document.head.appendChild(style);
                setUploadedFonts((prev) => {
                    const updatedFonts = {
                        ...prev,
                        [fontName]: { family: fontName, files: { regular: fontURL } }
                    };
                    localStorage.setItem('uploadedFonts', JSON.stringify(updatedFonts));
                    return updatedFonts;
                });
                saveCurrentFont(fontName);
            };
            reader.readAsDataURL(file);
        }

        alert('Font uploaded successfully!');
    }

    const changeFontSize = (event) => {
        const { id, value } = event.target;
        if (!isNaN(value) && value != '') {
            setFontSize((prev) => {
                const updatedSizes = { ...prev, [id]: value + 'px' };
                localStorage.setItem('fontSizes', JSON.stringify(updatedSizes));
                return updatedSizes;
            });
        }
    }

    return (
        <div className="Clock">
            <div className="Display" onClick={handleClick}>
                <div className="Date">
                    <h1 style={{fontFamily: font, fontSize: fontSize.date}}>{`${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`}</h1>
                </div>
                <div className="Time">
                    <h1 style={{fontFamily: font, fontSize: fontSize.time}}>{date.toLocaleTimeString().slice(0, date.toLocaleTimeString().length - 2)}</h1>
                </div>
            </div>

            <div className="Clock-control">
                {clockControl ? null :
                    <div className="Font-picker">
                        <select value={font} onChange={e => saveCurrentFont(e.target.value)}>
                            {fontOptions}
                        </select>
                        <div className="Upload-font">
                            <label htmlFor="upload">Upload font </label>
                            <input type="file" id="upload" accept=".ttf, .otf" />
                            <button onClick={handleSubmit}>Upload</button>
                        </div>
                        <div className="Font-size">
                            <div className="Date-font-size">
                                <label htmlFor="date">Date font size: {parseInt(fontSize.date)}</label>
                                <br />
                                <input type="range" min="1" max="240" id="date" value={parseInt(fontSize.date)} onChange={changeFontSize} />
                            </div>
                            <div className="Time-font-size">
                                <label htmlFor="time">Time font size: {parseInt(fontSize.time)}</label>
                                <br />
                                <input type="range" min="1" max="240" id="time" value={parseInt(fontSize.time)} onChange={changeFontSize} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Clock;