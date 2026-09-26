import React, { useState } from 'react';
import { 
  Sprout, 
  Cpu, 
  Boxes, 
  Truck, 
  ShoppingBag, 
  QrCode, 
  PhoneCall, 
  MapPin, 
  Camera,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Shield,
  Users,
  ClipboardList,
  Building2,
  Activity,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccountMenu } from './AccountMenu';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenVoice: () => void;
  onOpenCall: () => void;
  onOpenAssisted: () => void;
  onOpenQuality: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCall,
}) => {
  const { userProfile, role, setIsAuthModalOpen } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role-Aware Navigation Configuration
  // Farmer: Dashboard | Produce | Offers | Orders | Map
  // Distributor: Dashboard | Supply | Orders | Buyers | Map
  // Consumer: Dashboard | Requirements | Orders | Tracking
  // Transporter: Dashboard | Loads | Trips | Orders | Map
  // Government Admin: Command Center | Mandi Prices | Supply & Demand | Pooling | Logistics | Call Records | Reports
  const getTabsForRole = (userRole?: string) => {
    switch (userRole) {
      case 'farmer':
        return {
          main: [
            { id: 'landing', label: 'Dashboard', icon: Sprout },
            { id: 'compiler', label: 'Produce', icon: Cpu },
            { id: 'offers', label: 'Offers', icon: Sparkles },
            { id: 'farmer', label: 'Orders', icon: ShoppingBag },
            { id: 'map', label: 'Map', icon: MapPin },
          ],
          secondary: [
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
      case 'distributor':
        return {
          main: [
            { id: 'landing', label: 'Dashboard', icon: Sprout },
            { id: 'pooling', label: 'Supply', icon: Boxes },
            { id: 'farmer', label: 'Orders', icon: ShoppingBag },
            { id: 'buyer', label: 'Buyers', icon: Users },
            { id: 'map', label: 'Map', icon: MapPin },
          ],
          secondary: [
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
      case 'consumer':
        return {
          main: [
            { id: 'landing', label: 'Dashboard', icon: Sprout },
            { id: 'buyer', label: 'Requirements', icon: ClipboardList },
            { id: 'farmer', label: 'Orders', icon: ShoppingBag },
            { id: 'map', label: 'Tracking', icon: Truck },
          ],
          secondary: [
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
      case 'transporter':
        return {
          main: [
            { id: 'landing', label: 'Dashboard', icon: Sprout },
            { id: 'pooling', label: 'Loads', icon: Boxes },
            { id: 'transporter', label: 'Trips', icon: Truck },
            { id: 'farmer', label: 'Orders', icon: ShoppingBag },
            { id: 'map', label: 'Map', icon: MapPin },
          ],
          secondary: [
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
      case 'government_admin':
        return {
          main: [
            { id: 'admin', label: 'Command Center', icon: Shield },
            { id: 'mandi', label: 'Mandi Prices', icon: Building2 },
            { id: 'supply_demand', label: 'Supply & Demand', icon: Activity },
            { id: 'pooling', label: 'Pooling', icon: Boxes },
            { id: 'map', label: 'Logistics', icon: Truck },
            { id: 'reports', label: 'Reports', icon: FileText },
          ],
          secondary: [
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
      default:
        // Guest or unauthenticated initial view
        return {
          main: [
            { id: 'landing', label: 'Dashboard', icon: Sprout },
            { id: 'compiler', label: 'Produce', icon: Cpu },
            { id: 'farmer', label: 'Orders', icon: ShoppingBag },
            { id: 'buyer', label: 'Buyers', icon: Users },
            { id: 'map', label: 'Map', icon: MapPin },
          ],
          secondary: [
            { id: 'pooling', label: 'Consignment Pooling', icon: Boxes },
            { id: 'transporter', label: 'Backhaul Fleet', icon: Truck },
            { id: 'quality', label: 'Quality Scan', icon: Camera },
            { id: 'escrow', label: 'Escrow Settlement', icon: QrCode },
          ]
        };
    }
  };

  const { main: mainTabs, secondary: secondaryTabs } = getTabsForRole(role);

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-xs">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Online Status */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onSelectTab(role === 'government_admin' ? 'admin' : 'landing')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                  AGRICHAIN
                </span>
                <span 
                  title="Realtime sync active"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.id);
                    setIsMoreOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap
                    ${isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* More Menu Dropdown (if secondary tabs exist) */}
            {secondaryTabs.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer
                    ${secondaryTabs.some(t => t.id === currentTab) 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <span>Tools</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isMoreOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMoreOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Operational Utilities
                      </div>
                      {secondaryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              onSelectTab(tab.id);
                              setIsMoreOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer
                              ${isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                            `}
                          >
                            <Icon className="w-4 h-4 text-slate-500" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* Action Area: AI Farmer Voice Call & Account Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Show voice call button for farmers or guests */}
            {(role === 'farmer' || !role) && (
              <button
                id="btn-call-farmer"
                type="button"
                onClick={onOpenCall}
                className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>AI Voice Assistant</span>
              </button>
            )}

            {/* Direct Account / Role Menu */}
            <AccountMenu />

            {/* Mobile Menu Trigger */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Profile</span>
              <span className="text-xs font-bold text-slate-900 capitalize">
                {userProfile?.displayName || 'Active Account'} ({role || 'Guest'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Switch Role
            </button>
          </div>

          <div className="text-[11px] font-bold text-slate-400 uppercase px-1 py-0.5">Navigation Menu</div>
          {[...mainTabs, ...secondaryTabs].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer
                  ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {(role === 'farmer' || !role) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCall();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Open AI Voice Assistant</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
