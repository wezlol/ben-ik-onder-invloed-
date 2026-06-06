/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScannedItem, UserProfile, BACDetails } from '../types';
import { getBACDetails, calculateBACProfile, playCheckoutSound } from '../utils/calculations';
import BACChart from './BACChart';
import {
  ShieldAlert,
  Car,
  ChevronLeft,
  RefreshCw,
  Wine,
  Calendar,
  Layers,
  HeartCrack,
  Clock,
  ExternalLink,
  Share2,
  ThumbsUp,
  Beer,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface CheckoutScreenProps {
  items: ScannedItem[];
  profile: UserProfile;
  onBackToTerminal: () => void;
  onReset: () => void;
}

export default function CheckoutScreen({
  items,
  profile,
  onBackToTerminal,
  onReset,
}: CheckoutScreenProps) {
  // Timeline slider value (offset in hours from Now = 0)
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [bacDetails, setBacDetails] = useState<BACDetails>(getBACDetails(items, profile, 0));
  const [isCopied, setIsCopied] = useState(false);

  // Play checkout sounds once on mount
  useEffect(() => {
    playCheckoutSound();
  }, []);

  // Recalculate anytime item list, profile parameters, or slider changes
  useEffect(() => {
    const details = getBACDetails(items, profile, timeOffset);
    setBacDetails(details);
  }, [items, profile, timeOffset]);

  // Generate full timeline simulation profile for chart plotting
  const chartData = calculateBACProfile(items, profile, 20);

  // Calculate some fun health and body metrics
  const totalGramsConsumed = items.reduce((acc, curr) => acc + curr.drink.grams * curr.quantity, 0);
  const totalEuro = items.reduce((acc, curr) => acc + curr.drink.priceEuro * curr.quantity, 0);
  const limit = profile.driverType === 'beginner' ? 0.2 : 0.5;

  // Real-time calculated clock for when they will be sober
  const getSoberTimeStr = () => {
    const totalSoberHours = getBACDetails(items, profile, 0).timeToSoberHours;
    if (totalSoberHours <= 0) return 'Nu al nuchter!';
    const soberDate = new Date();
    soberDate.setSeconds(soberDate.getSeconds() + totalSoberHours * 3600);
    return `om ${soberDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} uur`;
  };

  const getSoberCountdownStr = () => {
    const totalSoberHours = getBACDetails(items, profile, 0).timeToSoberHours;
    if (totalSoberHours <= 0) return '0 uur';
    const hours = Math.floor(totalSoberHours);
    const mins = Math.round((totalSoberHours - hours) * 60);
    return `${hours}u ${mins}m`;
  };

  // Safe transportation advisory messages in Dutch
  const getSubTitleText = (bac: number) => {
    if (bac === 0) return 'Je bent nuchter. Veilig om te reizen of te rijden.';
    if (profile.driverType === 'beginner' && bac >= 0.2) {
      return `Je zit OVER de wettelijke limiet van 0.2‰ voor beginnende bestuurders! ❌`;
    }
    if (profile.driverType === 'experienced' && bac >= 0.5) {
      return `Je zit OVER de wettelijke limiet van 0.5‰ voor ervaren bestuurders! ❌`;
    }
    return `Onder de wettelijke limiet (${limit}‰). Maar verstandig rijden is alcoholvrij rijden. ⚠️`;
  };

  // Fun physical symptoms description based on BAC
  const getSymptomDescription = (bac: number) => {
    if (bac === 0) return 'Volledig nuchter en scherp. Uitstekend reactievermogen.';
    if (bac < 0.2) return 'Heel licht ontspannen, warm gevoel. Praten gaat soepel.';
    if (bac < 0.5) return 'Licht aangeschoten. Lichte ontremming, gezelligheid stijgt, reactiesnelheid neemt al af.';
    if (bac < 0.8) return 'Aangeschoten. Praten gaat luider, zelfoverschatting treedt op. autorijden is illegaal!';
    if (bac < 1.5) return 'Dronken. Coördinatieproblemen, slappe lach of emotioneel, lichte tunnelvisie, spraak vertraagt.';
    if (bac < 2.5) return 'Lazarus. Slecht evenwicht, dubbelzien wallen onder ogen, misselijkheid en verwardheid.';
    return 'Koma-niveau! Ernstige vergiftiging. Risico op bewusteloosheid. Zoek onmiddellijk hulp.';
  };

  // Sharing functionality to copy to clipboard
  const handleShareResult = () => {
    const textToCopy = `Ben ik onder invloed? 🍻\n\nTotaal consumpties: ${items.length} stuks\nTotaal alcohol: ${totalGramsConsumed.toFixed(1)}g\nActueel promillage: ${getBACDetails(items, profile, 0).currentBAC.toFixed(3)}‰\nWeer nuchter over: ${getSoberCountdownStr()} (${getSoberTimeStr()})\n\nCheck het op: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-full bg-slate-950 p-4 md:p-8 text-slate-100 flex flex-col font-sans select-none" id="checkout-analysis-viewport">
      {/* Maximum width box constraints for neat desktop viewports */}
      <div className="w-full max-w-4xl mx-auto space-y-6 flex-1 flex flex-col justify-between">
        
        {/* Top title area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <h1 className="text-2xl font-black uppercase tracking-tight text-white font-sans">
                ZELFSCAN BETALING GESLAAGD
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              Uw levertransactie is goedgekeurd. Kassabon-analyse gegenereerd op basis van jouw profiel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToTerminal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              id="back-to-terminal-btn"
            >
              <ChevronLeft className="w-4 h-4" /> Bewerk Bon
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold font-mono uppercase rounded-xl border border-red-900/30 transition-all cursor-pointer flex items-center gap-1.5"
              id="reset-terminal-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Opnieuw
            </button>
          </div>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main big analytics dashboard gauge (Left side, cols 7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Giant BAC Promille Ring/Display */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 relative overflow-hidden" id="promille-gauge-card">
              {/* Colored background ambient glow depending on state */}
              <div
                className={`absolute right-0 top-0 w-32 h-32 blur-3xl opacity-10 rounded-full transition-all duration-300 ${
                  bacDetails.statusColor === 'green'
                    ? 'bg-emerald-500'
                    : bacDetails.statusColor === 'yellow'
                    ? 'bg-yellow-500'
                    : bacDetails.statusColor === 'orange'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
              />

              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">
                  {timeOffset === 0 ? 'Actueel Blodealcoholdruk' : `Gesimuleerde Druk (+ ${timeOffset}u)`}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider py-1 px-2.5 rounded-full border ${
                    bacDetails.statusColor === 'green'
                      ? 'bg-emerald-950/50 text-emerald-405 border-emerald-900/40'
                      : bacDetails.statusColor === 'yellow'
                      ? 'bg-yellow-950/50 text-yellow-405 border-yellow-900/40'
                      : bacDetails.statusColor === 'orange'
                      ? 'bg-orange-950/50 text-orange-405 border-orange-900/40'
                      : 'bg-red-950/50 text-red-405 border-red-900/40'
                  }`}
                >
                  {bacDetails.statusText}
                </span>
              </div>

              {/* Huge digital promille counter */}
              <div className="my-5 flex items-baseline gap-2">
                <span
                  className={`text-6xl font-black font-sans tracking-tight leading-none transition-all duration-300 ${
                    bacDetails.statusColor === 'green'
                      ? 'text-emerald-400'
                      : bacDetails.statusColor === 'yellow'
                      ? 'text-yellow-400'
                      : bacDetails.statusColor === 'orange'
                      ? 'text-orange-400'
                      : 'text-red-500'
                  }`}
                  id="promille-digital-display"
                >
                  {bacDetails.currentBAC.toFixed(3)}
                </span>
                <span className="text-xl font-bold font-mono text-gray-400">‰ Promille</span>
              </div>

              {/* Physical Symptoms caption */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800 pt-3 italic">
                "{getSymptomDescription(bacDetails.currentBAC)}"
              </p>
            </div>

            {/* Simulated Driving permissions layout with Dutch icons */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-4" id="mobility-status-card">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                ZELFSCAN MOBILITEITSADVIES:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="mobility-vehicles-grid">
                {/* Auto Car */}
                <div className={`p-4 rounded-2xl border ${
                  bacDetails.canDriveCar 
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                    : 'bg-red-950/25 border-red-900/30 text-gray-400'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <Car className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wide">AUTORIDDEN</span>
                  </div>
                  <div className="font-bold text-sm font-sans">
                    {bacDetails.canDriveCar ? 'Wegrijden toegestaan ✓' : 'Absoluut Verboden ❌'}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">
                    {bacDetails.canDriveCar ? 'BAC is onder limiet.' : `Limiet: ${limit}‰. Boeterisico is extreem hoog.`}
                  </p>
                </div>

                {/* Fiets Bicycle */}
                <div className={`p-4 rounded-2xl border ${
                  bacDetails.canDriveBike 
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                    : 'bg-red-950/25 border-red-900/30 text-gray-400'
                }`}>
                  <div className="flex justify-between items-center mb-2 font-bold font-mono text-xs">
                    <span className="text-lg">🚲</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wide">FIETSEN</span>
                  </div>
                  <div className="font-bold text-sm font-sans">
                    {bacDetails.canDriveBike ? 'Geen probleem 🚲✓' : 'Slingeren gegarandeerd ⚠️'}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">
                    {bacDetails.canDriveBike ? 'Veilig sturen.' : 'Dronken fietsen is officieel beboetbaar in NL.'}
                  </p>
                </div>

                {/* Walk Pedestrian */}
                <div className={`p-4 rounded-2xl border ${
                  bacDetails.canWalk 
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                    : 'bg-red-950/25 border-red-900/30 text-gray-400'
                }`}>
                  <div className="flex justify-between items-center mb-2 font-bold font-mono text-xs">
                    <span className="text-lg">🚶‍♂️</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wide">LOPEN</span>
                  </div>
                  <div className="font-bold text-sm font-sans">
                    {bacDetails.canWalk ? 'Rechtuit lopen ✓' : 'Lantaarnpaalgevaar ⚠️'}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">
                    {bacDetails.canWalk ? 'Strakke pas.' : 'Loop samen met een BOB of bel een taxi.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 leading-relaxed text-[10px] text-gray-500 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span>
                  {getSubTitleText(bacDetails.currentBAC)} Let op: de Widmark-formule geeft een biologische benadering. Individuele tolerantie kan sterk variëren. Neem nooit risico in het verkeer.
                </span>
              </div>
            </div>

            {/* Dynamic SOBER COUNTDOWN banner */}
            {getBACDetails(items, profile, 0).currentBAC > 0 && (
              <div className="bg-[#ff4f00]/10 border border-[#ff4f00]/35 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4" id="sobriety-countdown-banner">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#ff7132] tracking-wider block">
                    TIJD TOT VOLLEDIGE NUCHTERHEID (0.00‰):
                  </span>
                  <p className="text-sm font-medium text-slate-300">
                    Ondersteund door constante leverafbraak van <span className="font-mono text-white font-bold">0.15‰ per uur</span>.
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-2xl font-black text-white font-mono tracking-tight leading-none">
                    {getSoberCountdownStr()}
                  </div>
                  <span className="text-xs text-orange-400 mt-1 block">
                    {getSoberTimeStr()}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Graphical timeline side columns (Right side, cols 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Custom chart card */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 space-y-3" id="chart-viewport-card">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Verloop Curve (Tijdreizen)
                </h3>
                {timeOffset !== 0 && (
                  <button
                    onClick={() => setTimeOffset(0)}
                    className="text-[10px] font-mono text-orange-400 hover:underline font-bold"
                  >
                    Reset naar NU
                  </button>
                )}
              </div>

              {/* Custom SVG Line graph */}
              <div className="py-2">
                <BACChart
                  data={chartData}
                  limit={limit}
                  activeTime={timeOffset}
                  onTimeChange={(t) => setTimeOffset(t)}
                />
              </div>

              {/* TIMELINE TRAVEL SLIDER */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono pb-1 text-gray-400">
                  <span>Nu</span>
                  <span className="text-white font-bold bg-amber-500 px-2 py-0.5 rounded-md shadow-sm">
                    {timeOffset === 0 ? 'Huidige Status' : `In de toekomst (+${timeOffset}u)`}
                  </span>
                  <span>+12u later</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={timeOffset}
                  onChange={(e) => setTimeOffset(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  id="timeline-time-slider"
                />
                <p className="text-[10px] text-gray-500 leading-normal text-center italic">
                  Verschuif de regelaar om je verwachte promillage na een paar uur slaap of wachten te bekijken.
                </p>
              </div>
            </div>

            {/* Quick stats grocery style receipt card */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 space-y-3" id="macro-nutrition-card">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-450" /> BIO STATISTICS
              </h3>
              
              <div className="space-y-3 text-xs font-mono" id="biological-stats-table">
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-gray-400">TOTALE CONSUMPTIES:</span>
                  <span className="font-bold text-white">
                    {items.reduce((acc, curr) => acc + curr.quantity, 0)} stuks
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-gray-400">ALCOHOL GEWICHT:</span>
                  <span className="font-bold text-yellow-350">{totalGramsConsumed.toFixed(1)} gram</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-gray-400">KASSASALDO EURO:</span>
                  <span className="font-bold text-slate-300">€{totalEuro.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-gray-400">DASHBOARD PIEK-BAC:</span>
                  <span className="font-bold text-red-500">
                    {Math.max(...chartData.map(d => d.bac), 0).toFixed(3)}‰
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400 font-bold">BODEM-SNACK FACTOR:</span>
                  <span className="font-bold text-emerald-450">
                    {items.some(i => i.drink.category === 'snack_non' && i.drink.id.includes('snack')) 
                      ? 'In Schatting Verwerkt ✓' 
                      : 'Geen herstel-snacks 𐄂'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sharing link button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleShareResult}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 rounded-2xl font-mono text-xs font-bold text-slate-200 border border-slate-800 cursor-pointer shadow flex items-center justify-center gap-2 transition-all"
                id="share-result-btn"
              >
                <Share2 className="w-4 h-4 text-orange-500" />
                <span>{isCopied ? 'GEKOPIEERD MET SUCCES! ✓' : 'KOPIEER KASSABON-DELEN LINK'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer with quick helpful links */}
        <div className="border-t border-slate-800 pt-5 mt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 gap-3">
          <span>© 2026 BENIKONDERINVLOED.NL • VERANTWOORD DRINKEN</span>
          <div className="flex items-center gap-4">
            <span className="hover:underline">STIVORO & JELLINEK richtlijnen</span>
            <span className="hover:underline">Privacybeleid</span>
          </div>
        </div>

      </div>
    </div>
  );
}
