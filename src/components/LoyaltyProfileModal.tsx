/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoyaltyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

export default function LoyaltyProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: LoyaltyProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [sex, setSex] = useState<"male" | "female">(profile.sex);
  const [driverType, setDriverType] = useState<"beginner" | "experienced">(
    profile.driverType
  );
  const [stomach, setStomach] = useState<"empty" | "light" | "full">(
    profile.stomach
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name || 'Gezellige Drinker',
      weightKg: Math.max(30, Math.min(200, weightKg)),
      sex,
      driverType,
      stomach,
      hasBonusCard: true,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md overflow-hidden bg-white rounded-3xl border-4 border border-amber-500 shadow-2xl"
          >
            {/* Header: Designed like AH card style */}
            <div className="bg-amber-500 text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                id="close-profile-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-amber-500">
                  <span className="font-sans font-black text-xl tracking-tight">BONUS</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">Kassaprofiel Activeren</h3>
                  <p className="text-xs text-white/80">Configureer je biologische parameters</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-amber-50/30" id="profile-form">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Naam / Alias
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="bijv. Pilsbaas"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    id="profile-name-input"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Lichaamsgewicht (kg)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                    min="30"
                    max="200"
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    id="profile-weight-input"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    kg
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  Cruciaal voor de bloedvolume-berekening (Widmark-formule).
                </p>
              </div>

              {/* Biological Sex */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Biologisch Geslacht
                </label>
                <div className="grid grid-cols-2 gap-3" id="profile-sex-grid">
                  <button
                    type="button"
                    onClick={() => setSex('male')}
                    className={`py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      sex === 'male'
                        ? 'bg-amber-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-sex-male-btn"
                  >
                    <span>🙋‍♂️ Man</span>
                    <span className="text-xs opacity-60">(r = 0.68)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('female')}
                    className={`py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      sex === 'female'
                        ? 'bg-amber-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-sex-female-btn"
                  >
                    <span>🙋‍♀️ Vrouw</span>
                    <span className="text-xs opacity-60">(r = 0.55)</span>
                  </button>
                </div>
              </div>

              {/* Driver Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Rijbewijs Status (Legal limit)
                </label>
                <div className="grid grid-cols-2 gap-3" id="profile-driver-grid">
                  <button
                    type="button"
                    onClick={() => setDriverType('beginner')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs text-center border transition-all ${
                      driverType === 'beginner'
                        ? 'bg-amber-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-driver-beginner-btn"
                  >
                    <div>Beginnend Bestuurder</div>
                    <div className="text-[10px] opacity-80">(Max 0.2‰ BAC)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverType('experienced')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs text-center border transition-all ${
                      driverType === 'experienced'
                        ? 'bg-amber-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-driver-experienced-btn"
                  >
                    <div>Ervaren Rijder</div>
                    <div className="text-[10px] opacity-80">(Max 0.5‰ BAC)</div>
                  </button>
                </div>
              </div>

              {/* Stomach Contents */}
              <div className="space-y-1.5 row-span-1">
                <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
                  Wat zit er in de buik? (Maaginhoud)
                </label>
                <div className="grid grid-cols-3 gap-2" id="profile-stomach-grid">
                  <button
                    type="button"
                    onClick={() => setStomach('empty')}
                    className={`py-2 px-1 text-xs text-center rounded-xl font-bold border transition-all ${
                      stomach === 'empty'
                        ? 'bg-amber-600 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-stomach-empty-btn"
                  >
                    💨 Leeg
                  </button>
                  <button
                    type="button"
                    onClick={() => setStomach('light')}
                    className={`py-2 px-1 text-xs text-center rounded-xl font-bold border transition-all ${
                      stomach === 'light'
                        ? 'bg-amber-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-stomach-light-btn"
                  >
                    🥪 Licht
                  </button>
                  <button
                    type="button"
                    onClick={() => setStomach('full')}
                    className={`py-2 px-1 text-xs text-center rounded-xl font-bold border transition-all ${
                      stomach === 'full'
                        ? 'bg-emerald-600 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    id="profile-stomach-full-btn"
                  >
                    🍕 Volle maag
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1">
                  Een gevulde maag vertraagt en vermindert de alcohol-opname aanzienlijk.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 bg-gray-200 hover:bg-gray-300 hover:text-gray-900 text-gray-700 font-bold rounded-xl transition-all"
                  id="profile-cancel-btn"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  id="profile-save-btn"
                >
                  <span>Gegevens Opslaan</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
