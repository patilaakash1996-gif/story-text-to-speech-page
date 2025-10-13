import { useState, useEffect, useRef, type FC } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Play, Pause, Square, Volume2, Languages, Zap, ChevronsRight, BookOpen } from 'lucide-react';

// This helper component doesn't need to be changed
const ControlSlider: FC<{ id: string; label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; }> = ({ id, label, value, min, max, step, onChange, icon }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-slate-600">
      {icon}
      {label}
      <span className="font-bold text-slate-800">{value.toFixed(1)}</span>
    </label>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

const StoryTextToSpeechPage: NextPage = () => {
  const initialStory = `Story ka Perfect Ending aur Next Episode ka Connection\n\nThe End of Episode 1:\n\nFranklin un badmashon se bachkar nikal jaata hai aur us awesome supercar ko apne safe garage mein le aata hai. Woh bohot khush hai aur apni jeet ka jashn mana raha hai. Woh gaadi ke paas khada hokar uski beauty ko admire kar raha hota hai.\n\nThe TWIST (Jo Agle Episode ko Jodega):\n\nJab Franklin gaadi ke andar baithkar uske features check kar raha hota hai, toh usse glovebox (dashboard ka chota sa cabinet) ke andar se ek cheez milti hai... Ek Mysterious Pen Drive!`;

  const [text, setText] = useState<string>(initialStory);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);

  // NEW - State to store the character range of the currently spoken word
  const [currentWordRange, setCurrentWordRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const populateVoiceList = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (!selectedVoice) {
            const hindiVoice = availableVoices.find(v => v.lang === 'hi-IN');
            const indianEnglishVoice = availableVoices.find(v => v.lang === 'en-IN');
            setSelectedVoice(hindiVoice || indianEnglishVoice || availableVoices[0]);
        }
      }
    };
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
    populateVoiceList();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  const handleSpeak = () => {
    if (voices.length === 0 || !selectedVoice) {
        alert("Speech synthesis voices are still loading. Please try again in a moment.");
        return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }
    if (text.trim() === '') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // NEW - Listen for word boundaries
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordRange({ start: event.charIndex, end: event.charIndex + event.charLength });
      }
    };
    
    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      // NEW - Reset highlighting when speech ends
      setCurrentWordRange({ start: 0, end: 0 });
    };
    utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance.onerror', event); setIsSpeaking(false); setIsPaused(false); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => { window.speechSynthesis.pause(); setIsPaused(true); setIsSpeaking(false); };
  
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    // NEW - Reset highlighting when speech is stopped
    setCurrentWordRange({ start: 0, end: 0 });
  };

  // NEW - A helper function to render the highlighted text
  const renderHighlightedText = () => {
    const { start, end } = currentWordRange;
    if (start === 0 && end === 0) {
      return text; // No highlighting
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
        <title>Story Text-to-Speech | Highlighting</title>
        <meta name="description" content="A text-to-speech tool with real-time word highlighting" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 font-sans">
        <header className="p-4 border-b border-slate-200/80 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl"> <Volume2 size={24} /> </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Story Text-to-Speech</h1>
                    <p className="text-slate-500 text-sm">Bring your Hindi & English stories to life.</p>
                </div>
            </div>
        </header>

        <main className="flex items-center justify-center p-4">
          <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {/* Text Area for editing */}
                <label htmlFor="story-text" className="text-sm font-medium text-slate-700">Your Story (Editable)</label>
                <textarea
                  id="story-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your story here..."
                  className="w-full h-48 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-shadow duration-200 resize-none text-slate-700 leading-relaxed bg-white"
                />

                {/* NEW - The Reader View with Highlighting */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BookOpen size={16} /> Reading View
                  </label>
                  <div className="w-full h-48 p-4 border border-slate-300 rounded-xl bg-gray-50 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {renderHighlightedText()}
                  </div>
                </div>
              </div>

              {/* Right Column: Controls */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <label htmlFor="voice-select" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700"><Languages size={16} /> Voice / Language</label>
                  <select
                    id="voice-select"
                    value={selectedVoice?.name || ''}
                    onChange={(e) => { const voice = voices.find(v => v.name === e.target.value); setSelectedVoice(voice || null); }}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition-shadow duration-200"
                    disabled={voices.length === 0}
                  >
                    {voices.length > 0 ? voices.map(voice => (<option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)) : <option>Loading voices...</option>}
                  </select>
                </div>

                <div className="space-y-4">
                  <ControlSlider id="rate" label="Speed" value={rate} min={0.5} max={2} step={0.1} onChange={(e) => setRate(parseFloat(e.target.value))} icon={<ChevronsRight size={16} />} />
                  <ControlSlider id="pitch" label="Pitch" value={pitch} min={0} max={2} step={0.1} onChange={(e) => setPitch(parseFloat(e.target.value))} icon={<Zap size={16} />} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleSpeak} disabled={isSpeaking}
                      className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      {isPaused ? <><Play size={18} /> Resume</> : <><Play size={18} /> Speak</>}
                    </button>
                    <button
                      onClick={handlePause} disabled={!isSpeaking || isPaused}
                      className="flex items-center justify-center p-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      <Pause size={18} />
                    </button>
                  </div>
                  <button
                      onClick={handleStop} disabled={!isSpeaking && !isPaused}
                      className="w-full mt-3 flex items-center justify-center gap-2 p-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-red-200 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      <Square size={18} /> Stop
                    </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className="text-center p-6 text-slate-500 text-sm"> <p>&copy; {new Date().getFullYear()} Story TTS. All rights reserved.</p> </footer>
      </div>
    </>
  );
};

export default StoryTextToSpeechPage;
