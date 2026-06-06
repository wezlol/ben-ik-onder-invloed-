/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScannedItem, UserProfile } from '../types';
import { Minus, Plus, Trash2, HeartHandshake, CreditCard, Tag } from 'lucide-react';

interface ReceiptProps {
  items: ScannedItem[];
  profile: UserProfile;
  onUpdateQuantity: (scanId: string, delta: number) => void;
  onRemoveItem: (scanId: string) => void;
  onUpdateConsumedAgoHours: (scanId: string, hours: number) => void;
  onOpenProfile: () => void;
  onCheckout: () => void;
}

export default function Receipt({
  items,
  profile,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateConsumedAgoHours,
  onOpenProfile,
  onCheckout,
}: ReceiptProps) {
  
  // Calculate total price and total alcohol grams
  const totalEuro = items.reduce((acc, curr) => acc + curr.drink.priceEuro * curr.quantity, 0);
  const totalGrams = items.reduce((acc, curr) => acc + curr.drink.grams * curr.quantity, 0);
  
  // Discount based on snacks or non-alcoholic scanned!
  const snackItemsCount = items.filter(i => i.drink.category === 'snack_non' && i.drink.id.includes('snack')).reduce((acc, curr) => acc + curr.quantity, 0);
  const discountEuro = snackItemsCount * 1.50; // €1.50 discount per snack portion as "Bodemleggerskorting"
  const finalTotalEuro = Math.max(0, totalEuro - discountEuro);

  const totalUnits = parseFloat((totalGrams / 10).toFixed(1)); // 1 unit in NL = 10g alcohol

  const currentDateStr = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const currentTimeStr = new Date().toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] border-l border-gray-200" id="receipt-container">
      {/* Scrollable thermal paper receipt area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" id="receipt-scroll-area">
        {/* Receipt paper graphic wrapper */}
        <div className="relative bg-white shadow-lg p-5 mx-auto max-w-sm border-t-8 border-amber-500" id="receipt-paper">
          {/* Jagged paper edge simulator at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x bg-[linear-gradient(45deg,transparent_33.333%,#f8f9fa_33.333%,#f8f9fa_66.666%,transparent_66.666%)] bg-[size:10px_10px]" />
          
          {/* Receipt header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <h2 className="font-mono font-black text-lg tracking-widest text-amber-500 uppercase">
              BEN IK ONDER INVLOED
            </h2>
            <p className="font-mono text-[10px] text-gray-500">ZELFSCAN KASSATERMINAL #04</p>
            <p className="font-mono text-[10px] text-gray-500">WEBSITE: WWW.BENIKONDERINVLOED.NL</p>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-3">
              <span>DATUM: {currentDateStr}</span>
              <span>TIJD: {currentTimeStr}</span>
            </div>
          </div>

          {/* Customer profile status tag */}
          <div className="my-3 py-2 px-3 border-b border-dashed border-gray-300 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">KLANT:</span>
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-amber-500 hover:underline font-bold"
                id="receipt-profile-trigger"
              >
                {profile.name} (Bewerk ✎)
              </button>
            </div>
            <div className="mt-1 text-[10px] text-gray-500 space-y-0.5" id="receipt-profile-details">
              <div>• Gewicht: {profile.weightKg} kg ({profile.sex === 'male' ? 'M' : 'V'})</div>
              <div>• Maag: {profile.stomach === 'empty' ? 'Leeg (snelste opname!)' : profile.stomach === 'light' ? 'Licht gevuld' : 'Volle maag (vertraagd)'}</div>
              <div>• Rijbewijs: {profile.driverType === 'beginner' ? 'Beginnend (limiet 0.2‰)' : 'Ervaren (limiet 0.5‰)'}</div>
            </div>
          </div>

          {/* Receipt items list */}
          <div className="py-2 border-b border-dashed border-gray-300 min-h-[140px]" id="receipt-items-list">
            <h3 className="font-mono text-xs font-black text-gray-500 uppercase mb-2">GESCANDE CONSUMPTIES:</h3>
            
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-450">
                <p className="font-mono text-xs text-gray-400 italic">Kassa is leeg...</p>
                <p className="font-mono text-[9px] text-gray-400 mt-1">Scan of klik op drankjes op het linkerscherm om te vullen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.scanId} className="space-y-1.5" id={`receipt-row-${item.drink.id}`}>
                    {/* Item row details */}
                    <div className="flex justify-between items-start font-mono text-xs">
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-gray-800 uppercase block">{item.drink.dutchName}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {item.drink.volumeMl}ml • {item.drink.abv}% • {item.drink.grams}g alc
                        </span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="font-bold text-gray-800">
                          €{(item.drink.priceEuro * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[9px] text-gray-500">
                          {parseFloat((item.drink.grams * item.quantity / 10).toFixed(1))} units
                        </div>
                      </div>
                    </div>

                    {/* Timeline slider and Quantity controls for this item */}
                    <div className="flex justify-between items-center gap-2 pl-1">
                      {/* Consumption time picker */}
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-gray-450 uppercase">Tijdstip:</span>
                        <select
                          value={item.consumedAgoHours}
                          onChange={(e) => onUpdateConsumedAgoHours(item.scanId, parseFloat(e.target.value))}
                          className="font-mono text-[9px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 focus:outline-amber-500 cursor-pointer"
                          id={`select-hours-${item.scanId}`}
                        >
                          <option value="0">Net gedronken (nu)</option>
                          <option value="1">1 uur geleden</option>
                          <option value="2">2 uur geleden</option>
                          <option value="3">3 uur geleden</option>
                          <option value="4">4 uur geleden</option>
                          <option value="5">5 uur geleden</option>
                          <option value="6">6 uur geleden</option>
                          <option value="8">8 uur geleden</option>
                        </select>
                      </div>

                      {/* Math Quantity adjusting buttons */}
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.scanId, -1)}
                          className="text-gray-500 hover:text-red-650 hover:bg-gray-100 p-1 rounded transition-colors"
                          id={`qt-minus-${item.scanId}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1 text-gray-800">
                          {item.quantity}x
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.scanId, 1)}
                          className="text-gray-500 hover:text-amber-550 hover:bg-gray-100 p-1 rounded transition-colors"
                          id={`qt-plus-${item.scanId}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.scanId)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded ml-0.5 transition-colors"
                          id={`delete-item-${item.scanId}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals math layout */}
          <div className="py-2.5 font-mono text-xs space-y-1.5 border-b border-dashed border-gray-300">
            <div className="flex justify-between">
              <span>SUBTOTAAL:</span>
              <span className="font-bold">€{totalEuro.toFixed(2)}</span>
            </div>
            
            {discountEuro > 0 && (
              <div className="flex justify-between text-amber-600">
                <span className="flex items-center gap-1 font-bold">
                  <Tag className="w-3 h-3" /> BODEM KORTING (SNACKS):
                </span>
                <span className="font-bold">-€{discountEuro.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm pt-1.5 border-t border-dashed border-gray-200">
              <span>TOTAAL TE BETALEN:</span>
              <span>€{finalTotalEuro.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 pt-1.5">
              <span>ALCOHOL SUMMARY:</span>
              <span className="font-bold text-amber-500">{totalUnits} UNITS / {totalGrams.toFixed(1)}g</span>
            </div>
          </div>

          {/* BTW Statistics */}
          <div className="py-2 font-mono text-[9px] text-gray-400 space-y-0.5 border-b border-dashed border-gray-300">
            <div>BTW-CODE   NETTO    %    BTW-BEDRAG</div>
            <div className="flex justify-between">
              <span>HOOG (A)   €{(finalTotalEuro * 0.79).toFixed(2)}  21%   €{(finalTotalEuro * 0.173).toFixed(2)}</span>
            </div>
            <div className="text-[8px] italic">Leverbelasting (BTW-B) wordt vergoed via de verzekering.</div>
          </div>

          {/* Simulated Loyalty Card Section */}
          <div className="my-4" id="bonus-card-section">
            {profile.hasBonusCard ? (
              <div
                onClick={onOpenProfile}
                className="bg-amber-500 text-white p-3 rounded-xl cursor-pointer hover:bg-amber-600 transition-all relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-white/10 rounded-full" />
                <div className="font-mono font-bold text-[10px] tracking-widest uppercase">
                  PERSOONLIJK PROFIEL
                </div>
                <div className="font-sans font-black text-sm tracking-tight mt-1 flex items-center justify-between">
                  <span>{profile.name} (GELIJK)</span>
                  <span className="text-[10px] font-mono bg-white text-amber-500 px-1.5 py-0.5 rounded">
                    GESCAND
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenProfile}
                className="w-full border-2 border-dashed border-amber-500 text-amber-500 rounded-xl py-3 px-4 font-mono text-xs font-bold hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                id="loyalty-card-btn"
              >
                <CreditCard className="w-4 h-4" />
                <span>SCAN BONUSKAART / PROFIEL</span>
              </button>
            )}
          </div>

          {/* Simulated Barcode */}
          <div className="flex flex-col items-center pt-3 font-mono text-[9px]">
            <div className="h-8 bg-black w-2/3 flex items-center justify-center text-white text-[6px] tracking-[6px] text-center overflow-hidden font-serif border-b border-black">
              ||||| | |||| ||| ||||||| | ||| |||| | | ||||| | ||||| |
            </div>
            <span className="mt-1 text-gray-500">8712000213034921</span>
          </div>

          {/* Simulated Jagged edge at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x bg-[linear-gradient(45deg,#f8f9fa_33.333%,transparent_33.333%,transparent_66.666%,#f8f9fa_66.666%)] bg-[size:10px_10px]" />
        </div>
      </div>

      {/* Persistent Checkout actions footer */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg" id="receipt-footer-action">
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onCheckout}
          className={`w-full py-6 rounded-3xl font-sans font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all ${
            items.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-slate-800 text-white hover:bg-slate-700 hover:scale-[1.01] active:scale-[0.99] border-b-4 border-slate-900 shadow-xl'
          }`}
          id="checkout-trigger-btn"
        >
          <CreditCard className="w-6 h-6 animate-pulse" />
          <span>AFREKENEN & BEREKEN TIJD</span>
        </button>
      </div>
    </div>
  );
}
