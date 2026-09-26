import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CompilerView } from './components/CompilerView';
import { FarmerDashboard } from './components/FarmerDashboard';
import { DynamicPoolingView } from './components/DynamicPoolingView';
import { TransporterDashboard } from './components/TransporterDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { QualityVerificationView } from './components/QualityVerificationView';
import { CorridorMapView } from './components/CorridorMapView';
import { EscrowSettlementView } from './components/EscrowSettlementView';
import { LandingOverview } from './components/LandingOverview';
import { GovernmentDashboard } from './pages/admin/GovernmentDashboard';
import { AdminCommandCenter } from './components/AdminCommandCenter';

// Modals
import { AgriMitraVoiceModal } from './components/AgriMitraVoiceModal';
import { AIFarmerCallModal } from './components/AIFarmerCallModal';
import { AssistedAccessModal } from './components/AssistedAccessModal';
import { SellHarvestModal } from './components/SellHarvestModal';
import { AuthModal } from './components/AuthModal';

import { Harvest, ChainOption, QualityGrade } from '../../shared/types';
import { api } from './services/api';
import { SEED_HARVESTS } from '../../shared/data/seedData';
import { useAuth } from './context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const { isAuthModalOpen, setIsAuthModalOpen, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [compilerHarvest, setCompilerHarvest] = useState<Harvest | undefined>(undefined);
  const [activeHarvests, setActiveHarvests] = useState<Harvest[]>([]);

  useEffect(() => {
    api.getHarvests().then(setActiveHarvests);
  }, []);

  // When logged in as government admin, default to admin portal if on landing
  useEffect(() => {
    if (role === 'government_admin' && currentTab === 'landing') {
      setCurrentTab('admin');
    }
  }, [role]);
  
  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isAssistedOpen, setIsAssistedOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleHarvestCreated = (newHarvest: Harvest) => {
    setActiveHarvests((prev) => [newHarvest, ...prev]);
    setCompilerHarvest(newHarvest);
    setCurrentTab('compiler');
    showNotification(`New harvest recorded: ${newHarvest.crop} (${newHarvest.quantityKg}kg). Compiling routes...`);
  };

  const handleChainAccepted = (chain: ChainOption) => {
    showNotification(`Consignment accepted! Assigned to Pool #${chain.id || 'POOL-IND-01'}`);
    setCurrentTab('farmer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenCall={() => setIsCallOpen(true)}
        onOpenAssisted={() => setIsAssistedOpen(true)}
        onOpenQuality={() => setCurrentTab('quality')}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-2 sticky top-16 z-50 shadow-md">
          <span className="w-2 rounded-full bg-emerald-400 shrink-0 h-2"></span>
          <p className="font-medium">{notification}</p>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentTab === 'landing' && (
          <LandingOverview
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenCall={() => setIsCallOpen(true)}
            onOpenSellModal={() => setIsSellOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {(currentTab === 'compiler' || currentTab === 'produce' || currentTab === 'offers') && (
          <CompilerView onChainAccepted={handleChainAccepted} initialHarvest={compilerHarvest} />
        )}

        {(currentTab === 'map' || currentTab === 'tracking') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 font-display">
                  Live Logistics &amp; Corridor Fleet Radar
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time GPS tracking of farmgate pickups, consignment hubs, and return-trip trucks across Indore &amp; Malwa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  + Add Farmgate Pickup
                </button>
              </div>
            </div>

            <CorridorMapView onSelectChain={() => setCurrentTab('compiler')} />
          </div>
        )}

        {(currentTab === 'farmer' || currentTab === 'orders') && (
          <FarmerDashboard
            onOpenSellModal={() => setIsSellOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenCall={() => setIsCallOpen(true)}
            onOpenCompiler={(harvest) => { if (harvest) setCompilerHarvest(harvest); setCurrentTab('compiler'); }}
            onOpenQuality={() => setCurrentTab('quality')}
            activeHarvests={activeHarvests}
          />
        )}

        {(currentTab === 'pooling' || currentTab === 'supply' || currentTab === 'loads') && (
          <DynamicPoolingView />
        )}

        {(currentTab === 'transporter' || currentTab === 'trips') && (
          <TransporterDashboard />
        )}

        {(currentTab === 'buyer' || currentTab === 'requirements') && (
          <BuyerDashboard />
        )}

        {currentTab === 'quality' && (
          <QualityVerificationView />
        )}

        {currentTab === 'escrow' && (
          <EscrowSettlementView />
        )}

        {(currentTab === 'admin' || currentTab === 'government' || currentTab === 'mandi' || currentTab === 'supply_demand' || currentTab === 'reports') && (
          role === 'government_admin' ? (
            <GovernmentDashboard />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Government Clearance Required</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Government Command Portal is reserved for verified State Agricultural Marketing Board administrators.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('landing')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Main View</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Clean Enterprise Footer */}
      <footer className="bg-white text-slate-500 text-xs py-5 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-slate-900 font-bold font-display text-sm">
              AgriChain
            </div>
            <p className="text-slate-500 text-xs">
              Decentralized Agricultural Supply Chain &amp; Dynamic Price Discovery
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
            <button type="button" onClick={() => showNotification('AgriChain Terms & Escrow Policy: Standard decentralized trade terms apply.')} className="hover:text-emerald-700 transition-colors cursor-pointer">Terms</button>
            <span>&bull;</span>
            <button type="button" onClick={() => showNotification('Privacy Notice: Secure end-to-end encrypted farmer and trade records.')} className="hover:text-emerald-700 transition-colors cursor-pointer">Privacy</button>
            <span>&bull;</span>
            <button type="button" onClick={() => showNotification('AgriChain Help Desk: Contact toll-free support or APMC nodal officer.')} className="hover:text-emerald-700 transition-colors cursor-pointer">Help Desk</button>
          </div>
        </div>
      </footer>

      {/* Interactive Global Modals */}
      <AgriMitraVoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onHarvestCreated={handleHarvestCreated}
      />

      <AIFarmerCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        onHarvestCreated={handleHarvestCreated}
      />

      <AssistedAccessModal
        isOpen={isAssistedOpen}
        onClose={() => setIsAssistedOpen(false)}
        onHarvestCreated={handleHarvestCreated}
      />

      <SellHarvestModal
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        onHarvestCreated={handleHarvestCreated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
