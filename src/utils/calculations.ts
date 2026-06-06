/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Drink, ScannedItem, UserProfile, BACDetails } from '../types';

/**
 * Runs a pharmacokinetic simulation of alcohol absorption and elimination.
 * We run a simulation with 3-minute steps (0.05 hours) starting from the earliest consumption
 * of any drink, up to 16 hours in the future.
 */
export function calculateBACProfile(
  items: ScannedItem[],
  profile: UserProfile,
  futureHoursCount: number = 12
): { time: number; bac: number; absorbedGrams: number; bloodGrams: number }[] {
  if (items.length === 0) {
    const list = [];
    for (let h = 0; h <= futureHoursCount; h++) {
      list.push({ time: h, bac: 0, absorbedGrams: 0, bloodGrams: 0 });
    }
    return list;
  }

  // Find the earliest drink in hours ago (e.g. 4 hours ago is represented as -4)
  const maxAgo = Math.max(...items.map(item => item.consumedAgoHours), 1);
  const startHours = -maxAgo - 1; // start 1 hour before first drink
  const endHours = futureHoursCount; // simulate into the future

  const r = profile.sex === 'male' ? 0.68 : 0.55;
  const weightGrams = profile.weightKg * 1000;

  // Let's count snacks on the receipt to apply a bonus
  const snacksCount = items.filter(
    item => item.drink.category === 'snack_non' && item.drink.id.includes('snack')
  ).reduce((acc, curr) => acc + curr.quantity, 0);

  // Absorption parameters based on stomach content and snacks
  let ka = 2.0; // absorption coefficient (how fast it enters blood stream)
  let absorptionEfficiency = 0.95; // some alcohol is lost to first-pass metabolism in stomach

  if (profile.stomach === 'empty') {
    ka = 2.5;
    absorptionEfficiency = 0.98;
  } else if (profile.stomach === 'light') {
    ka = 1.4;
    absorptionEfficiency = 0.88;
  } else if (profile.stomach === 'full') {
    ka = 0.7;
    absorptionEfficiency = 0.75;
  }

  // Each snack improves stomach buffering!
  if (snacksCount > 0) {
    // Bitterballen / snacks further delay and reduce absorption
    ka = Math.max(0.4, ka - snacksCount * 0.15);
    absorptionEfficiency = Math.max(0.60, absorptionEfficiency - snacksCount * 0.05);
  }

  // Elimination rate in grams of alcohol per hour:
  // beta is 0.15‰ per hour (0.15 mg/ml or 0.15 g/L).
  // BAC (‰) = bloodGrams / (weightGrams * r) * 1000
  // So a 0.15‰ change in BAC corresponds to:
  // gramsEliminatedPerHour = 0.15 * (profile.weightKg * r)
  const beta = 0.15; // ‰ per hour
  const eliminationRateGramsPerHour = beta * profile.weightKg * r;

  const dt = 0.05; // 3-minute steps
  let stomachGrams = 0;
  let bloodGrams = 0;

  // We will run the simulation and sample data points every 0.1 hours (6 minutes)
  const samplePoints: { time: number; bac: number; absorbedGrams: number; bloodGrams: number }[] = [];

  // Group drinks by their exact consumption time (consumedAgoHours)
  // Since we want time relative to "now" (0), a consumedAgoHours of 2 means consumed at simulation time -2.
  const drinksAtTimeMap = new Map<number, { grams: number }[]>();
  items.forEach(item => {
    if (item.drink.grams === 0) return; // skip non-alcoholic or snacks (they are factored in food efficiency already)
    const consumeTime = -item.consumedAgoHours;
    // Find closest step
    const roundedTime = Math.round(consumeTime / dt) * dt;
    const currentList = drinksAtTimeMap.get(roundedTime) || [];
    currentList.push({
      grams: item.drink.grams * item.quantity
    });
    drinksAtTimeMap.set(roundedTime, currentList);
  });

  // Run step by step simulation
  for (let t = startHours; t <= endHours; t += dt) {
    // 1. Add newly consumed drinks at this step
    const stepRounded = Math.round(t / dt) * dt;
    const incomingDrinks = drinksAtTimeMap.get(stepRounded);
    if (incomingDrinks) {
      incomingDrinks.forEach(drink => {
        stomachGrams += drink.grams;
      });
    }

    // 2. Transfer from stomach to blood (Absorption)
    // dG/dt = -ka * stomachGrams
    const absorbedThisStep = stomachGrams * (1 - Math.exp(-ka * dt));
    stomachGrams -= absorbedThisStep;

    // Add to blood (with absorption efficiency)
    bloodGrams += absorbedThisStep * absorptionEfficiency;

    // 3. Elimination by the liver (minimum 0.0)
    // Elimination is zero-order (constant rate) if there is alcohol in blood
    const eliminatedThisStep = eliminationRateGramsPerHour * dt;
    bloodGrams = Math.max(0, bloodGrams - eliminatedThisStep);

    // 4. Calculate current BAC (‰)
    // BAC (‰) = (bloodGrams / (weightKg * r))
    // r is ratio (0.68 male, 0.55 female)
    const currentBAC = bloodGrams / (profile.weightKg * r);

    // Save sampling points (round time to 1 decimal place to prevent floating inaccuracy)
    const displayTime = Math.round(t * 10) / 10;
    // Sample only at 0.1-hour intervals to keep data clean, avoiding duplicating same displayTime
    if (Math.abs(t - displayTime) < 0.001) {
      // Check if we already have this time sampled (avoid edge case duplicates)
      if (samplePoints.length === 0 || samplePoints[samplePoints.length - 1].time !== displayTime) {
        samplePoints.push({
          time: displayTime,
          bac: Math.max(0, parseFloat(currentBAC.toFixed(3))),
          absorbedGrams: Math.round(stomachGrams * 10) / 10,
          bloodGrams: Math.round(bloodGrams * 10) / 10
        });
      }
    }
  }

  return samplePoints;
}

/**
 * Helper to calculate BAC right now and details
 */
export function getBACDetails(items: ScannedItem[], profile: UserProfile, sliderOffsetHours: number = 0): BACDetails {
  const profileSteps = calculateBACProfile(items, profile, 24);
  
  // Find the step corresponding to "now" (which is time = 0.0) + sliderOffsetHours
  const targetTime = Math.round(sliderOffsetHours * 10) / 10;
  const targetStep = profileSteps.find(p => Math.abs(p.time - targetTime) < 0.06) || {
    bac: 0,
    bloodGrams: 0
  };

  const currentBAC = targetStep.bac;
  const peakBAC = Math.max(...profileSteps.map(p => p.bac), 0);

  // Find when BAC returns to 0
  let timeToSoberHours = 0;
  // Starting from targetTime, find the first point where BAC is 0.0
  const remainingSteps = profileSteps.filter(p => p.time >= targetTime);
  const soberStep = remainingSteps.find(p => p.bac <= 0.01);
  if (soberStep) {
    timeToSoberHours = Math.max(0, soberStep.time - targetTime);
  } else {
    // If it's beyond 24 hours, estimate
    timeToSoberHours = currentBAC / 0.15;
  }

  // Legal Limits in internal NL law:
  // Beginner/novice: 0.2‰
  // Standard: 0.5‰
  const limit = profile.driverType === 'beginner' ? 0.2 : 0.5;

  const canDriveCar = currentBAC < limit && currentBAC === 0; 
  // Technically, under NL law, driving with any alcohol is discouraged but under legal limit is allowed.
  // However, is it strictly legal? If BAC < limit, it is legally allowed. Let's make it the legal allowance:
  const isBelowLegalLimit = currentBAC < limit;
  
  // Bicycle constraint
  const canDriveBike = currentBAC < 0.5; // Cycling drunk is illegal under 0.5 theoretically too, but practically > 0.8 causes trouble
  const canWalk = currentBAC < 1.5; // Above 1.5 walking becomes a hilariously winding path!

  // Determine status color and text of current BAC
  let statusColor: 'green' | 'yellow' | 'orange' | 'red' = 'green';
  let statusText = 'Volledig Nuchter';

  if (currentBAC === 0) {
    statusColor = 'green';
    statusText = 'Volledig Nuchter';
  } else if (currentBAC < 0.2) {
    statusColor = 'yellow';
    statusText = 'Lichte invloed';
  } else if (currentBAC < 0.5) {
    statusColor = 'orange';
    statusText = 'Aangeschoten';
  } else {
    statusColor = 'red';
    statusText = currentBAC < 1.5 ? 'Dronken' : currentBAC < 2.5 ? 'Lazarus' : 'Koma-niveau!';
  }

  return {
    currentBAC,
    peakBAC,
    timeToSoberHours: parseFloat(timeToSoberHours.toFixed(1)),
    gramsActive: targetStep.bloodGrams,
    canDriveCar: isBelowLegalLimit,
    canDriveBike,
    canWalk,
    statusColor,
    statusText
  };
}

/**
 * Generates sound beep for self scan register
 */
export function playScanSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    // Classic Albert Heijn selfscan high pitch chirp!
    oscillator.frequency.setValueAtTime(1450, audioCtx.currentTime); // 1450Hz beep
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

/**
 * Plays a double beep for error / warning
 */
export function playErrorSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (timeOffset: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime + timeOffset); // low buzzer
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + timeOffset + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + timeOffset + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime + timeOffset);
      oscillator.stop(audioCtx.currentTime + timeOffset + 0.18);
    };

    playBeep(0.0);
    playBeep(0.2);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

/**
 * Double scanning beep indicating successful "checkout" or receipt printing
 */
export function playCheckoutSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (freq: number, timeOffset: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + timeOffset);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + timeOffset + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + timeOffset + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime + timeOffset);
      oscillator.stop(audioCtx.currentTime + timeOffset + duration + 0.02);
    };

    // Nice happy arpeggio sound!
    playBeep(880, 0.0, 0.1);
    playBeep(1100, 0.1, 0.1);
    playBeep(1320, 0.2, 0.15);
    playBeep(1760, 0.35, 0.35);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}
