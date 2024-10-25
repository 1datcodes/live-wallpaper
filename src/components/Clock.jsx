import { useState, useEffect } from 'react';
import '../styles/Clock.css';
import fontList from '../assets/google-fonts.json';

function Clock() {
    const [date, setDate] = useState(new Date());
    const [font, setFont] = useState('Roboto');
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const intervalID = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(intervalID);
    }, []);

    useEffect(() => {
        const fontUrl = fontList[font]?.variants?.normal?.['400']?.url?.woff2;
        if (fontUrl) {
            const link = document.createElement('link');
            link.href = fontUrl;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            }
        }
    }, [font]);

    const fontOptions = Object.keys(fontList).map(fontName => (
        <option key={fontName} value={fontName} style={{fontFamily: fontName}}>{fontName}</option>
    ))
    
    return (
        <div className="Clock">
            <div className="Date">
                <h1 style={{fontFamily: font}}>{`${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`}</h1>
            </div>
            <div className="Time">
                <h1 style={{fontFamily: font}}>{date.toLocaleTimeString().slice(0, date.toLocaleTimeString().length - 2)}</h1>
            </div>

            <div className="Font-picker">
                <select value={font} onChange={e => setFont(e.target.value)}>
                    {fontOptions}
                </select>
            </div>
        </div>
    )
}

export default Clock;