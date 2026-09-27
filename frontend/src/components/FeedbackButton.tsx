import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/apiFetch';
import { MessageSquare, Star, X, Check, AlertCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  role: string;
  category: string;
  message: string;
  rating: number | null;
  page_context: string | null;
  created_at: string;
}

interface FeedbackButtonProps {
  currentTab: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ currentTab }) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  const [category, setCategory] = useState('Bug');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch admin feedback list if role is government_admin and admin view is open
  useEffect(() => {
    if (showAdminView && role === 'government_admin') {
      const fetchFeedback = async () => {
        try {
          const res = await fetchWithAuth('/api/feedback');
          const data = await res.json();
          if (data.success) {
            setAdminFeedback(data.data || []);
          }
        } catch (err) {
          console.error('Failed to load feedback', err);
        }
      };
      fetchFeedback();
    }
  }, [showAdminView, role]);

  if (!user) {
    return null; // Feedback system is strictly authenticated
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchWithAuth('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          rating,
          page_context: currentTab || 'Dashboard'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setMessage('');
        setRating(null);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        setErrorMsg(data.error?.message || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Failed to connect to API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setShowAdminView(false);
        }}
        className="fixed bottom-6 right-6 z-50 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700/50 transition-transform active:scale-95 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span>Feedback</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {showAdminView ? 'AgriChain Feedback Log' : 'Share Your Feedback'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  Logged in as <span className="font-semibold">{role}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {role === 'government_admin' && (
                  <button
                    onClick={() => setShowAdminView(!showAdminView)}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded-lg"
                  >
                    {showAdminView ? 'Submit Form' : 'View Feedback'}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              {showAdminView && role === 'government_admin' ? (
                /* Admin Feedback Log */
                <div className="space-y-4">
                  {adminFeedback.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No feedback reports recorded yet.
                    </div>
                  ) : (
                    adminFeedback.map((fb) => (
                      <div key={fb.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                            {fb.category}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(fb.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{fb.message}"</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>User Role: <strong className="text-slate-700">{fb.role}</strong></span>
                          {fb.rating && (
                            <span className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3 h-3 fill-amber-500" /> {fb.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Standard Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Feedback Submitted Successfully</h4>
                      <p className="text-xs text-slate-500">Thank you! Your suggestion has been securely recorded to Supabase.</p>
                    </div>
                  ) : (
                    <>
                      {errorMsg && (
                        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-100">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Category Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['Bug', 'Feature Request', 'Usability', 'Other'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center cursor-pointer ${
                                category === cat
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message Textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Message</label>
                        <textarea
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Please describe the issue or share your recommendation..."
                          className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden bg-slate-50"
                        />
                      </div>

                      {/* Rating Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">How would you rate this section?</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 cursor-pointer transition-transform active:scale-90"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  rating && rating >= star
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Page Context (Read Only indicator) */}
                      <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 border border-slate-100 flex justify-between">
                        <span>Automatic context:</span>
                        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {currentTab || 'Dashboard'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
