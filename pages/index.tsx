import { useState, useEffect, useRef, type FC } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Play, Pause, Square, Volume2, Languages, Zap, ChevronsRight, LoaderCircle, BookOpen } from 'lucide-react';

// This helper component is fine
const ControlSlider: FC<{ id: string; label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; }> = ({ id, label, value, min, max, step, onChange, icon }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-slate-600">
            {icon} {label} <span className="font-bold text-slate-800">{value.toFixed(1)}</span>
        </label>
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
);

const StoryTextToSpeechPage: NextPage = () => {
    const initialStory = `Story ka Perfect Ending aur Next Episode ka Connection\n\nThe End of Episode 1:\n\nFranklin un badmashon se bachkar nikal jaata hai aur us awesome supercar ko apne safe garage mein le aata hai. Woh bohot khush hai aur apni jeet ka jashn mana raha hai. Woh gaadi ke paas khada hokar uski beauty ko admire kar raha hota hai.`;

    const [text, setText] = useState<string>(initialStory);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState<number>(1);
    const [pitch, setPitch] = useState<number>(1);
    const [isSpeechReady, setIsSpeechReady] = useState<boolean>(false);
    
    // THE UPGRADE: State for highlighting
    const [currentWordRange, setCurrentWordRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 });

    useEffect(() => {
        const populateVoiceList = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length === 0) return;
            setVoices(availableVoices);
            const hindiVoice = availableVoices.find(v => v.lang === 'hi-IN');
            const indianEnglishVoice = availableVoices.find(v => v.lang === 'en-IN');
            setSelectedVoice(prev => prev || hindiVoice || indianEnglishVoice || availableVoices[0]);
            setIsSpeechReady(true); 
        };
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
        populateVoiceList();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    const handleSpeak = () => {
        if (!isSpeechReady || !selectedVoice) return;
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;

        // THE UPGRADE: Listen for word boundaries
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setCurrentWordRange({ start: event.charIndex, end: event.charIndex + event.charLength });
            }
        };

        utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            // THE UPGRADE: Reset highlighting on end
            setCurrentWordRange({ start: 0, end: 0 });
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentWordRange({ start: 0, end: 0 });
        };
        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsSpeaking(false); };
    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        // THE UPGRADE: Reset highlighting on stop
        setCurrentWordRange({ start: 0, end: 0 });
    };

    // THE UPGRADE: Helper function to render the highlighted text
    const renderHighlightedText = () => {
        const { start, end } = currentWordRange;
        // Only show highlighting if we are actively speaking
        if (!isSpeaking || (start === 0 && end === 0)) {
            return text;
        }
        return (
            <>
                {text.substring(0, start)}
                <span className="bg-yellow-200 rounded">
                    {text.substring(start, end)}
                </span>
                {text.substring(end)}
            </>
        );
    };

    return (
        <>
            <Head>
                <title>Story TTS with Highlighting</title>
                <meta name="description" content="A professional text-to-speech tool with real-time highlighting." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                                <Volume2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Story Text-to-Speech</h1>
                                <p className="text-slate-500">Bring your Hindi & English stories to life.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* THE UPGRADE: The left column is now the highlighting "Reading View" */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><BookOpen size={16} /> Reading View</label>
                                <div className="w-full h-[350px] p-4 border border-slate-300 rounded-xl bg-gray-50 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-800">
                                    {renderHighlightedText()}
                                </div>
                            </div>
                            
                            {/* Right Column: Controls and the Editable Text Area */}
                            <div className="space-y-6 flex flex-col">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="voice-select" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700"><Languages size={16} /> Voice / Language</label>
                                        <select id="voice-select" value={selectedVoice?.name || ''} onChange={(e) => { const voice = voices.find(v => v.name === e.target.value); setSelectedVoice(voice || null); }} className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 transition-shadow duration-200" disabled={!isSpeechReady}>
                                            {isSpeechReady ? voices.map(voice => (<option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)) : <option>Loading voices...</option>}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <ControlSlider id="rate" label="Speed" value={rate} min={0.5} max={2} step={0.1} onChange={(e) => setRate(parseFloat(e.target.value))} icon={<ChevronsRight size={16} />} />
                                        <ControlSlider id="pitch" label="Pitch" value={pitch} min={0} max={2} step={0.1} onChange={(e) => setPitch(parseFloat(e.target.value))} icon={<Zap size={16} />} />
                                    </div>
                                    {/* THE UPGRADE: The editable textarea is now here */}
                                    <div>
                                        <label htmlFor="story-text" className="text-sm font-medium text-slate-700">Edit Your Story</label>
                                        <textarea
                                            id="story-text"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Enter your story here..."
                                            className="w-full h-[120px] p-3 mt-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 resize-none text-slate-700 leading-relaxed bg-white"
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-200 mt-auto">
                                    {!isSpeechReady && (
                                        <div className="flex items-center justify-center gap-2 p-3 text-slate-500">
                                            <LoaderCircle className="animate-spin" size={18} /> <span>Initializing Audio...</span>
                                        </div>
                                    )}
                                    <div className={`space-y-3 ${!isSpeechReady ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <button onClick={handleSpeak} disabled={!isSpeechReady || isSpeaking} className="flex-grow flex items-center justify-center gap-2 p-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.S5 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none">
                                                {isPaused ? <><Play size={18} /> Resume</> : <><Play size={18} /> Speak</>}
                                            </button>
                                            <button onClick={handlePause} disabled={!isSpeechReady || !isSpeaking || isPaused} className="flex-shrink-0 flex items-center justify-center h-[48px] w-[48px] bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none">
                                                <Pause size={18} />
                                            </button>
                                        </div>
                                        <button onClick={handleStop} disabled={!isSpeechReady || (!isSpeaking && !isPaused)} className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-red-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none">
                                            <Square size={18} /> Stop
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default StoryTextToSpeechPage;
