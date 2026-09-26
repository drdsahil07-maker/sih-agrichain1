import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RefreshCw, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThreeRole } from '../../../shared/types';

interface AccountMenuProps {
  className?: string;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <button
        type="button"
        onClick={() => navigate('/choose-role')}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const roleLabelMap: Record<ThreeRole, string> = {
    farmer: 'Farmer',
    distributor: 'Distributor',
    transporter: 'Transporter',
    consumer: 'Consumer / Bulk Buyer',
    government_admin: 'Government Admin'
  };

  const roleColorMap: Record<ThreeRole, string> = {
    farmer: 'bg-emerald-600',
    distributor: 'bg-amber-600',
    transporter: 'bg-blue-600',
    consumer: 'bg-indigo-600',
    government_admin: 'bg-slate-600'
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    if (currentUser.role === 'consumer') {
      navigate('/consumer/profile');
    } else {
      navigate('/profile');
    }
  };

  const handleSwitchAccountType = () => {
    setIsOpen(false);
    navigate('/choose-role');
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/choose-role');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Account trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 pr-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className={`w-9 h-9 rounded-xl ${roleColorMap[currentUser.role]} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
          <User className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold text-slate-900 leading-tight">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-slate-500 font-medium capitalize">
            {roleLabelMap[currentUser.role]}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
      </button>

      {/* Dropdown Menu matching exact requirements */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-100">
          {/* Header block with Name and Role */}
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-100">
            <div className="text-sm font-black text-slate-900 font-display">
              {currentUser.name}
            </div>
            <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 capitalize">
              {roleLabelMap[currentUser.role]}
            </div>
          </div>

          {/* Action Links */}
          <div className="p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchAccountType}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer text-left"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Switch Account</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
