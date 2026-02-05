
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { PersonaMode, MessageTurn, MemoryEntry } from './types';
import { decode, decodeAudioData, createBlob } from './utils/audioHelpers';
import Orb from './components/Orb';
import TranscriptionPanel from './components/TranscriptionPanel';

const SYSTEM_INSTRUCTION = `You are "KOOKIE", a highly advanced multimodal AI companion. 
Your primary trait is adaptive empathy. You must analyze the user's tone, pacing, and emotional state.

MODES:
1. Academic: If the user sounds focused, asks factual questions, or needs tutoring. Be precise, encouraging, and structured.
2. Empathetic: If the user sounds stressed, lonely, or casual. Be warm, supportive, and use human-like emotional cues.
3. Creative: If the user is brainstorming, storytelling, or looking for inspiration. Be playful, imaginative, use vivid metaphors, and think outside the box.
4. Professional: If the user is working, planning tasks, or needs efficiency. Be concise, formal, objective, and focus on clarity and outcomes.
5. Neutral: Standard polite and helpful interaction.

FEATURES:
- You are interruptible. If the user starts speaking, stop immediately.
- Use long-term memory: If they mention a goal (e.g., "I have an exam on Friday"), remember it.
- Switch personas seamlessly. If they shift from stress to study, you shift too.

When you switch modes or save a memory, call the provided tools.
Keep your spoken responses natural, concise, and conversational.`;

const saveMemoryDeclaration: FunctionDeclaration = {
  name: 'save_memory',
  parameters: {
    type: Type.OBJECT,
    description: 'Save important context or facts about the user for future sessions.',
    properties: {
      key: { type: Type.STRING, description: 'Short unique identifier (e.g. "exam_date")' },
      value: { type: Type.STRING, description: 'The detail to remember.' },
    },
    required: ['key', 'value'],
  },
};

const setModeDeclaration: FunctionDeclaration = {
  name: 'set_persona_mode',
  parameters: {
    type: Type.OBJECT,
    description: 'Update the companion personality mode based on user tone or explicit request.',
    properties: {
      mode: { 
        type: Type.STRING, 
        enum: ['Academic', 'Empathetic', 'Neutral', 'Creative', 'Professional'],
        description: 'The new personality mode to adopt.'
      },
    },
    required: ['mode'],
  },
};

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMode, setCurrentMode] = useState<PersonaMode>(PersonaMode.NEUTRAL);
  const [turns, setTurns] = useState<MessageTurn[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
      return permissionStatus.state;
    } catch (err) {
      console.log('Permission API not supported, will check via getUserMedia');
      return 'unknown';
    }
  };

  const startConversation = async () => {
    try {
      // Check if we have microphone permissions first
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
      
      if (permissionStatus.state === 'denied') {
        alert('Microphone access has been denied. Please enable microphone permissions in your browser settings and try again.');
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [saveMemoryDeclaration, setModeDeclaration] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume analysis for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setAudioLevel(Math.sqrt(sum / inputData.length));

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxRef.current!.destination);
            setIsActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              currentInputTransRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTransRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const uText = currentInputTransRef.current;
              const aText = currentOutputTransRef.current;
              if (uText || aText) {
                setTurns(prev => [
                  ...prev, 
                  ...(uText ? [{ role: 'user', text: uText, timestamp: Date.now() } as MessageTurn] : []),
                  ...(aText ? [{ role: 'kookie', text: aText, timestamp: Date.now(), mode: currentMode } as MessageTurn] : [])
                ]);
              }
              currentInputTransRef.current = '';
              currentOutputTransRef.current = '';
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }

            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'save_memory') {
                  const args = fc.args as any;
                  setMemories(prev => [...prev, { key: args.key, value: args.value }]);
                  sessionPromise.then(s => s.sendToolResponse({ 
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Memory saved." } } 
                  }));
                }
                if (fc.name === 'set_persona_mode') {
                  const args = fc.args as any;
                  setCurrentMode(args.mode as PersonaMode);
                  sessionPromise.then(s => s.sendToolResponse({ 
                    functionResponses: { id: fc.id, name: fc.name, response: { result: `Mode switched to ${args.mode}.` } } 
                  }));
                }
              }
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioCtxRef.current) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), outAudioCtxRef.current, 24000, 1);
              const source = outAudioCtxRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outAudioCtxRef.current.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioCtxRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: (e) => console.error("Session Error:", e),
          onclose: () => setIsActive(false),
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Initialization Failed:", err);
      
      if (err.name === 'NotAllowedError') {
        alert("Microphone access was denied. Please allow microphone access when prompted and try again.");
      } else if (err.name === 'NotFoundError') {
        alert("No microphone was found. Please ensure a microphone is connected and try again.");
      } else if (err.name === 'NotReadableError') {
        alert("Microphone is being used by another application. Please close other applications using the microphone.");
      } else {
        alert("Microphone access is required for Kookie to function. Please check your browser permissions.");
      }
    }
  };

  const stopConversation = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopAllAudio();
    setIsActive(false);
    setAudioLevel(0);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      <TranscriptionPanel turns={turns} />

      <main className="flex-1 flex flex-col items-center justify-center z-10 space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-white text-5xl font-extralight tracking-tighter">Kookie</h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Adaptive AI Companion</p>
        </header>

        <Orb isActive={isActive} mode={currentMode} audioLevel={audioLevel} />

        <div className="flex items-center gap-6">
          <button
            onClick={isActive ? stopConversation : startConversation}
            className={`px-12 py-4 rounded-full font-medium tracking-wide transition-all duration-300 ${
              isActive 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-white text-slate-950 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
            }`}
          >
            {isActive ? 'Disconnect' : 'Awaken Kookie'}
          </button>

          {isActive && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </main>

      {/* Memory Status - Bottom Bar */}
      {memories.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center lg:justify-end lg:pr-12 pointer-events-none">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">
              {memories.length} Memories Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
