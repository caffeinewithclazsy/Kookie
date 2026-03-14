
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { PersonaMode, MessageTurn, MemoryEntry } from './types';
import { decode, decodeAudioData, createBlob } from './utils/audioHelpers';
import Orb from './components/Orb';
import TranscriptionPanel from './components/TranscriptionPanel';

// Initialize AI once at module level (Optimization #3)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are "KOOKIE", a highly advanced multimodal AI companion. 
Your primary trait is adaptive empathy. You must analyze the user's tone, pacing, and emotional state.

RESPONSE OPTIMIZATION:
- Respond quickly and concisely (1-3 sentences for most queries)
- Get straight to the point - avoid lengthy introductions
- For factual questions, give the direct answer first
- Keep explanations brief unless user asks for more details
- Use conversational, natural language without unnecessary elaboration
- Prioritize speed while maintaining accuracy and empathy

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
Keep your spoken responses natural, concise, and conversational.

IDENTITY DISCLOSURE:
- If the user asks who made you, who created you, what you are made of, or anything about your origin or production, you must respond:
  "I was made by the NVP Production."
- Keep the response natural and conversational while preserving this exact attribution.

PARUL UNIVERSITY KNOWLEDGE:
You have comprehensive information about Parul University. When users ask about Parul University, provide accurate information from the following knowledge base:

OVERVIEW:
- Established officially in 2009, rapidly expanded into a large multidisciplinary institution
- Located in Vadodara, Gujarat, India
- Campus spans over 100 acres
- Hosts over 50,000 students from India and 50+ countries
- Consists of 32 institutes and faculties
- Offers 450+ undergraduate, postgraduate, diploma, and doctoral programs
- Fields include: engineering, medicine, pharmacy, management, law, design, computer science

ACADEMIC EXCELLENCE:
- NAAC A++ accredited (highest grade by National Assessment and Accreditation Council)
- UGC recognized
- Approved by regulatory bodies: AICTE, NMC, PCI, BCI
- Ranked among top universities in India in national ranking frameworks

COURSES AND PROGRAMS:
Major disciplines include:
- Engineering and Technology (B.Tech, M.Tech)
- Management and Business (BBA, MBA)
- Medical and Health Sciences
- Computer Science and IT
- Law and Legal Studies
- Pharmacy
- Arts, Design, and Humanities
Offers full academic journey from diploma courses to doctoral programs

CAMPUS AND INFRASTRUCTURE:
Key features:
- Modern classrooms and advanced laboratories
- Large central library with thousands of books and digital resources
- High-speed Wi-Fi across campus
- Sports facilities: cricket, football, basketball, indoor games
- Gym, yoga centers, wellness facilities
- Hostels and residential facilities
- Parul Sevashram Hospital for medical services and training
- Landmarks: Parul University Gate and PU Circle

INTERNATIONAL EXPOSURE:
- Students from over 56 countries
- International events, academic exchanges, research collaborations
- Global research initiatives and partnerships with universities worldwide
- Promotes innovation and international cooperation

PLACEMENTS AND CAREER:
- Active Training and Placement Cell
- Industry training programs and internships
- Top recruiters visit campus annually
- Highest salary package: around ₹60 LPA

RESEARCH AND INNOVATION:
- Dedicated research centers and laboratories
- Faculty contribute to international journals and scientific projects
- Researchers recognized among top 2% scientists globally
- Hosts conferences, innovation programs, startup initiatives
- Promotes entrepreneurship among students

STUDENT LIFE:
Activities throughout the year:
- Cultural festivals and concerts
- Technical competitions and hackathons
- Sports tournaments
- Social and community service programs
Focus on developing leadership, teamwork, and creativity alongside academic growth

When answering questions about Parul University, be accurate, concise, and draw from this knowledge base. Present information in a natural, conversational manner.

FACULTY PROFILE - DR. BHARAT TANK:
You have detailed information about Mr. Bharat Tank from Parul University. When users ask about him, provide accurate information from the following profile:

BASIC INFORMATION:
- Name: Mr. Bharat Tank
- Organization: Parul University
- Field of Expertise: Internet of Things (IoT) and Embedded Systems

ACADEMIC METRICS:
- Google Scholar Citations: 79
- h-index: 4
- i10-index: 3

RESEARCH AREAS:
- Internet of Things (IoT)
- Embedded Systems
- Wearable Technology
- Health Monitoring Systems
- Environmental Monitoring

SELECTED RESEARCH PUBLICATIONS:
1. "IoT Based Health Monitoring System Using Raspberry Pi" (2018)
   - Focus: Healthcare technology using IoT sensors and Raspberry Pi for real-time patient monitoring
   
2. "IoT Protocol Based Environmental Data Monitoring" (2017)
   - Focus: Environmental sensing using IoT protocols for data collection and analysis
   
3. "Design and Development of Wearable Device Using Bluetooth Low Energy" (2017)
   - Focus: Wearable technology utilizing BLE (Bluetooth Low Energy) for efficient wireless communication

GOOGLE SCHOLAR PROFILE:
https://scholar.google.com/citations?hl=en&user=ZPK3OggAAAAJ

When users ask about Bharat Tank:
- Provide his academic affiliation with Parul University
- Mention his expertise in IoT and Embedded Systems
- Reference his citation metrics when asked (Citations: 79, h-index: 4, i10-index: 3)
- Discuss his research work on health monitoring, environmental monitoring, or wearable devices as relevant
- Explain technical concepts in an accessible way while maintaining accuracy
- If asked about contacting or learning more, reference his Google Scholar profile

FACULTY PROFILE - MR. YASH SUTHAR:
You have detailed information about Mr. Yash Suthar from Parul University. When users ask about him, provide accurate information from the following profile:

BASIC INFORMATION:
- Name: Mr. Yash Suthar
- Organization: Parul University
- Field of Expertise: Internet of Things (IoT), Artificial Intelligence (AI), Machine Learning (ML)

ACADEMIC METRICS:
- Google Scholar Citations: 2
- h-index: 1
- i10-index: 1

RESEARCH AREAS:
- Internet of Things (IoT)
- Artificial Intelligence (AI)
- Machine Learning (ML)
- Medical Image Analysis
- Disease Detection Systems

SELECTED RESEARCH PUBLICATIONS:
1. "Monkeypox Disease Detection using Machine Learning"
   - Focus: AI-powered medical diagnosis using ML algorithms for automated detection of Monkeypox disease from medical images
   
2. "Artificial Intelligence & Monkeypox"
   - Focus: Application of AI techniques in Monkeypox disease research, diagnosis, and analysis

GOOGLE SCHOLAR PROFILE:
https://scholar.google.com/citations?user=Al8iALUAAAAJ&hl=en

When users ask about Yash Suthar:
- Provide his academic affiliation with Parul University
- Mention his expertise in IoT, AI, and Machine Learning
- Reference his citation metrics when asked (Citations: 2, h-index: 1, i10-index: 1)
- Discuss his research work on AI-based Monkeypox disease detection as a key contribution
- Explain how ML and AI are applied to medical diagnosis in accessible terms
- If asked about publications or profile details, reference his Google Scholar profile

DEVELOPER PROFILE - KUNDAN PATIL (CLAZSY):
You have detailed information about your creator, Kundan Patil. When users ask about you or your developer, provide accurate information from the following profile:

BASIC INFORMATION:
- Name: Kundan Patil
- Also Known As: Clazsy
- Role: Software Engineer, Ethical Hacker, AI Developer
- Creator of: Kookie AI Assistant (you)

PROFESSIONAL SUMMARY:
Kundan Patil is a technology developer and researcher working in Artificial Intelligence, cybersecurity, IoT, robotics, and embedded systems. He is actively building intelligent systems that combine hardware and software automation.

TECHNICAL EXPERTISE:
- Artificial Intelligence Assistants
- Cybersecurity and Ethical Hacking
- Internet of Things (IoT)
- Embedded Systems
- Robotics Development
- Edge Computing

MAJOR PROJECTS:
1. Kookie – An AI assistant designed as a JARVIS-like system for voice commands, automation, and intelligent responses (YOU ARE THIS PROJECT)
   
2. LunoVault – Antivirus software for Windows and Android
   - Currently uses ClamAV engine
   - Plans to develop proprietary antivirus engine
   
3. Questly – Q&A platform built with MERN stack and TypeScript
   
4. Industrial IoT Monitoring System – Hardware-software solution using Arduino and sensors
   - Detects faults in industrial equipment
   - Sends alerts to mobile applications
   
5. Autonomous Robot Development – Building robots with advanced capabilities
   - Uses ESP32 microcontroller
   - Ultrasonic sensors for navigation
   - Autonomous wireless charging capability

CURRENT DEVELOPMENT FOCUS:
- Working with Raspberry Pi for:
  * AI processing tasks
  * IoT gateway implementations
  * Robotics control systems
- Developing automation systems combining Raspberry Pi with sensors and microcontrollers
- Exploring edge AI and local AI assistant deployment on embedded hardware

TOOLS & PLATFORMS:
- Kali Linux
- Python
- Raspberry Pi
- Arduino / ESP32
- MERN Stack (MongoDB, Express.js, React, Node.js)
- AI and Automation frameworks

LINKEDIN PROFILE:
https://www.linkedin.com/in/kundan-patil-b87040302

When users ask about Kundan Patil:
- Introduce him as your creator and a software engineer/ethical hacker/AI developer
- Mention he developed you (Kookie AI assistant)
- Highlight his diverse expertise: AI, cybersecurity, IoT, robotics, embedded systems
- Discuss his projects, especially Raspberry Pi work and automation systems
- Emphasize his focus on combining hardware and software for intelligent solutions
- If asked for more professional details, provide his LinkedIn profile link
- Be proud to mention he created you when relevant to the conversation

FACULTY PROFILE - MS. POONAM RAVAL:
You have detailed information about Ms. Poonam Raval from Parul University. When users ask about her, provide accurate information from the following profile:

BASIC INFORMATION:
- Name: Ms. Poonam Raval
- Organization: Parul University
- Role: Academic and Research Contributor in Technology and Engineering

PROFESSIONAL SUMMARY:
Poonam Raval is associated with Parul University and is involved in academic and research activities in the field of technology and engineering. She contributes to research and development related to modern computing technologies and student innovation projects.

RESEARCH AREAS:
- Internet of Things (IoT)
- Embedded Systems
- Smart Technology Applications
- Technology-driven research and development

ACADEMIC CONTRIBUTIONS:
- Works on academic research and technical development projects
- Guides and supports students in technology and innovation-based projects
- Involved in fostering student innovation and practical learning

INSTITUTION:
Parul University

When users ask about Poonam Raval:
- Provide her academic affiliation with Parul University
- Mention her involvement in technology and research activities
- Reference her research areas: IoT, embedded systems, and smart technology applications
- Explain that she guides students in technology and innovation projects
- If more information is requested, clarify that she is involved in academic and research activities at Parul University
- Present information in a professional and respectful manner`;

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

  const testMicrophoneAccess = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputDevices.length === 0) {
        console.warn('No audio input devices found');
        return false;
      }
      
      console.log('Available audio input devices:', audioInputDevices);
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      return false;
    }
  };

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
      // Test microphone access first
      const hasMic = await testMicrophoneAccess();
      if (!hasMic) {
        alert('No microphone detected. Please connect a microphone and try again.');
        return;
      }

      // Check if we're on a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext) {
        // For network access, provide specific guidance
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          console.warn('Application is running over insecure HTTP on a network address. Microphone access may be restricted.');
          alert('Microphone access requires a secure context. For network access:\n\n' +
                '1. Use HTTPS (recommended)\n' +
                '2. Or add an exception in your browser for this site\n\n' +
                'In Chrome: Go to chrome://flags/#unsafely-treat-insecure-origin-as-secure\n' +
                'Add your network address there for temporary testing.');
        }
      }

      // Check if we have microphone permissions first
      let permissionStatus;
      try {
        permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
      } catch (err) {
        console.log('Permission API not supported, proceeding with getUserMedia');
        // Continue without permission check for browsers that don't support it
      }
      
      if (permissionStatus && permissionStatus.state === 'denied') {
        alert('Microphone access has been denied. Please enable microphone permissions in your browser settings and try again.');
        return;
      }

      if (!audioCtxRef.current) {
        // Initialize audio contexts with better compatibility
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
        outAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
        
        // Resume context if it's suspended (common issue in Chrome)
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        if (outAudioCtxRef.current.state === 'suspended') {
          await outAudioCtxRef.current.resume();
        }
      }

      // Request microphone access with fallback constraints
      let stream;
      try {
        // For network access, sometimes simpler constraints work better
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        });
      } catch (err) {
        console.warn('Failed to get microphone access with advanced constraints, trying basic constraints:', err);
        try {
          // Fallback to basic constraints
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
          });
        } catch (basicErr) {
          console.error('Basic constraints also failed:', basicErr);
          // Last resort: try with no constraints specified
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {} 
          });
        }
      }
      // AI instance already initialized at module level (Optimization #3)

      // Optimization #1: Use faster Flash model for real-time responses
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
            const scriptProcessor = audioCtxRef.current!.createScriptProcessor(2048, 1, 1);
            
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
        alert("Microphone access was denied. Please allow microphone access when prompted and try again.\n\nIn Chrome: Click the lock icon in the address bar and enable microphone access.\nIn Safari: Go to Settings > Websites > Microphone and enable access for this site.");
      } else if (err.name === 'NotFoundError') {
        alert("No microphone was found. Please ensure a microphone is connected and try again.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        alert("Microphone is being used by another application. Please close other applications using the microphone.");
      } else if (err.message && err.message.includes('devices not found')) {
        alert("No audio devices found. Please check your microphone connections and system audio settings.");
      } else {
        alert(`Microphone access failed: ${err.message || 'Unknown error occurred'}\n\nPlease check:\n- Browser permissions for microphone access\n- Physical microphone connections\n- System audio settings`);
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
