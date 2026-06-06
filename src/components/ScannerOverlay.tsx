/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Drink } from '../types';
import { DRINK_PRODUCTS } from '../data/products';
import { playScanSound, playErrorSound } from '../utils/calculations';
import { Scan, Sparkles, Sliders, ChevronRight, X, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerOverlayProps {
  onScanDrink: (drink: Drink) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScannerOverlay({ onScanDrink, isOpen, onClose }: ScannerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'barcode' | 'camera'>('quick');
  const [hasCameraError, setHasCameraError] = useState(false);

  // Initialize and clean up real camera stream if requested and allowed
  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      setHasCameraError(false);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
          }
        })
        .catch((err) => {
          console.warn('Camera access error', err);
          setHasCameraError(true);
        });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const handleScanProduct = (drink: Drink) => {
    playScanSound();
    onScanDrink(drink);
    setScanMessage(`GESCAND: ${drink.dutchName}!`);
    setTimeout(() => {
      setScanMessage(null);
    }, 1800);
  };

  // Submit mock manual barcode input (or typing)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeTrimmed = barcodeQuery.trim();
    if (!barcodeTrimmed) return;

    // Look up barcode in our drink data
    const foundDrink = DRINK_PRODUCTS.find(
      (d) => d.barcode === barcodeTrimmed || d.id.includes(barcodeTrimmed.toLowerCase())
    );

    if (foundDrink) {
      handleScanProduct(foundDrink);
      setBarcodeQuery('');
    } else {
      playErrorSound();
      setScanMessage('Productcode niet herkend!');
      setTimeout(() => setScanMessage(null), 2000);
    }
  };

  // Auto scan simulation when camera is active
  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    if (streamActive && activeTab === 'camera') {
      // Simulate random scan flashes of drinks in front of camera
      scanInterval = setInterval(() => {
        // 10% chance to simulate scan of random drink
        if (Math.random() < 0.15) {
          const randomIndex = Math.floor(Math.random() * DRINK_PRODUCTS.length);
          const matchedDrink = DRINK_PRODUCTS[randomIndex];
          handleScanProduct(matchedDrink);
        }
      }, 4000);
    }
    return () => clearInterval(scanInterval);
  }, [streamActive, activeTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-slate-900 border-2 border-orange-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]"
          >
            {/* Scanner header */}
            <div className="bg-[#ff7b00] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 animate-pulse" />
                <h3 className="font-mono font-bold uppercase tracking-wider text-sm mt-0.5">
                  HANDSCANNER TERMINAL
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-black/20 p-1.5 rounded-full transition-all"
                id="close-scanner-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Tabs */}
            <div className="grid grid-cols-3 bg-slate-800 border-b border-slate-700 font-mono text-xs">
              <button
                onClick={() => setActiveTab('quick')}
                className={`py-3 font-bold uppercase text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'quick'
                    ? 'text-orange-500 border-orange-500 bg-slate-950/20'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
                id="tab-scanner-quick"
              >
                Snel-Tik
              </button>
              <button
                onClick={() => setActiveTab('barcode')}
                className={`py-3 font-bold uppercase text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'barcode'
                    ? 'text-orange-500 border-orange-500 bg-slate-950/20'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
                id="tab-scanner-barcode"
              >
                Barcode Typen
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`py-3 font-bold uppercase text-center cursor-pointer border-b-2 transition-all ${
                  activeTab === 'camera'
                    ? 'text-orange-500 border-orange-500 bg-slate-950/20'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
                id="tab-scanner-camera"
              >
                Camera Scanner
              </button>
            </div>

            {/* Panel Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 relative" id="scanner-viewports">
              {/* Scan flash toaster/feedback */}
              <AnimatePresence>
                {scanMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className={`absolute top-4 left-4 right-4 z-10 p-3 rounded-xl border font-mono text-center text-xs font-bold leading-relaxed ${
                      scanMessage.includes('niet')
                        ? 'bg-red-950 text-red-100 border-red-500'
                        : 'bg-emerald-950 text-emerald-100 border-emerald-500 shadow-md shadow-emerald-500/25'
                    }`}
                  >
                    {scanMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* QUICK TICK BARRIERS */}
              {activeTab === 'quick' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                    <p className="font-mono text-[10px] text-gray-400 leading-relaxed text-center uppercase tracking-wide">
                      Klik op een product hieronder om de barcode langs de laser te slepen.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 select-none gap-2" id="scanner-quick-choices">
                    {DRINK_PRODUCTS.map((drink) => (
                      <button
                        key={drink.id}
                        type="button"
                        onClick={() => handleScanProduct(drink)}
                        className="flex items-center justify-between p-3 bg-slate-800/80 border border-slate-700/60 hover:border-orange-500 rounded-xl cursor-pointer hover:bg-slate-705 text-left group transition-all"
                        id={`scanner-quick-row-${drink.id}`}
                      >
                        <div>
                          <span className="font-sans font-bold text-slate-200 block text-xs tracking-wide">
                            {drink.dutchName}
                          </span>
                          <span className="font-mono text-[9px] text-slate-450 uppercase block mt-0.5">
                            Barcode: {drink.barcode} • {drink.volumeMl}ml
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-orange-450 bg-orange-950/40 py-1 px-2 border border-orange-900/40 rounded-md group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all">
                            Scan ✓
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MANUAL BARCODE INPUT PORT */}
              {activeTab === 'barcode' && (
                <div className="space-y-5 py-2">
                  <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                    <p className="font-mono text-[10px] text-gray-400 leading-relaxed text-center uppercase tracking-wide">
                      Voer een barcodenummer van een drinkfles in, of typ een zoekterm (zoals "bier", "salmari" of "wijn").
                    </p>
                  </div>

                  <form onSubmit={handleBarcodeSubmit} className="space-y-3" id="barcode-submit-form">
                    <div className="relative">
                      <input
                        type="text"
                        value={barcodeQuery}
                        onChange={(e) => setBarcodeQuery(e.target.value)}
                        placeholder="Invoeren van barcode..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm text-yellow-350 tracking-wider placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        id="barcode-query-input"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono font-bold text-xs uppercase cursor-pointer tracking-wider py-3 rounded-xl shadow-md transition-all"
                    >
                      Barcode Bevestigen
                    </button>
                  </form>

                  {/* Cheat sheet matrix */}
                  <div className="space-y-2 mt-4" id="barcode-cheatsheet">
                    <h4 className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Kassa Barcodes Spiekbriefje:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                      {DRINK_PRODUCTS.slice(0, 6).map((drink) => (
                        <div
                          key={drink.id}
                          className="p-1 px-2 border border-slate-800 bg-slate-950/20 rounded max-w-full truncate cursor-pointer hover:border-slate-600"
                          onClick={() => setBarcodeQuery(drink.barcode)}
                          title="Klik om in te vullen"
                        >
                          <span className="text-slate-200 font-bold block">{drink.dutchName}</span>
                          <code>{drink.barcode}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* REAL LIVE CAMERA BARCODE SIMULATOR */}
              {activeTab === 'camera' && (
                <div className="absolute inset-0 flex flex-col bg-black">
                  {hasCameraError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
                      <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
                      <h4 className="font-mono font-bold uppercase text-slate-200 text-xs">camera niet toegankelijk</h4>
                      <p className="font-mono text-[10px] mt-2 max-w-xs leading-relaxed text-slate-500">
                        Geef camera permissie in de browser of gebruik de 'Snel-Tik' optie hierboven.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 relative overflow-hidden bg-slate-950">
                      {/* Video tag for stream */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                      />

                      {/* Laser scanning line aesthetic overlays */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {/* Red beam */}
                        <div className="w-full h-1 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-[bounce_3s_infinite]" />

                        {/* Scan viewport focus cage border */}
                        <div className="border-4 border-dashed border-orange-500/50 w-3/4 h-1/2 rounded-2xl flex flex-col items-center justify-between p-3 relative">
                          <span className="font-mono text-[8.5px] uppercase font-bold text-orange-500 tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-orange-500/30">
                            Plaats Barcode In Kader
                          </span>
                          <span className="font-mono text-[8px] text-gray-400 bg-slate-950/60 p-1.5 rounded text-center max-w-full leading-normal">
                            Wacht even op een gesimuleerde scan of flits...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with checkout counts */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400">BENIKONDERINVLOED.NL TERMINAL</span>
              <button
                onClick={onClose}
                className="bg-orange-500 text-white font-bold py-1.5 px-4 rounded-lg hover:bg-orange-600 transition-all cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
