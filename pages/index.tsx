import { useState, useEffect, useRef, type FC } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Play, Pause, Square, Volume2, Languages, Zap, ChevronsRight } from 'lucide-react';

// Helper component for sliders
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
  const initialStory = `Story ka Perfect Ending aur Next Episode ka Connection\n\nThe End of Episode 1:\n\nFranklin un badmashon se bachkar nikal jaata hai aur us awesome supercar ko apne safe garage mein le aata hai. Woh bohot khush hai aur apni jeet ka jashn mana raha hai. Woh gaadi ke paas khada hokar uski beauty ko admire kar raha hota hai.\n\nThe TWIST (Jo Agle Episode ko Jodega):\n\nJab Franklin gaadi ke andar baithkar uske features check kar raha hota hai, toh usse glovebox (dashboard ka chota sa cabinet) ke andar se ek cheez milti hai... Ek Mysterious Pen Drive!\n\nWoh hairaan ho jaata hai ki yeh yahan kya kar rahi hai. Woh pen drive ko dekhta hai aur uspar ek chota sa sticker laga hota hai jispar ek ajeeb sa symbol (logo) bana hai.\n\nEpisode 1 ka Final Dialogue:\n\n(Franklin pen drive ko haath mein lekar kehta hai) \"Yeh... yeh kya cheez hai? In badmashon ne itni mehengi gaadi ke liye itni security sirf gaadi ke liye nahi rakhi thi... iska matlab, woh is PEN DRIVE ko protect kar rahe the! Iske andar aisa kya hai?\"\n\n(Screen par bada sa text aata hai: \"TO BE CONTINUED...\")`;

  const [text, setText] = useState<string>(initialStory);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Try to set a default Indian voice
        const hindiVoice = availableVoices.find(v => v.lang === 'hi-IN');
        const indianEnglishVoice = availableVoices.find(v => v.lang === 'en-IN');
        setSelectedVoice(hindiVoice || indianEnglishVoice || availableVoices[0]);
      }
    };

    // Voices are loaded asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial call

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (text.trim() === '') return;

    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
        setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <>
      <Head>
        <title>Hindi Story Text to Speech</title>
        <meta name="description" content="A text-to-speech tool for Hindi and Hinglish stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                    <Volume2 size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Story Text-to-Speech</h1>
                    <p className="text-slate-500">Bring your Hindi & English stories to life.</p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Text Area */}
            <div className="md:col-span-2 space-y-4">
              <label htmlFor="story-text" className="text-sm font-medium text-slate-700">Your Story</label>
              <textarea
                id="story-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your story here..."
                className="w-full h-96 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-slate-700 leading-relaxed"
              />
            </div>

            {/* Right Column: Controls */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <label htmlFor="voice-select" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
                  <Languages size={16} /> Voice / Language
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
                  disabled={voices.length === 0}
                >
                  {voices.length > 0 ? (
                    voices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  ) : (
                    <option>Loading voices...</option>
                  )}
                </select>
              </div>

              <div className="space-y-4">
                <ControlSlider 
                    id="rate"
                    label="Speed"
                    value={rate}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    icon={<ChevronsRight size={16} />}
                />
                <ControlSlider 
                    id="pitch"
                    label="Pitch"
                    value={pitch}
                    min={0}
                    max={2}
                    step={0.1}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    icon={<Zap size={16} />}
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isPaused ? <><Play size={18} /> Resume</> : <><Play size={18} /> Speak</>}
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={!isSpeaking || isPaused}
                    className="flex items-center justify-center p-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Pause size={18} />
                  </button>
                </div>
                <button
                    onClick={handleStop}
                    disabled={!isSpeaking && !isPaused}
                    className="w-full mt-3 flex items-center justify-center gap-2 p-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:bg-red-200 disabled:cursor-not-allowed"
                  >
                    <Square size={18} /> Stop
                  </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StoryTextToSpeechPage;
