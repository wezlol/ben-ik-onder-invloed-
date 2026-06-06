/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Drink {
  id: string;
  name: string;
  dutchName: string;
  description: string;
  abv: number; // Alcohol By Volume in %
  volumeMl: number; // Volume in ml
  category: 'bier' | 'wijn' | 'sterk' | 'shot' | 'cocktail' | 'snack_non';
  priceEuro: number; // Price for the checkout look
  grams: number; // Pure alcohol in grams: (volumeMl * abv * 0.8) / 100
  barcode: string; // Mock barcode
}

export interface ScannedItem {
  scanId: string;
  drink: Drink;
  quantity: number;
  consumedAgoHours: number; // How many hours ago was this consumed
}

export interface UserProfile {
  name: string;
  weightKg: number;
  sex: 'male' | 'female';
  driverType: 'beginner' | 'experienced';
  stomach: 'empty' | 'light' | 'full';
  hasBonusCard: boolean;
}

export interface BACDetails {
  currentBAC: number; // blood alcohol concentration in promille (‰)
  peakBAC: number; // highest BAC reached
  timeToSoberHours: number; // hours until BAC is 0
  gramsActive: number; // current grams of alcohol active in body
  canDriveCar: boolean;
  canDriveBike: boolean;
  canWalk: boolean;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  statusText: string;
}
