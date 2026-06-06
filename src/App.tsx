/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Drink, ScannedItem, UserProfile } from './types';
import { DRINK_PRODUCTS } from './data/products';
import { playScanSound, playErrorSound } from './utils/calculations';
import LoyaltyProfileModal from './components/LoyaltyProfileModal';
import Receipt from './components/Receipt';
import ScannerOverlay from './components/ScannerOverlay';
import CheckoutScreen from './components/CheckoutScreen';

import {
  HelpCircle,
  Wine,
  Beer,
  Clock,
  Scan,
  Coins,
  Shield,
  GlassWater,
  Info,
  Gift,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Core State
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Gezellige Drinker',
    weightKg: 75,
    sex: 'male',
    driverType: 'experienced',
    stomach: 'light',
    hasBonusCard: false,
  });

  const [items, setItems] = useState<ScannedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Drink['category']>('bier');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Help alert modal state
  const [showHelpAlert, setShowHelpAlert] = useState(false);

  // Keep terminal clock ticking for continuous checkout experience
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Click handler to add drink directly to scanner
  const handleAddDrink = (drink: Drink) => {
    playScanSound();
    
    setItems((prevItems) => {
      // Find matches with same drink ID AND same consumedAgoHours (defaults to 0, "nu")
      const existingIndex = prevItems.findIndex(
        (item) => item.drink.id === drink.id && item.consumedAgoHours === 0
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // Generate a random ID for this specific scan
        const scanId = `${drink.id}-${Date.now()}`;
        return [
          ...prevItems,
          {
            scanId,
            drink,
            quantity: 1,
            consumedAgoHours: 0,
          },
        ];
      }
    });
  };

  // 3. Receipt interaction triggers
  const handleUpdateQuantity = (scanId: string, delta: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.scanId === scanId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (scanId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.scanId !== scanId));
  };

  const handleUpdateConsumedAgoHours = (scanId: string, hours: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.scanId === scanId) {
          return { ...item, consumedAgoHours: hours };
        }
        return item;
      })
    );
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleResetTerminal = () => {
    setItems([]);
    setIsCheckoutActive(false);
  };

  // Group drinks by category
  const filteredProducts = DRINK_PRODUCTS.filter(
    (product) => product.category === activeCategory
  );

  const getCategoryEmoji = (cat: Drink['category']) => {
    switch (cat) {
      case 'bier':
        return '🍺';
      case 'wijn':
        return '🍷';
      case 'sterk':
        return '🥃';
      case 'shot':
        return '🧪';
      case 'cocktail':
        return '🍸';
      case 'snack_non':
        return '🍟';
      default:
        return '🍹';
    }
  };

  return (
    <div className="w-screen h-screen bg-[#eaeeef] overflow-hidden flex flex-col font-sans" id="main-terminal-app">
      
      {/* 1. Global Self-checkout Header */}
      <header className="bg-amber-500 text-white px-8 py-6 flex items-center justify-between shadow-lg select-none shrink-0" id="terminal-header">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-amber-500 flex items-center justify-center">
            <span className="font-sans font-black text-xs tracking-tight uppercase leading-none border-b-2 border-amber-500">
              BEN IK
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter leading-tight text-white m-0 uppercase">
              benikonderinvloed.nl
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">
              Zelfscankassa Terminal #04 • Alcohol-Check
            </p>
          </div>
        </div>

        {/* Global actions: Clock, Help trigger */}
        <div className="flex items-center gap-4">
          <div className="bg-amber-600 px-4 py-2 rounded-xl text-center border border-amber-400 hidden sm:block">
            <span className="block text-[10px] uppercase font-bold">Locatie</span>
            <span className="font-bold">THUIS-SCAN 01</span>
          </div>

          {/* Live digital terminal clock */}
          <div className="hidden md:flex flex-col text-right leading-none">
            <span className="text-[10px] uppercase font-black opacity-70">Huidige Tijd</span>
            <p className="text-2xl font-mono font-bold">{currentTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <button
            onClick={() => {
              playErrorSound();
              setShowHelpAlert(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-amber-400 transition-all shadow-sm"
            id="help-trigger-btn"
          >
            <HelpCircle className="w-4 h-4 text-amber-200" />
            <span>Vraag Hulp</span>
          </button>
        </div>
      </header>

      {/* 2. Main screen switcher (Terminal dashboard or checkout details) */}
      <main className="flex-1 overflow-hidden" id="main-viewport">
        {isCheckoutActive ? (
          <CheckoutScreen
            items={items}
            profile={profile}
            onBackToTerminal={() => setIsCheckoutActive(false)}
            onReset={handleResetTerminal}
          />
        ) : (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden" id="main-editor-layout">
            
            {/* LEFT COLUMN: Drink touchscreen grid selector */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#eaeeef] h-full" id="left-touchscreen-column">
              
              {/* Category tabs indicator bar */}
              <div className="bg-white border-b border-gray-200 py-2.5 px-4 overflow-x-auto flex flex-nowrap items-center gap-2 select-none" id="touch-categories-tabs">
                {(['bier', 'wijn', 'cocktail', 'shot', 'sterk', 'snack_non'] as Drink['category'][]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-2 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wide cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    id={`tab-category-${cat}`}
                  >
                    <span>{getCategoryEmoji(cat)}</span>
                    <span>
                      {cat === 'snack_non'
                        ? 'Bodems & Non-Alc'
                        : cat === 'sterk'
                        ? 'Sterke Drank'
                        : cat}
                    </span>
                  </button>
                ))}
              </div>

              {/* Products Touchboard Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6" id="touchscreen-grid-area">
                
                {/* Visual helper banner */}
                <div className="mb-5 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-sans font-black text-sm text-gray-800 uppercase flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" /> Tik consumpties aan op het scherm
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                      Net als bij de Albert Heijn zelfscankassa kun je hier direct aantikken wat je hebt gedronken om het op je kassabon te laden. Pas daarna de consumptietijd aan.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl shadow-lg hover:scale-[1.02] cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4 animate-pulse" />
                    <span>Open Handscanner Gun</span>
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-12" id="drink-touchboard-grid">
                  {filteredProducts.map((drink) => {
                    const hasAlcohol = drink.abv > 0;
                    return (
                      <motion.button
                        key={drink.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddDrink(drink)}
                        className={`bg-white rounded-[2.5rem] border-4 border-white hover:border-amber-400 p-6 text-left shadow-xl hover:shadow-2xl cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-[165px] group active:scale-95`}
                        id={`touch-drink-btn-${drink.id}`}
                      >
                        {/* Red Laser sweeping effect simulation on hover */}
                        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-red-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-[280px] transition-all duration-1000 ease-in-out pointer-events-none" />

                        <div>
                          {/* Item Category badge/Details */}
                          <div className="flex justify-between items-start">
                            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform select-none">{getCategoryEmoji(drink.category)}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              hasAlcohol ? 'bg-amber-100 text-amber-800 border border-amber-250' : 'bg-green-100 text-green-800'
                            }`}>
                              {hasAlcohol ? `${drink.abv}% vol` : 'ALCOHOLVRIJ'}
                            </span>
                          </div>

                          <h4 className="font-sans font-black text-slate-700 text-base mt-2 leading-snug group-hover:text-amber-500 transition-colors">
                            {drink.dutchName}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-1 max-w-[90%] truncate">
                            {drink.description}
                          </p>
                        </div>

                        {/* Price box or units info */}
                        <div className="flex justify-between items-baseline border-t border-gray-100 pt-2 bg-white mt-1 w-full">
                          <span className="font-mono text-sm font-black text-amber-500">
                            €{drink.priceEuro.toFixed(2)}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 font-bold uppercase">
                            {hasAlcohol ? `${parseFloat((drink.grams / 10).toFixed(1))} units` : 'Herstel snack'}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Continuous thermal grocery receipt checkout column */}
            <div className="w-full lg:w-96 shrink-0 h-full bg-white select-none border-t border-gray-250 lg:border-t-0" id="right-receipt-column">
              <Receipt
                items={items}
                profile={profile}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateConsumedAgoHours={handleUpdateConsumedAgoHours}
                onOpenProfile={() => setIsProfileOpen(true)}
                onCheckout={() => setIsCheckoutActive(true)}
              />
            </div>

          </div>
        )}
      </main>

      {/* 3. Modal overlays */}
      
      {/* Loyalty/Personal parameter profile modal */}
      <LoyaltyProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Handscanner overlay */}
      <ScannerOverlay
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanDrink={(drink) => {
          // Put standard items onto the receipt
          setItems((prevItems) => {
            const existingIndex = prevItems.findIndex(
              (item) => item.drink.id === drink.id && item.consumedAgoHours === 0
            );

            if (existingIndex > -1) {
              const updated = [...prevItems];
              updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + 1,
              };
              return updated;
            } else {
              const scanId = `${drink.id}-${Date.now()}`;
              return [
                ...prevItems,
                {
                  scanId,
                  drink,
                  quantity: 1,
                  consumedAgoHours: 0,
                },
              ];
            }
          });
        }}
      />

      {/* Help message popup dialog */}
      <AnimatePresence>
        {showHelpAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-4 border-amber-500 p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-amber-100 rounded-full text-amber-250" />
              <div className="bg-amber-50 inline-flex p-3 rounded-2xl text-amber-600 mb-4 border border-amber-200">
                <HelpCircle className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-lg font-black font-sans uppercase text-amber-500">
                MEDEWERKER INGEPAST!
              </h3>
              <p className="text-xs text-gray-600 font-sans mt-2 leading-relaxed">
                "Ik zie op mijn kassa dat je alcohol probeert te controleren. Geef me een momentje om je ID-kaart te verifiëren..."
              </p>
              <div className="bg-slate-100 p-3 rounded-xl border border-gray-200 text-[10px] text-gray-500 font-mono mt-4 leading-normal">
                💡 TIP: Maak je profiel compleet door op de Bonuskaart 'Kassaprofiel Activeren' te klikken om je exacte gewicht en geslacht in te vullen voor een correcte Widmark-berekening.
              </div>
              <button
                onClick={() => setShowHelpAlert(false)}
                className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase font-mono"
              >
                Sluiten &amp; Verder scannen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
