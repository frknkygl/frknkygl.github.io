export interface CurrencyPack {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  costGems?: number;
  grantGold?: number;
  grantGems?: number;
  bonus?: string;
}

// This is a single-player offline game: "purchases" simply grant currency
// instantly, there is no real payment processing anywhere in this project.
export const GOLD_PACKS: CurrencyPack[] = [
  { id: 'gold-small', name: 'Ganimet Kesesi', description: '1.000 altın', priceLabel: '150 elmas', costGems: 150, grantGold: 1000 },
  { id: 'gold-medium', name: 'Ganimet Sandığı', description: '5.500 altın', priceLabel: '650 elmas', costGems: 650, grantGold: 5500, bonus: '+10%' },
  { id: 'gold-large', name: 'Lord Hazinesi', description: '13.000 altın', priceLabel: '1400 elmas', costGems: 1400, grantGold: 13000, bonus: '+18%' },
];

export const GEM_PACKS: CurrencyPack[] = [
  { id: 'gem-small', name: 'Küçük Elmas Kesesi', description: '80 elmas', priceLabel: '₺29,99', grantGems: 80 },
  { id: 'gem-medium', name: 'Runik Elmas Torbası', description: '450 elmas', priceLabel: '₺149,99', grantGems: 450, bonus: '+12%' },
  { id: 'gem-large', name: 'Kadim Elmas Sandığı', description: '1.200 elmas', priceLabel: '₺349,99', grantGems: 1200, bonus: '+25%' },
];

export const ENERGY_REFILL_COST_GEMS = 40;
