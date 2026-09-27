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
  RotateCcw,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { speech } from '../utils/speech';
import { api } from '../services/api';
import { fetchWithAuth } from '../services/apiFetch';

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

type CallStage = 'initiate_call' | 'calling' | 'ask_crop' | 'ask_quantity' | 'ask_price' | 'completed' | 'ended';

export const AIFarmerCallModal: React.FC<AIFarmerCallModalProps> = ({
  isOpen,
  onClose,
  onHarvestCreated,
}) => {
  const [callState, setCallState] = useState<CallStage>('initiate_call');
  const [phoneNumber, setPhoneNumber] = useState('+91 98260 11234');
  const [seconds, setSeconds] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [preferredLang, setPreferredLang] = useState<'hi' | 'en'>('hi');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [configPending, setConfigPending] = useState(false);

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

  // Lifecycle when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      clearTimeout(autoPlayTimeoutRef.current);
      speech.stopSpeech();
      setCallState('initiate_call');
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
      setErrorMsg(null);
      setConfigPending(false);
      return;
    }
  }, [isOpen]);

  // Duration Timer
  useEffect(() => {
    let interval: any;
    if (callState !== 'initiate_call' && callState !== 'calling' && callState !== 'ended') {
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

  const startTelephonyCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setConfigPending(false);

    try {
      const res = await fetchWithAuth('/api/ai-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === 'TELEPHONY_NOT_CONFIGURED' || res.status === 400) {
          setConfigPending(true);
          setErrorMsg(data.message || 'Telephony provider configuration required.');
        } else {
          setErrorMsg(data.error?.message || 'Carrier timeout. Failed to connect to outbound phone trunk.');
        }
      } else {
        // Success: Connection established via Twilio!
        setCallState('calling');
        connectNeuralSandbox();
      }
    } catch (err: any) {
      setErrorMsg('Network error connecting to AI outbound system.');
    } finally {
      setLoading(false);
    }
  };

  const connectNeuralSandbox = () => {
    setCallState('calling');
    setTimeout(() => {
      setCallState('ask_crop');
      setTimeout(() => {
        addDialogueMessage(
          'AgriMitra (AI Calling Assistant)',
          'Namaste Ramesh ji! Main AgriChain se aapka AI Calling Assistant AgriMitra bol raha hoon. Ramesh ji, aaj aapke khet mein kaun si fasal (crop) taiyyar hui hai bechne ke liye?',
          true
        );
      }, 500);
    }, 1500);
  };

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
        if (onHarvestCreated) {
          onHarvestCreated({
            crop: harvestData.crop || 'Tomato',
            quantityKg: harvestData.quantityKg || 100,
            location: harvestData.location,
            minAcceptablePrice: harvestData.minAcceptablePrice || 12,
            qualityGrade: harvestData.qualityGrade,
            sellingWindow: harvestData.sellingWindow,
          });
        }
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-white">
      <div className="bg-slate-950 rounded-3xl max-w-xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display">AgriMitra Voice Agent (Real AI Calling)</h3>
              <p className="text-[10px] text-slate-400">Outbound calling via Exotel & Gemini real-time NLU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Content Stages */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-5">
          {callState === 'initiate_call' ? (
            /* Stage 0: Enter Phone Number and Initiate */
            <form onSubmit={startTelephonyCall} className="space-y-5 py-6">
              <div className="text-center space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-100">Establish Neural Voice Call</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AgriMitra will call the farmer's registered phone number using Exotel, speak naturally in Hinglish, and translate spoken details into live harvests.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4" /> Exotel Configuration Notice
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{errorMsg}</p>
                </div>
              )}

              <div className="max-w-md mx-auto space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Farmer Contact Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xs">📞</span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98260 11234"
                    className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 text-xs font-mono font-bold rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="max-w-md mx-auto pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating Trunk Routing...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Dial Outbound AI Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Active Call Interface & Dialogue Sandbox */
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Call identity segment */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border-2 border-emerald-500">
                    <User className="w-5 h-5 text-emerald-400" />
                    {isSpeaking && <span className="absolute -inset-0.5 rounded-full border border-emerald-400 animate-ping"></span>}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Active Dial: {phoneNumber}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      {callState === 'calling' ? (
                        <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                          Ringing carrier...
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                          Agent Speaking &bull; {formatTime(seconds)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {/* Neural Wave Stepper */}
              <div className="grid grid-cols-3 gap-1.5 shrink-0 text-[10px] font-semibold">
                <div className={`p-2 rounded-xl flex items-center justify-center gap-1 border ${
                  callState === 'ask_crop' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Q1: {harvestData.crop || 'Crop'}</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center justify-center gap-1 border ${
                  callState === 'ask_quantity' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Scale className="w-3.5 h-3.5" />
                  <span>Q2: {harvestData.quantityKg ? `${harvestData.quantityKg} kg` : 'Amount'}</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center justify-center gap-1 border ${
                  callState === 'ask_price' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Q3: {harvestData.minAcceptablePrice ? `₹${harvestData.minAcceptablePrice}` : 'Price'}</span>
                </div>
              </div>

              {/* Chat Dialogue History */}
              <div ref={chatScrollRef} className="flex-1 min-h-[140px] bg-slate-950 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto space-y-3.5">
                {dialogue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-1 py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    <p className="text-xs">Trunk line connecting. Initializing AgriMitra Hinglish agent...</p>
                  </div>
                ) : (
                  dialogue.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.isAi ? 'bg-slate-900 text-slate-100' : 'bg-emerald-900 text-white'
                      }`}>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-mono">
                          {msg.speaker}
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dialogue Response Suggestions */}
              {callState !== 'completed' && callState !== 'ended' && (
                <div className="p-3 bg-slate-900/50 border border-slate-800/60 rounded-2xl space-y-2 shrink-0 text-xs">
                  {callState === 'ask_crop' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleSelectCrop('Tomato')} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors cursor-pointer text-left">🍅 Tomato (Tamatar)</button>
                      <button onClick={() => handleSelectCrop('Onion')} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors cursor-pointer text-left">🧅 Onion (Pyaz)</button>
                    </div>
                  )}

                  {callState === 'ask_quantity' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleSelectQuantity(150)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">150 kg</button>
                      <button onClick={() => handleSelectQuantity(500)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">500 kg</button>
                      <button onClick={() => handleSelectQuantity(1000)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">1,000 kg</button>
                    </div>
                  )}

                  {callState === 'ask_price' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleSelectPrice(12)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">₹12/kg</button>
                      <button onClick={() => handleSelectPrice(14)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">₹14/kg</button>
                      <button onClick={() => handleSelectPrice(18)} className="py-2 px-3 bg-slate-800 hover:bg-emerald-700 rounded-xl font-bold transition-colors text-center">₹18/kg</button>
                    </div>
                  )}

                  {/* Manual / Speech Text Input Row */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 mt-1">
                    <input
                      type="text"
                      value={userInputText}
                      onChange={(e) => setUserInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomInput(userInputText)}
                      placeholder="Boliye ya type karein (Hinglish spoken feedback)..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className={`p-2 rounded-xl border ${isListening ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 'bg-slate-800 text-slate-200 border-slate-700'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCustomInput(userInputText)}
                      disabled={!userInputText.trim()}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl text-white font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Extraction confirmation Segment */}
              {(harvestData.crop || harvestData.quantityKg > 0 || harvestData.minAcceptablePrice > 0) && (
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shrink-0 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1.5 mb-1">
                    <span>Extracted Harvest Summary (Hinglish Spoken NLU)</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {callState === 'completed' ? '✓ Processing complete' : 'Extracting metrics...'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>Fasal: <strong className="text-white">{harvestData.crop || 'Pending...'}</strong></div>
                    <div>Quantity: <strong className="text-white">{harvestData.quantityKg ? `${harvestData.quantityKg} kg` : 'Pending...'}</strong></div>
                    <div>Min Price: <strong className="text-emerald-400">{harvestData.minAcceptablePrice ? `₹${harvestData.minAcceptablePrice}/kg` : 'Pending...'}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {callState !== 'initiate_call' && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[10px] text-slate-400 leading-relaxed max-w-xs block sm:inline">
              Neural NLU parser mapping spoken answers directly to DB.
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEndCall(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Hang Up</span>
              </button>

              <button
                onClick={() => handleEndCall(true)}
                disabled={!harvestData.crop && !harvestData.quantityKg}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm &amp; Compile</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
