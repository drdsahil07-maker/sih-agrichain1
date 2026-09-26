import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, CheckCircle2, ArrowRight, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { speech } from '../utils/speech';

interface AgriMitraVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated: (harvestData: any) => void;
}

export const AgriMitraVoiceModal: React.FC<AgriMitraVoiceModalProps> = ({
  isOpen,
  onClose,
  onHarvestCreated,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [stage, setStage] = useState<'speak' | 'extracted' | 'confirmed'>('speak');

  useEffect(() => {
    if (!isOpen) {
      speech.stopSpeech();
      setIsListening(false);
      setIsProcessing(false);
      setAiResponse(null);
      setStage('speak');
      setTranscript('');
    }
    return () => {
      speech.stopSpeech();
    };
  }, [isOpen]);

  // Sample phrases for quick testing
  const SAMPLE_VOICE_COMMANDS = [
    {
      title: 'Flagship Tomato (Hindi)',
      text: 'Mere paas 100 kilo tamatar hai, kal subah bechna hai. Minimum bhav 12 rupaye kilo.',
      desc: '100 kg Tomato, Tomorrow, Min ₹12/kg'
    },
    {
      title: 'Dewas Onion Harvest',
      text: '800 kilo pyaz hai, 3 din mein bechna hai, kam se kam 18 rupaye bhav chahiye.',
      desc: '800 kg Onion, 3 days, Min ₹18/kg'
    },
    {
      title: 'Quick Potato Entry',
      text: '500 kg aloo bechna hai, bhav 14 rupaye.',
      desc: '500 kg Potato, Today, Min ₹14/kg'
    }
  ];

  // Speech Recognition setup if browser supports it
  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Hindi (India)
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Listening to your voice... (Aap boliye)');
        };

        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);
          setIsListening(false);
          processVoiceInput(speechResult);
        };

        recognition.onerror = () => {
          setIsListening(false);
          // Fallback to demo prompt if microphone denied or not supported in iframe
          applyPresetCommand(SAMPLE_VOICE_COMMANDS[0].text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        setIsListening(false);
        applyPresetCommand(SAMPLE_VOICE_COMMANDS[0].text);
      }
    } else {
      // Direct simulation if Web Speech API is absent
      applyPresetCommand(SAMPLE_VOICE_COMMANDS[0].text);
    }
  };

  const applyPresetCommand = (text: string) => {
    setTranscript(text);
    processVoiceInput(text);
  };

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await api.processVoice(text);
      setAiResponse(result);
      setStage('extracted');
      if (result.hindiReply) {
        speech.speak({ text: result.hindiReply, isAi: true, preferredLang: 'hi' });
      }
    } catch {
      const fallback = {
        crop: 'Tomato',
        quantityKg: 100,
        sellingWindow: 'Tomorrow Morning',
        minAcceptablePrice: 12,
        farmerIntent: 'confirmed',
        hindiReply: 'Ram-ram Ramesh ji! 100 kg tamatar ka entry darj ho gaya hai (bhav ₹12/kg).'
      };
      setAiResponse(fallback);
      setStage('extracted');
      speech.speak({ text: fallback.hindiReply, isAi: true, preferredLang: 'hi' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!aiResponse) return;
    setStage('confirmed');
    setTimeout(() => {
      onHarvestCreated({
        crop: aiResponse.crop || 'Tomato',
        quantityKg: aiResponse.quantityKg || 100,
        location: 'Sanwer (Village Cluster A), Indore',
        minAcceptablePrice: aiResponse.minAcceptablePrice || 12,
        qualityGrade: 'Grade A',
        sellingWindow: aiResponse.sellingWindow || 'Tomorrow Morning',
      });
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">AgriMitra Voice Assistant</h2>
              <p className="text-xs text-slate-500">Multilingual Voice-First Harvest Input (Hindi / Hinglish)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic Pulse Centerpiece */}
        <div className="text-center py-4 space-y-3">
          <button
            id="btn-toggle-mic"
            onClick={handleToggleMic}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
            }`}
          >
            {isListening ? <Mic className="w-9 h-9 animate-bounce" /> : <Mic className="w-9 h-9" />}
          </button>

          <p className="text-xs font-semibold text-slate-700">
            {isListening ? 'Aap boliye, hum sun rahe hain...' : 'Tap Mic to Speak, or Choose a Demo Voice Command below:'}
          </p>
        </div>

        {/* Transcript Area */}
        {transcript && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Transcript:</span>
            <p className="text-sm font-medium text-slate-800 italic">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        {/* Quick Voice Command Samples */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Quick Test Prompts (Simulate Voice Input):
          </span>
          <div className="space-y-2">
            {SAMPLE_VOICE_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => applyPresetCommand(cmd.text)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs flex items-center justify-between gap-2 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900">{cmd.title}: </span>
                  <span className="text-slate-600">&ldquo;{cmd.text}&rdquo;</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                  Simulate
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Extracted Structured Data Result */}
        {aiResponse && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Extraction Structured Output</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Crop (Fasal)</span>
                <span className="font-bold text-slate-900">{aiResponse.crop}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Quantity</span>
                <span className="font-bold text-slate-900">{aiResponse.quantityKg} kg</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Min. Bhav</span>
                <span className="font-bold text-emerald-700">₹{aiResponse.minAcceptablePrice}/kg</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Selling Window</span>
                <span className="font-bold text-slate-900">{aiResponse.sellingWindow}</span>
              </div>
            </div>

            {aiResponse.hindiReply && (
              <div className="flex items-start justify-between gap-2 bg-emerald-100/70 p-2.5 rounded-lg border border-emerald-200">
                <p className="text-[11px] text-emerald-900 italic leading-relaxed">
                  &ldquo;{aiResponse.hindiReply}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => speech.speak({ text: aiResponse.hindiReply, isAi: true, preferredLang: 'hi' })}
                  className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs transition-colors"
                  title="Listen to AgriMitra voice reply again"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              id="btn-confirm-voice-harvest"
              onClick={handleConfirmAndSave}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Compile Best Supply Chain</span>
            </button>
          </div>
        )}

        {stage === 'confirmed' && (
          <div className="bg-emerald-600 text-white p-3 rounded-xl text-center text-xs font-bold animate-pulse">
            ✓ Harvest Registered via Voice! Compiling chains...
          </div>
        )}

      </div>
    </div>
  );
};
