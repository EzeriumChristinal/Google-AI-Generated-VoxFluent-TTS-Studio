import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Zap, Layers, Volume2 } from 'lucide-react';
import { AVAILABLE_VOICES, DEFAULT_PROMPT } from './constants';
import { GeneratedClip, TTSStatus } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, audioBufferToWav } from './utils/audioUtils';
import { VoiceSelector } from './components/VoiceSelector';
import { Button } from './components/Button';
import { HistoryItem } from './components/HistoryItem';

const App: React.FC = () => {
  const [text, setText] = useState(DEFAULT_PROMPT);
  const [selectedVoiceId, setSelectedVoiceId] = useState(AVAILABLE_VOICES[0].id);
  const [status, setStatus] = useState<TTSStatus>(TTSStatus.IDLE);
  const [history, setHistory] = useState<GeneratedClip[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // Audio context needs to be initialized on user interaction usually, 
  // but we can prep the class.
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext lazily
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 // Match Gemini TTS default
    });
    setAudioCtx(ctx);
    
    return () => {
      ctx.close();
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (!audioCtx) return;

    setStatus(TTSStatus.GENERATING);
    try {
      const base64Data = await generateSpeech(text, selectedVoiceId);
      
      // Decode base64 to byte array
      const pcmData = decodeBase64(base64Data);
      
      // Decode PCM to AudioBuffer for immediate playback capability if needed
      // (though we will use the WAV blob for standard HTML5 audio playback for simplicity in history)
      const audioBuffer = await decodeAudioData(pcmData, audioCtx, 24000);
      
      // Convert to WAV Blob for "download" and "src"
      const wavBlob = audioBufferToWav(audioBuffer);
      const blobUrl = URL.createObjectURL(wavBlob);

      const newClip: GeneratedClip = {
        id: crypto.randomUUID(),
        text: text,
        voiceName: selectedVoiceId,
        timestamp: Date.now(),
        audioBuffer: audioBuffer,
        blobUrl: blobUrl,
        duration: audioBuffer.duration
      };

      setHistory(prev => [newClip, ...prev]);
      setStatus(TTSStatus.IDLE);
      
    } catch (error) {
      console.error(error);
      setStatus(TTSStatus.ERROR);
      // Reset status after a delay
      setTimeout(() => setStatus(TTSStatus.IDLE), 3000);
    }
  };

  const handleDeleteClip = (id: string) => {
    setHistory(prev => {
      const clip = prev.find(c => c.id === id);
      if (clip) {
        URL.revokeObjectURL(clip.blobUrl);
      }
      return prev.filter(c => c.id !== id);
    });
    if (currentlyPlayingId === id) {
      setCurrentlyPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-sm flex items-center justify-center shadow-lg shadow-cyan-900/20">
              <Mic className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">VoxFluent</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">TTS Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-zinc-700 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {process.env.API_KEY ? 'System Ready' : 'API Key Missing'}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT: Controls & Input */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Voice Selection */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Layers size={18} />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Select Persona</h2>
              </div>
              <VoiceSelector 
                selectedVoiceId={selectedVoiceId} 
                onSelect={setSelectedVoiceId}
                disabled={status === TTSStatus.GENERATING} 
              />
            </section>

            {/* Input Area */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Zap size={18} />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Script Input</h2>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-sm opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={status === TTSStatus.GENERATING}
                  className="relative block w-full bg-zinc-900 text-white border border-zinc-700 rounded-sm p-6 text-lg leading-relaxed focus:outline-none focus:ring-0 placeholder-zinc-600 min-h-[240px] resize-none font-light"
                  placeholder="Type what you want to say..."
                />
                <div className="absolute bottom-4 right-4 text-xs text-zinc-500 font-mono">
                  {text.length} chars
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleGenerate} 
                disabled={status === TTSStatus.GENERATING || !text.trim()}
                variant="accent"
                className="w-full sm:w-auto min-w-[200px] h-14 text-lg shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)]"
                icon={status === TTSStatus.GENERATING ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Volume2 size={24} />}
              >
                {status === TTSStatus.GENERATING ? 'Synthesizing...' : 'Generate Speech'}
              </Button>
            </div>
            
            {status === TTSStatus.ERROR && (
               <div className="p-4 bg-red-900/20 border border-red-800 text-red-200 text-sm rounded-sm">
                 An error occurred while generating speech. Please check your API key and connection.
               </div>
            )}
          </div>

          {/* RIGHT: History */}
          <div className="lg:col-span-4 flex flex-col h-[calc(100vh-8rem)]">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                   <Layers size={18} />
                   <h2 className="text-sm font-semibold uppercase tracking-wider">Library</h2>
                </div>
                <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm">{history.length} Clips</span>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 pb-4">
               {history.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-sm p-8">
                   <Mic size={48} className="mb-4 opacity-20" />
                   <p className="text-sm text-center">No clips generated yet.</p>
                   <p className="text-xs text-center mt-2 opacity-50">Select a voice and enter text to begin.</p>
                 </div>
               ) : (
                 history.map(clip => (
                   <HistoryItem 
                     key={clip.id} 
                     clip={clip} 
                     onDelete={handleDeleteClip}
                     currentlyPlayingId={currentlyPlayingId}
                     setCurrentlyPlayingId={setCurrentlyPlayingId}
                   />
                 ))
               )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
