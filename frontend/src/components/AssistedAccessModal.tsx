import React, { useState } from 'react';
import { MessageSquare, Phone, Smartphone, Users, X, Send, Check, CheckCheck, Sparkles, Volume2 } from 'lucide-react';
import { speech } from '../utils/speech';

interface AssistedAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated: (data: any) => void;
}

export const AssistedAccessModal: React.FC<AssistedAccessModalProps> = ({
  isOpen,
  onClose,
  onHarvestCreated,
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'ivr' | 'kiosk'>('whatsapp');

  // WhatsApp simulation state
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string; time: string }[]>([
    { sender: 'bot', text: 'Namaste! Welcome to AgriChain WhatsApp Assistant. Type your harvest details to get compiled buyer offers.', time: '09:00 AM' },
    { sender: 'user', text: '100 kg tomato', time: '09:01 AM' },
    { sender: 'bot', text: 'Got it! Crop: Tomato | Quantity: 100 kg. Is this correct? (Reply YES or NO)', time: '09:01 AM' },
    { sender: 'user', text: 'Yes', time: '09:02 AM' },
    { sender: 'bot', text: 'What is your minimum acceptable price per kg? (e.g. 12)', time: '09:02 AM' },
    { sender: 'user', text: '12', time: '09:03 AM' },
    { sender: 'bot', text: '✓ Harvest registered! AgriChain Compiler found 4 routes. Best Net Value: ₹14.20/kg (+₹3.20/kg above local trader). Dynamic Pool #AC-1024 formed.', time: '09:03 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: 'Now' }
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Aapka sandesh prapt hua ("${userMsg}"). Fasal update kar di gayi hai!`,
          time: 'Now'
        }
      ]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
              Inclusive Rural Access
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1 font-display">
              Multi-Channel Assisted Access
            </h2>
            <p className="text-xs text-slate-500">
              Zero digital literacy barrier: Farmers access AgriChain via App, WhatsApp, IVR phone calls, or Village Kiosks.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Channel Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Bot</span>
          </button>

          <button
            onClick={() => setActiveChannel('ivr')}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeChannel === 'ivr'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>IVR Toll-Free</span>
          </button>

          <button
            onClick={() => setActiveChannel('kiosk')}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeChannel === 'kiosk'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CSC Kiosk Operator</span>
          </button>
        </div>

        {/* Channel 1: WhatsApp Bot Interactive UI */}
        {activeChannel === 'whatsapp' && (
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm bg-[#e5ddd5]">
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">
                AC
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs">AgriChain Verified Assistant</div>
                <div className="text-[10px] text-emerald-200">Official Business Account &bull; Automated</div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl max-w-[80%] shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#dcf8c6] ml-auto rounded-tr-none text-slate-900'
                      : 'bg-white mr-auto rounded-tl-none text-slate-900'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                    <span>{m.time}</span>
                    {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-2 bg-[#f0f0f0] flex items-center gap-2 border-t border-slate-300">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type harvest or price..."
                className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 rounded-full bg-[#075e54] text-white flex items-center justify-center cursor-pointer hover:bg-[#128c7e]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Channel 2: IVR Toll-Free Phone Flow */}
        {activeChannel === 'ivr' && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Toll-Free Interactive Voice Response (IVR 1800-AGRI-NET)</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                For farmers using basic feature phones (2G) without internet:
              </p>
              <button
                type="button"
                onClick={() => speech.speak({
                  text: 'AgriChain Toll Free IVR mein aapka swagat hai. Tamatar ke liye ek dabayein, pyaz ke liye do dabayein. Kripya fasal ki matra bolein. Aapka sabse behtar bhav choudah rupaye bees paise prati kilo mila hai.',
                  isAi: true,
                  preferredLang: 'hi'
                })}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg text-[11px] shadow-xs cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play IVR Voice Audio</span>
              </button>
            </div>
            <div className="space-y-2 font-mono text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
              <div>1. Dial <strong>1800-247-4242</strong> (Toll-Free in MP)</div>
              <div>2. &ldquo;Tamatar ke liye 1 dabayein, Pyaz ke liye 2 dabayein&rdquo;</div>
              <div>3. Farmer speaks quantity: &ldquo;100 kilo&rdquo; (Recognized via ASR)</div>
              <div>4. System reads back compiled best price: &ldquo;Aapka sabse behtar bhav ₹14.20/kg mila hai.&rdquo;</div>
              <div>5. Press 1 to confirm harvest pickup.</div>
            </div>
          </div>
        )}

        {/* Channel 3: Village Kiosk / CSC Operator */}
        {activeChannel === 'kiosk' && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Common Service Center (CSC) Village Operator Mode</span>
            </div>
            <p className="text-slate-600">
              Gram Panchayat kiosks and Village Level Entrepreneurs (VLEs) can aggregate entries on behalf of illiterate farmers:
            </p>
            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Aadhaar/Mobile Lookup</span>
                <span>Operator inputs farmer mobile (+91 98260 11234) to auto-fill landholding and bank details.</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Physical Weighing Receipt</span>
                <span>Direct printout of QR-coded consignment slip for farmer peace of mind.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
