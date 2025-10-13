// Paste this entire block to replace your existing return statement

return (
    <>
      <Head>
        <title>Hindi Story Text to Speech</title>
        <meta name="description" content="A text-to-speech tool for Hindi and Hinglish stories" />
        <link rel="icon" href="/favicon.ico" />
        {/* NEW - Adding the "Inter" font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      {/* NEW - Main container with a gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 font-sans">
        
        {/* NEW - A professional header */}
        <header className="p-4 border-b border-slate-200/80 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                    <Volume2 size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Story Text-to-Speech</h1>
                    <p className="text-slate-500 text-sm">Bring your Hindi & English stories to life.</p>
                </div>
            </div>
        </header>

        {/* Your existing <main> tag, now centered within the new layout */}
        <main className="flex items-center justify-center p-4">
          <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mt-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Text Area */}
              <div className="md:col-span-2 space-y-4">
                <label htmlFor="story-text" className="text-sm font-medium text-slate-700">Your Story</label>
                <textarea
                  id="story-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your story here..."
                  className="w-full h-96 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-slate-700 leading-relaxed bg-white"
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
                      // NEW - More dynamic button classes
                      className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      {isPaused ? <><Play size={18} /> Resume</> : <><Play size={18} /> Speak</>}
                    </button>
                    <button
                      onClick={handlePause}
                      disabled={!isSpeaking || isPaused}
                      className="flex items-center justify-center p-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      <Pause size={18} />
                    </button>
                  </div>
                  <button
                      onClick={handleStop}
                      disabled={!isSpeaking && !isPaused}
                      // NEW - More dynamic button classes
                      className="w-full mt-3 flex items-center justify-center gap-2 p-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-red-200 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      <Square size={18} /> Stop
                    </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
