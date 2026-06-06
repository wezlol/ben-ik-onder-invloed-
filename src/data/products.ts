/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Drink } from '../types';

export const DRINK_PRODUCTS: Drink[] = [
  // BIER CATEGORY
  {
    id: 'bier-vaasje',
    name: 'Standard Beer (Vaasje)',
    dutchName: 'Fluitje / Vaasje Pils',
    description: 'Heineken, Hertog Jan, Amstel (250ml, 5.0%)',
    abv: 5.0,
    volumeMl: 250,
    category: 'bier',
    priceEuro: 2.80,
    grams: 10.0, // (250 * 5.0 * 0.8) / 100 = 10g
    barcode: '8712000010014'
  },
  {
    id: 'bier-flesje',
    name: 'Beer Bottle',
    dutchName: 'Koud Flesje Bier',
    description: 'Pilsener flesje (330ml, 5.0%)',
    abv: 5.0,
    volumeMl: 330,
    category: 'bier',
    priceEuro: 3.20,
    grams: 13.2,
    barcode: '8712000250106'
  },
  {
    id: 'bier-halveliter',
    name: 'Pint of Beer',
    dutchName: 'Halve Liter Blik/Glas',
    description: 'Kordaat, Schultenbräu of Premium Pils (500ml, 5.0%)',
    abv: 5.0,
    volumeMl: 500,
    category: 'bier',
    priceEuro: 4.80,
    grams: 20.0,
    barcode: '8712000987654'
  },
  {
    id: 'bier-speciaal-licht',
    name: 'Blond / White Beer',
    dutchName: 'Lekker Speciaalbier (Licht)',
    description: 'La Chouffe, Duvel, IJwit (330ml, 8.0%)',
    abv: 8.0,
    volumeMl: 330,
    category: 'bier',
    priceEuro: 5.20,
    grams: 21.12, // (330 * 8 * 0.8)/100 = 21.12g
    barcode: '5411822310123'
  },
  {
    id: 'bier-speciaal-zwaar',
    name: 'Tripel / Quadrupel',
    dutchName: 'Zware Jongen (Tripel)',
    description: 'Tripel Karmeliet, Westmalle (330ml, 9.5%)',
    abv: 9.5,
    volumeMl: 330,
    category: 'bier',
    priceEuro: 5.80,
    grams: 25.08,
    barcode: '5411822002141'
  },

  // WIJN CATEGORY
  {
    id: 'wijn-wit',
    name: 'White Wine',
    dutchName: 'Glas Witte Wijn',
    description: 'Chardonnay / Sauvignon Blanc (125ml, 12.0%)',
    abv: 12.0,
    volumeMl: 125,
    category: 'wijn',
    priceEuro: 4.50,
    grams: 12.0, // (125 * 12 * 0.8) / 100 = 12g
    barcode: '3256154321098'
  },
  {
    id: 'wijn-rood',
    name: 'Red Wine',
    dutchName: 'Glas Rode Wijn',
    description: 'Merlot, Cab. Sauvignon (125ml, 13.5%)',
    abv: 13.5,
    volumeMl: 125,
    category: 'wijn',
    priceEuro: 4.60,
    grams: 13.5,
    barcode: '8400123456789'
  },
  {
    id: 'wijn-rose',
    name: 'Rosé Wine',
    dutchName: 'Lekker Glas Rosé',
    description: 'Zomers terraswijntje (125ml, 11.5%)',
    abv: 11.5,
    volumeMl: 125,
    category: 'wijn',
    priceEuro: 4.30,
    grams: 11.5,
    barcode: '3261230005432'
  },
  {
    id: 'wijn-prosecco',
    name: 'Prosecco / Champagne',
    dutchName: 'Glas Bubbels / Prosecco',
    description: 'Feestelijke bubbels (100ml, 11.5%)',
    abv: 11.5,
    volumeMl: 100,
    category: 'wijn',
    priceEuro: 5.50,
    grams: 9.2,
    barcode: '8001234567890'
  },

  // STERKE DRANK CATEGORY
  {
    id: 'sterk-jenever',
    name: 'Jenever',
    dutchName: 'Jonge / Oude Jenever',
    description: 'Echt Hollands glaasje (35ml, 35.0%)',
    abv: 35.0,
    volumeMl: 35,
    category: 'sterk',
    priceEuro: 2.90,
    grams: 9.8, // (35 * 35 * 0.8)/100 = 9.8g
    barcode: '8710234005612'
  },
  {
    id: 'sterk-whisky',
    name: 'Whisky / Vodka Shot',
    dutchName: 'Glas Whisky / Gin / Vodka',
    description: 'Puur of on the rocks (35ml, 40.0%)',
    abv: 40.0,
    volumeMl: 35,
    category: 'sterk',
    priceEuro: 5.50,
    grams: 11.2,
    barcode: '5010123000123'
  },
  {
    id: 'sterk-licor43',
    name: 'Sweet Liqueur',
    dutchName: 'Liqueur (Licor 43 / Baileys)',
    description: 'Zoet glaasje genot (50ml, 28.0%)',
    abv: 28.0,
    volumeMl: 50,
    category: 'sterk',
    priceEuro: 4.90,
    grams: 11.2,
    barcode: '8410213045610'
  },

  // SHOTS CATEGORY
  {
    id: 'shot-salmari',
    name: 'Salmari',
    dutchName: 'Salmari / Drop shot',
    description: 'Ijskoud drop shotje (20ml, 25.0%)',
    abv: 25.0,
    volumeMl: 20,
    category: 'shot',
    priceEuro: 2.50,
    grams: 4.0, // (20 * 25 * 0.8)/100 = 4g
    barcode: '6412345000123'
  },
  {
    id: 'shot-jagermeister',
    name: 'Jägermeister',
    dutchName: 'Jägermeister Shot',
    description: 'Kruidige shot (20ml, 35.0%)',
    abv: 35.0,
    volumeMl: 20,
    category: 'shot',
    priceEuro: 2.50,
    grams: 5.6,
    barcode: '4004123456789'
  },
  {
    id: 'shot-flugel',
    name: 'Flügel',
    dutchName: 'Hele Flügelfles',
    description: 'Met het dopje op de neus! (20ml, 10.0%)',
    abv: 10.0,
    volumeMl: 20,
    category: 'shot',
    priceEuro: 2.00,
    grams: 1.6,
    barcode: '8710214002345'
  },
  {
    id: 'shot-tequila',
    name: 'Tequila',
    dutchName: 'Tequila met Zout & Citroen',
    description: 'Slammer shot (20ml, 38.0%)',
    abv: 38.0,
    volumeMl: 20,
    category: 'shot',
    priceEuro: 3.50,
    grams: 6.08,
    barcode: '7501023456781'
  },

  // COCKTAIL CATEGORY
  {
    id: 'cocktail-gintonic',
    name: 'Gin & Tonic',
    dutchName: 'Gin & Tonic',
    description: 'Verfrissende klassieker (250ml, 10.0%)',
    abv: 10.0,
    volumeMl: 250,
    category: 'cocktail',
    priceEuro: 8.50,
    grams: 20.0, // 250ml overall beverage includes 50ml gin (40%) and tonic
    barcode: '5012345678092'
  },
  {
    id: 'cocktail-apero',
    name: 'Aperol Spritz',
    dutchName: 'Aperol Spritz',
    description: 'Oranje terras-favoriet (200ml, 8.5%)',
    abv: 8.5,
    volumeMl: 200,
    category: 'cocktail',
    priceEuro: 7.50,
    grams: 13.6,
    barcode: '8002230123456'
  },
  {
    id: 'cocktail-bacardi-cola',
    name: 'Baco (Bacardi Cola)',
    dutchName: 'Baco / Mixdrank',
    description: 'Bacardi rum met cola (250ml, 8.0%)',
    abv: 8.0,
    volumeMl: 250,
    category: 'cocktail',
    priceEuro: 7.50,
    grams: 16.0,
    barcode: '8710213034921'
  },

  // SNACK & NON-ALCOHOLISCH CATEGORY
  {
    id: 'non-water',
    name: 'Glass of Water',
    dutchName: 'Glas Kraanwater',
    description: 'Levensredder, hydratatie holds the key! (250ml, 0.0%)',
    abv: 0.0,
    volumeMl: 250,
    category: 'snack_non',
    priceEuro: 0.00,
    grams: 0.0,
    barcode: '0000000000000'
  },
  {
    id: 'non-snack-bitterballen',
    name: 'Portie Bitterballen',
    dutchName: 'Portie Bitterballen (8 stuks)',
    description: 'Echte bodemleggers! Verlicht alcoholabsorptie met 15% (0.0%)',
    abv: 0.0,
    volumeMl: 100, // mock volume
    category: 'snack_non',
    priceEuro: 6.50,
    grams: 0.0,
    barcode: '8710813000781'
  },
  {
    id: 'non-snack-frikandel',
    name: 'Frikandel Speciaal',
    dutchName: 'Frikandel Speciaal',
    description: 'Cultsnack uit de muur (0.0%)',
    abv: 0.0,
    volumeMl: 50,
    category: 'snack_non',
    priceEuro: 2.80,
    grams: 0.0,
    barcode: '8710153099119'
  },
  {
    id: 'non-fris-cola',
    name: 'Cola Zero / Fris',
    dutchName: 'Blikje Cola Zero / Fris',
    description: 'Verfrissende frisdrank (330ml, 0.0%)',
    abv: 0.0,
    volumeMl: 330,
    category: 'snack_non',
    priceEuro: 2.20,
    grams: 0.0,
    barcode: '5449000133335'
  }
];
