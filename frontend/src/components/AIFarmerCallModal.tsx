import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  X, 
  Sparkles, 
  User, 
  RefreshCw,
  Send,
  ArrowRight,
  DollarSign,
  Scale,
  Sprout,
  Play,
  RotateCcw
} from 'lucide-react';
import { speech } from '../utils/speech';
import { api } from '../services/api';

interface AIFarmerCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: (data: any) => void;
  farmerName?: string;
  farmerPhone?: string;
}

interface DialogueItem {
  id: string;
  speaker: string;
  text: string;
  isAi: boolean;
  timestamp: string;
}

type CallStage = 'calling' | 'ask_crop' | 'ask_quantity' | 'ask_price' | 'completed' | 'ended';

export const AIFarmerCallModal: React.FC<AIFarmerCallModalProps> = ({
  isOpen,
  onClose,
  onHarvestCreated,
}) => {
  const [callState, setCallState] = useState<CallStage>('calling');
  const [seconds, setSeconds] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [preferredLang, setPreferredLang] = useState<'hi' | 'en'>('hi');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Harvest data updated step by step
  const [harvestData, setHarvestData] = useState<{
    crop: string;
    quantityKg: number;
    minAcceptablePrice: number;
    sellingWindow: string;
    qualityGrade: 'Grade A' | 'Grade B' | 'Grade C';
    location: string;
  }>({
    crop: '',
    quantityKg: 0,
    minAcceptablePrice: 0,
    sellingWindow: 'Tomorrow Morning',
    qualityGrade: 'Grade A',
    location: 'Sanwer (Village Cluster A), Indore'
  });

  // Interactive inputs
  const [isListening, setIsListening] = useState(false);
  const [userInputText, setUserInputText] = useState('');
  const [isProcessingReply, setIsProcessingReply] = useState(false);

  const stopRingRef = useRef<(() => void) | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const autoPlayTimeoutRef = useRef<any>(null);

  // Helper to append dialogue and speak it
  const addDialogueMessage = (speaker: string, text: string, isAi: boolean): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: DialogueItem = {
      id,
      speaker,
      text,
      isAi,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setDialogue(prev => [...prev, newItem]);

    if (!isMuted) {
      speech.speak({
        text,
        isAi,
        rate: speechRate,
        preferredLang,
        onStart: () => {
          setIsSpeaking(true);
          setCurrentSpeakingId(id);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
        },
        onError: () => {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
        }
      });
    }

    return id;
  };

  // Replay speech
  const handleReplayAudio = (item: DialogueItem) => {
    speech.stopSpeech();
    speech.speak({
      text: item.text,
      isAi: item.isAi,
      rate: speechRate,
      preferredLang,
      onStart: () => {
        setIsSpeaking(true);
        setCurrentSpeakingId(item.id);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      }
    });
  };

  // Lifecycle when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      clearTimeout(autoPlayTimeoutRef.current);
      speech.stopSpeech();
      setCallState('calling');
      setSeconds(0);
      setDialogue([]);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      setIsAutoPlaying(false);
      setHarvestData({
        crop: '',
        quantityKg: 0,
        minAcceptablePrice: 0,
        sellingWindow: 'Tomorrow Morning',
        qualityGrade: 'Grade A',
        location: 'Sanwer (Village Cluster A), Indore'
      });
      return;
    }

    // Call connects after 1.5s -> Starts asking Question 1 (Crop)
    const connectTimer = setTimeout(() => {
      setCallState('ask_crop');

      // AI asks: Greeting + Which Crop?
      setTimeout(() => {
        addDialogueMessage(
          'AgriMitra (AI Calling Assistant)',
          'Namaste Ramesh ji! Main AgriChain se aapka AI Calling Assistant AgriMitra bol raha hoon. Ramesh ji, aaj aapke khet mein kaun si fasal (crop) taiyyar hui hai bechne ke liye?',
          true
        );
      }, 500);
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(autoPlayTimeoutRef.current);
      speech.stopSpeech();
    };
  }, [isOpen]);

  // Duration Timer
  useEffect(() => {
    let interval: any;
    if (callState !== 'calling' && callState !== 'ended') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [dialogue]);

  // Handle Farmer Answering Step 1: Crop
  const handleSelectCrop = (selectedCrop: string) => {
    setHarvestData(prev => ({ ...prev, crop: selectedCrop }));

    // 1. Farmer response in dialogue
    addDialogueMessage(
      'Ramesh Patel (Farmer)',
      `Bhaiya hamare paas ${selectedCrop} taiyyar hai bechne ke liye.`,
      false
    );

    // 2. AI proceeds to Step 2: Amount / Quantity
    setTimeout(() => {
      setCallState('ask_quantity');
      addDialogueMessage(
        'AgriMitra (AI Calling Assistant)',
        `Bahut badiya, ${selectedCrop}! Aur Ramesh ji, ${selectedCrop} ka kitna amount (quantity / wazan) hai aapke paas bechne ke liye?`,
        true
      );
    }, 1800);
  };

  // Handle Farmer Answering Step 2: Amount / Quantity
  const handleSelectQuantity = (qty: number) => {
    setHarvestData(prev => ({ ...prev, quantityKg: qty }));

    // 1. Farmer response in dialogue
    addDialogueMessage(
      'Ramesh Patel (Farmer)',
      `Lagbhag ${qty} kilo ${harvestData.crop || 'fasal'} hai, kal subah tak harvest taiyyar ho jayega.`,
      false
    );

    // 2. AI proceeds to Step 3: Minimum Price
    setTimeout(() => {
      setCallState('ask_price');
      addDialogueMessage(
        'AgriMitra (AI Calling Assistant)',
        `Samajh gaya, ${qty} kilo. Ramesh ji, aapka minimum price (kam se kam bhav) kya hona chahiye prati kilo taaki aapko pura munafa mile aur nuksaan na ho?`,
        true
      );
    }, 1800);
  };

  // Handle Farmer Answering Step 3: Minimum Price
  const handleSelectPrice = (price: number) => {
    setHarvestData(prev => ({ ...prev, minAcceptablePrice: price }));

    // 1. Farmer response in dialogue
    addDialogueMessage(
      'Ramesh Patel (Farmer)',
      `Kam se kam ${price} rupaye kilo bhav milna chahiye bhaiya. Mandi mein vyapari bohot kam laga rahe hain.`,
      false
    );

    // 2. AI confirms and compiles
    setTimeout(() => {
      setCallState('completed');
      addDialogueMessage(
        'AgriMitra (AI Calling Assistant)',
        `Bilkul theek Ramesh ji! Main aapka ${harvestData.quantityKg || 150} kg ${harvestData.crop || 'Tamatar'} @ minimum ₹${price}/kg ka entry confirm karta hoon. AgriChain turant aapke liye Indore ke verified buyers, shared return-trucks aur transparent aggregators compile kar raha hai. Dhanyawad!`,
        true
      );
    }, 1800);
  };

  // Auto-Play Demonstration sequence
  const startAutoPlay = () => {
    setIsAutoPlaying(true);
    speech.stopSpeech();

    // Reset conversation to initial state
    setDialogue([]);
    setCallState('ask_crop');
    setHarvestData({
      crop: '',
      quantityKg: 0,
      minAcceptablePrice: 0,
      sellingWindow: 'Tomorrow Morning',
      qualityGrade: 'Grade A',
      location: 'Sanwer (Village Cluster A), Indore'
    });

    // Step 1: AI asks Crop
    addDialogueMessage(
      'AgriMitra (AI Calling Assistant)',
      'Namaste Ramesh ji! Main AgriChain se aapka AI Calling Assistant AgriMitra bol raha hoon. Ramesh ji, aaj aapke khet mein kaun si fasal (crop) taiyyar hui hai bechne ke liye?',
      true
    );

    // After 3.5s: Farmer answers "Tamatar"
    autoPlayTimeoutRef.current = setTimeout(() => {
      setHarvestData(prev => ({ ...prev, crop: 'Tomato' }));
      addDialogueMessage(
        'Ramesh Patel (Farmer)',
        'Bhaiya hamare paas Tamatar (Tomato) taiyyar hai.',
        false
      );

      // After 3.5s: AI asks Quantity
      autoPlayTimeoutRef.current = setTimeout(() => {
        setCallState('ask_quantity');
        addDialogueMessage(
          'AgriMitra (AI Calling Assistant)',
          'Bahut achha, Tamatar! Aur Tamatar ka kitna amount (quantity / wazan) hai aapke paas bechne ke liye?',
          true
        );

        // After 3.5s: Farmer answers "150 kg"
        autoPlayTimeoutRef.current = setTimeout(() => {
          setHarvestData(prev => ({ ...prev, quantityKg: 150 }));
          addDialogueMessage(
            'Ramesh Patel (Farmer)',
            'Lagbhag 150 kilo tamatar hai, kal subah tak pack ho jayega.',
            false
          );

          // After 3.5s: AI asks Minimum Price
          autoPlayTimeoutRef.current = setTimeout(() => {
            setCallState('ask_price');
            addDialogueMessage(
              'AgriMitra (AI Calling Assistant)',
              'Samajh gaya 150 kilo. Ramesh ji, aapka minimum price (kam se kam bhav) kya hona chahiye prati kilo taaki aapko pura munafa mile?',
              true
            );

            // After 3.5s: Farmer answers "14 rupaye"
            autoPlayTimeoutRef.current = setTimeout(() => {
              setHarvestData(prev => ({ ...prev, minAcceptablePrice: 14 }));
              addDialogueMessage(
                'Ramesh Patel (Farmer)',
                'Kam se kam 14 rupaye kilo bhav milna chahiye bhaiya.',
                false
              );

              // After 3.5s: AI Confirms
              autoPlayTimeoutRef.current = setTimeout(() => {
                setCallState('completed');
                setIsAutoPlaying(false);
                addDialogueMessage(
                  'AgriMitra (AI Calling Assistant)',
                  'Bilkul theek Ramesh ji! 150 kg Tamatar @ minimum ₹14/kg confirm ho gaya hai. AgriChain Indore ke buyers aur shared return-trucks compile kar raha hai. Dhanyawad!',
                  true
                );
              }, 3600);
            }, 3600);
          }, 3600);
        }, 3600);
      }, 3600);
    }, 3600);
  };

  // Free-form speech or text handler via AI processing
  const handleCustomInput = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    setUserInputText('');
    setIsProcessingReply(true);

    // 1. Post user dialogue
    addDialogueMessage('Ramesh Patel (Farmer)', inputStr, false);

    // 2. Parse via NLU
    try {
      const parsed = await api.processVoice(inputStr);

      if (callState === 'ask_crop') {
        const cropFound = parsed.crop || 'Tomato';
        setHarvestData(prev => ({ ...prev, crop: cropFound }));
        setTimeout(() => {
          setCallState('ask_quantity');
          addDialogueMessage(
            'AgriMitra (AI Calling Assistant)',
            `Theek hai, ${cropFound}! Aur ${cropFound} ka kitna amount (quantity / wazan) bechna chahte hain aap?`,
            true
          );
        }, 1500);
      } else if (callState === 'ask_quantity') {
        const qtyFound = parsed.quantityKg || 150;
        setHarvestData(prev => ({ ...prev, quantityKg: qtyFound }));
        setTimeout(() => {
          setCallState('ask_price');
          addDialogueMessage(
            'AgriMitra (AI Calling Assistant)',
            `Got it, ${qtyFound} kilo. Ramesh ji, aapka minimum price (kam se kam bhav) kya hona chahiye prati kilo?`,
            true
          );
        }, 1500);
      } else if (callState === 'ask_price') {
        const priceFound = parsed.minAcceptablePrice || 14;
        setHarvestData(prev => ({ ...prev, minAcceptablePrice: priceFound }));
        setTimeout(() => {
          setCallState('completed');
          addDialogueMessage(
            'AgriMitra (AI Calling Assistant)',
            `Bahut badiya! ${harvestData.quantityKg || 150} kg ${harvestData.crop || 'Tamatar'} @ minimum ₹${priceFound}/kg entry confirm ho gayi hai. AgriChain compiler best route assemble kar raha hai!`,
            true
          );
        }, 1500);
      } else {
        // General conversational response
        setTimeout(() => {
          addDialogueMessage(
            'AgriMitra (AI Calling Assistant)',
            parsed.hindiReply || 'Haan Ramesh ji, aapki detail update ho gayi hai.',
            true
          );
        }, 1200);
      }
    } catch {
      setTimeout(() => {
        addDialogueMessage(
          'AgriMitra (AI Calling Assistant)',
          'Ji Ramesh ji, main ise note kar raha hoon.',
          true
        );
      }, 1200);
    } finally {
      setIsProcessingReply(false);
    }
  };

  // Quick options handler (🌾 Sell my crop, 💰 Check price, 🚚 Find transport, 📦 Track order, 💬 Talk to support)
  const handleQuickOptionClick = (option: string) => {
    if (option.includes('Sell')) {
      handleCustomInput('Mujhe meri fasal bechni hai');
    } else if (option.includes('price')) {
      handleCustomInput('Aaj tamatar ka kya bhav chal raha hai?');
    } else if (option.includes('transport')) {
      handleCustomInput('Sanwer se Indore ke liye truck chahiye');
    } else if (option.includes('Track')) {
      handleCustomInput('Meri consignment ORD-1024 ka status kya hai?');
    } else if (option.includes('support')) {
      handleCustomInput('Support se baat karni hai');
    }
  };

  // Speech Recognition Mic Toggle
  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = preferredLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setIsListening(false);
          handleCustomInput(result);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
        console.warn('Speech recognition error:', err);
      }
    } else {
      // Fallback
      if (callState === 'ask_crop') handleSelectCrop('Tomato');
      else if (callState === 'ask_quantity') handleSelectQuantity(150);
      else if (callState === 'ask_price') handleSelectPrice(14);
    }
  };

  // Mute / Unmute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    speech.setMuted(nextMute);
    if (nextMute) {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };

  // Hangup and finalize
  const handleEndCall = (save: boolean = true) => {
    speech.stopSpeech();
    clearTimeout(autoPlayTimeoutRef.current);
    setCallState('ended');

    if (save) {
      setTimeout(() => {
        onHarvestCreated({
          crop: harvestData.crop || 'Tomato',
          quantityKg: harvestData.quantityKg || 100,
          location: harvestData.location,
          minAcceptablePrice: harvestData.minAcceptablePrice || 12,
          qualityGrade: harvestData.qualityGrade,
          sellingWindow: harvestData.sellingWindow,
        });
        onClose();
      }, 1000);
    } else {
      setTimeout(onClose, 500);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 text-white rounded-3xl max-w-xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Call Top Header */}
        <div className="p-4 sm:p-5 text-center space-y-3 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 shrink-0">
          
          {/* Status micro-bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                AI Telephony Calling Agent
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                Crop &bull; Amount &bull; Minimum Price
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Mute Toggle */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isMuted 
                    ? 'bg-rose-950/70 border-rose-600/50 text-rose-400' 
                    : 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900'
                }`}
                title={isMuted ? 'Voice Muted (Click to Unmute)' : 'Voice Playing Aloud (Click to Mute)'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => handleEndCall(false)} 
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Caller Identity with Pulse Ring */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 ${
              isSpeaking ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
            } flex items-center justify-center text-emerald-400 font-bold shadow-xl transition-all duration-300`}>
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            </div>

            {isSpeaking && (
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-500/60 animate-ping pointer-events-none"></span>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-white">
              Calling: Ramesh Patel (Smallholder Farmer)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              +91 98260 11234 &bull; Sanwer Village Cluster, Indore, MP
            </p>
          </div>

          {/* Connection State & Equalizer */}
          <div className="flex items-center justify-center gap-3">
            <div className="text-xs font-mono font-bold">
              {callState === 'calling' && (
                <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                  Ringing Outbound Telephony Line (440Hz)...
                </span>
              )}
              {callState !== 'calling' && callState !== 'ended' && (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Call Connected &bull; {formatTime(seconds)}
                </span>
              )}
              {callState === 'ended' && <span className="text-slate-400">Call Terminated</span>}
            </div>

            {/* Speaking Waveform Equalizer */}
            {isSpeaking && !isMuted && (
              <div className="flex items-center gap-0.5 h-3.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 rounded-full">
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: '0.4s' }}></span>
                <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: '0.2s' }}></span>
                <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: '0.5s' }}></span>
                <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: '0.3s' }}></span>
                <span className="text-[10px] text-emerald-300 font-bold ml-1 font-mono">SPEAKING</span>
              </div>
            )}
          </div>

          {/* Question Sequence Stepper Tabs */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 text-[11px] font-semibold border-t border-slate-800">
            <div className={`p-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
              callState === 'ask_crop' 
                ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40' 
                : harvestData.crop
                  ? 'bg-slate-900/90 border-emerald-700/50 text-emerald-400' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <Sprout className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] block text-slate-400 uppercase font-mono">Q1: Crop</span>
                <span>{harvestData.crop || 'Kaun Sa Crop?'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
              callState === 'ask_quantity' 
                ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40' 
                : harvestData.quantityKg
                  ? 'bg-slate-900/90 border-emerald-700/50 text-emerald-400' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] block text-slate-400 uppercase font-mono">Q2: Amount</span>
                <span>{harvestData.quantityKg ? `${harvestData.quantityKg} kg` : 'Kitna Amount?'}</span>
              </div>
            </div>

            <div className={`p-2 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
              callState === 'ask_price' 
                ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40' 
                : harvestData.minAcceptablePrice
                  ? 'bg-slate-900/90 border-emerald-700/50 text-emerald-400' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] block text-slate-400 uppercase font-mono">Q3: Min Price</span>
                <span>{harvestData.minAcceptablePrice ? `₹${harvestData.minAcceptablePrice}/kg` : 'Min Bhav?'}</span>
              </div>
            </div>
          </div>

          {/* Mode & Auto-Play Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <button
              type="button"
              onClick={startAutoPlay}
              disabled={isAutoPlaying || callState === 'calling'}
              className="bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              <span>{isAutoPlaying ? 'Auto-Playing Demo...' : 'Auto-Play 3 Questions Demo'}</span>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as 'hi' | 'en')}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
              >
                <option value="hi">Voice: Hindi</option>
                <option value="en">Voice: Indian Eng</option>
              </select>

              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
              >
                <option value={0.85}>0.85x Speed</option>
                <option value={1.0}>1.0x Normal</option>
                <option value={1.15}>1.15x Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Options Bar (How can I help?) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-4 border-b border-slate-800/80 bg-slate-900/60 text-[11px] shrink-0">
          <span className="text-slate-400 font-medium shrink-0">How can I help?</span>
          {['🌾 Sell my crop', '💰 Check price', '🚚 Find transport', '📦 Track order', '💬 Talk to support'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleQuickOptionClick(opt)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 whitespace-nowrap cursor-pointer transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Live Conversation Transcript with Replay buttons */}
        <div 
          ref={chatScrollRef} 
          className="p-4 overflow-y-auto space-y-3 text-xs flex-1 bg-slate-950/70"
        >
          {dialogue.map((item) => {
            const isCurrentlySpeakingThis = currentSpeakingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl max-w-[88%] transition-all ${
                  item.isAi
                    ? 'bg-slate-900 text-slate-100 ml-auto rounded-tr-none border border-slate-800 shadow-sm'
                    : 'bg-emerald-950/80 text-emerald-100 mr-auto rounded-tl-none border border-emerald-800/40 shadow-sm'
                } ${isCurrentlySpeakingThis ? 'ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-900/40' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px]">
                  <span className="font-bold flex items-center gap-1">
                    {item.isAi ? '🤖 ' : '👨‍🌾 '}
                    {item.speaker}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>{item.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleReplayAudio(item)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Replay Voice Audio"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="leading-relaxed text-slate-200 text-xs sm:text-[13px]">{item.text}</p>
              </div>
            );
          })}

          {callState === 'calling' && (
            <div className="text-center py-8 text-slate-400 text-xs space-y-2">
              <div className="flex justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p>Ringing outbound telephony pipeline &amp; connecting to farmer...</p>
            </div>
          )}

          {isProcessingReply && (
            <div className="p-3 bg-slate-900 rounded-2xl max-w-[80%] ml-auto border border-slate-800 text-slate-400 flex items-center gap-2 italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>AgriMitra is listening and formulating spoken reply...</span>
            </div>
          )}
        </div>

        {/* Dynamic Action Buttons for the Active Question */}
        {callState !== 'calling' && callState !== 'ended' && !isAutoPlaying && (
          <div className="p-3.5 bg-slate-900/95 border-t border-slate-800/90 space-y-2 shrink-0">
            
            {/* Question 1 Action Chips: Select Crop */}
            {callState === 'ask_crop' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" />
                    AgriMitra is asking: &ldquo;Kaun si fasal (crop) hai?&rdquo;
                  </span>
                  <span>Tap to reply:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectCrop('Tomato')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🍅</span>
                    <span>Tomato (Tamatar)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCrop('Onion')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🧅</span>
                    <span>Onion (Pyaz)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCrop('Potato')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🥔</span>
                    <span>Potato (Aloo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCrop('Garlic')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🧄</span>
                    <span>Garlic (Lahsun)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Question 2 Action Chips: Select Amount / Quantity */}
            {callState === 'ask_quantity' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    AgriMitra is asking: &ldquo;Kitna amount (quantity / wazan) hai?&rdquo;
                  </span>
                  <span>Select quantity:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectQuantity(100)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>100 kg (Small Lot)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuantity(250)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>250 kg (Standard)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuantity(500)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>500 kg (5 Quintal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuantity(1000)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>1,000 kg (10 Quintal)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Question 3 Action Chips: Select Minimum Acceptable Price */}
            {callState === 'ask_price' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    AgriMitra is asking: &ldquo;Aapka minimum price (bhav) kya hona chahiye?&rdquo;
                  </span>
                  <span>Select minimum bhav:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPrice(12)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>₹12 / kg (Mandi Floor)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPrice(14)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ring-1 ring-emerald-500/40"
                  >
                    <span>₹14 / kg (Target Net)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPrice(16)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>₹16 / kg (Premium)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPrice(18)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>₹18 / kg (Direct Buyer)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Mic Speech & Text Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomInput(userInputText)}
                placeholder={
                  callState === 'ask_crop'
                    ? 'Boliye ya type karein (e.g., "Tamatar hai", "Onion hai")...'
                    : callState === 'ask_quantity'
                      ? 'Boliye ya type karein (e.g., "200 kilo", "5 quintal")...'
                      : callState === 'ask_price'
                        ? 'Boliye ya type karein (e.g., "14 rupaye kilo bhav chahiye")...'
                        : 'Reply to AgriMitra...'
                }
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Mic Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={isListening ? 'Listening to voice...' : 'Click to Speak via Microphone'}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleCustomInput(userInputText)}
                disabled={!userInputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Extracted Harvest Card */}
        {(harvestData.crop || harvestData.quantityKg > 0 || harvestData.minAcceptablePrice > 0) && (
          <div className="mx-4 my-2 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extracted Harvest Intelligence (Spoken NLU)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {callState === 'completed' ? '✓ All 3 Answers Confirmed' : 'Collecting Details...'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="text-slate-300">
                1. Crop: <strong className="text-white">{harvestData.crop || 'Pending...'}</strong>
              </div>
              <div className="text-slate-300">
                2. Amount: <strong className="text-white">{harvestData.quantityKg ? `${harvestData.quantityKg} kg` : 'Pending...'}</strong>
              </div>
              <div className="text-slate-300">
                3. Min Price: <strong className="text-emerald-400">{harvestData.minAcceptablePrice ? `₹${harvestData.minAcceptablePrice}/kg` : 'Pending...'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Call Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">AgriMitra Voice:</span> Telephony call active with neural voice questions.
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-hangup-call"
              type="button"
              onClick={() => handleEndCall(false)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              title="Hang up call"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Hang Up</span>
            </button>

            <button
              id="btn-confirm-ai-call"
              type="button"
              onClick={() => handleEndCall(true)}
              disabled={!harvestData.crop && !harvestData.quantityKg}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Compile Chains</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
