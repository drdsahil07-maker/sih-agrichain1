export interface PriceTrendPoint {
  date: string;
  fullDate: string;
  mandiPrice: number;
  mandiMin: number;
  mandiMax: number;
  traderOffer: number;
  agriChainNet: number;
  arrivalVolumeQtl: number;
}

export interface CropPriceHistory {
  crop: string;
  hindiName: string;
  primaryMandi: string;
  trendDirection: 'up' | 'down' | 'volatile';
  changePercent14d: number;
  volatilityRating: 'High' | 'Moderate' | 'Low';
  currentAvgMandi: number;
  currentAgriChainNet: number;
  currentTraderSpot: number;
  netAdvantagePercent: number;
  optimalSellingRecommendation: string;
  data: PriceTrendPoint[];
}

export const CROP_PRICE_HISTORIES: Record<string, CropPriceHistory> = {
  'Tomato': {
    crop: 'Tomato',
    hindiName: 'Tamatar',
    primaryMandi: 'Indore Choithram APMC',
    trendDirection: 'up',
    changePercent14d: +18.3,
    volatilityRating: 'High',
    currentAvgMandi: 13.80,
    currentAgriChainNet: 14.20,
    currentTraderSpot: 10.50,
    netAdvantagePercent: 35.2,
    optimalSellingRecommendation: 'Optimal Selling Window: Next 24-36 hrs. High demand from Indore commercial kitchens with low regional arrivals.',
    data: [
      { date: '11 Aug', fullDate: '2026-08-11', mandiPrice: 11.20, mandiMin: 9.50, mandiMax: 12.80, traderOffer: 8.50, agriChainNet: 12.60, arrivalVolumeQtl: 1450 },
      { date: '13 Aug', fullDate: '2026-08-13', mandiPrice: 10.80, mandiMin: 9.00, mandiMax: 12.00, traderOffer: 8.00, agriChainNet: 12.40, arrivalVolumeQtl: 1680 },
      { date: '15 Aug', fullDate: '2026-08-15', mandiPrice: 11.50, mandiMin: 10.00, mandiMax: 13.00, traderOffer: 8.80, agriChainNet: 12.90, arrivalVolumeQtl: 1320 },
      { date: '17 Aug', fullDate: '2026-08-17', mandiPrice: 12.20, mandiMin: 10.50, mandiMax: 13.50, traderOffer: 9.20, agriChainNet: 13.10, arrivalVolumeQtl: 1210 },
      { date: '19 Aug', fullDate: '2026-08-19', mandiPrice: 11.80, mandiMin: 10.00, mandiMax: 13.20, traderOffer: 9.00, agriChainNet: 13.00, arrivalVolumeQtl: 1490 },
      { date: '21 Aug', fullDate: '2026-08-21', mandiPrice: 12.60, mandiMin: 11.00, mandiMax: 14.20, traderOffer: 9.50, agriChainNet: 13.40, arrivalVolumeQtl: 1180 },
      { date: '23 Aug', fullDate: '2026-08-23', mandiPrice: 13.40, mandiMin: 11.80, mandiMax: 14.80, traderOffer: 10.00, agriChainNet: 13.80, arrivalVolumeQtl: 1050 },
      { date: '25 Aug', fullDate: '2026-08-25', mandiPrice: 12.90, mandiMin: 11.20, mandiMax: 14.40, traderOffer: 9.80, agriChainNet: 13.60, arrivalVolumeQtl: 1380 },
      { date: '27 Aug', fullDate: '2026-08-27', mandiPrice: 12.00, mandiMin: 10.50, mandiMax: 13.50, traderOffer: 9.00, agriChainNet: 13.20, arrivalVolumeQtl: 1540 },
      { date: '29 Aug', fullDate: '2026-08-29', mandiPrice: 12.50, mandiMin: 11.00, mandiMax: 14.00, traderOffer: 9.50, agriChainNet: 13.50, arrivalVolumeQtl: 1290 },
      { date: '31 Aug', fullDate: '2026-08-31', mandiPrice: 13.10, mandiMin: 11.50, mandiMax: 14.60, traderOffer: 10.00, agriChainNet: 13.90, arrivalVolumeQtl: 1140 },
      { date: '02 Sep', fullDate: '2026-09-02', mandiPrice: 12.70, mandiMin: 11.00, mandiMax: 14.20, traderOffer: 9.60, agriChainNet: 13.70, arrivalVolumeQtl: 1310 },
      { date: '04 Sep', fullDate: '2026-09-04', mandiPrice: 13.50, mandiMin: 12.00, mandiMax: 15.00, traderOffer: 10.20, agriChainNet: 14.00, arrivalVolumeQtl: 1080 },
      { date: '06 Sep', fullDate: '2026-09-06', mandiPrice: 13.20, mandiMin: 11.80, mandiMax: 14.80, traderOffer: 10.00, agriChainNet: 13.90, arrivalVolumeQtl: 1240 },
      { date: '08 Sep', fullDate: '2026-09-08', mandiPrice: 14.00, mandiMin: 12.50, mandiMax: 15.50, traderOffer: 10.80, agriChainNet: 14.30, arrivalVolumeQtl: 980 },
      { date: '10 Sep (Today)', fullDate: '2026-09-10', mandiPrice: 13.80, mandiMin: 12.50, mandiMax: 15.20, traderOffer: 10.50, agriChainNet: 14.20, arrivalVolumeQtl: 1020 },
    ]
  },
  'Onion': {
    crop: 'Onion',
    hindiName: 'Pyaz',
    primaryMandi: 'Indore & Ujjain APMC',
    trendDirection: 'up',
    changePercent14d: +12.5,
    volatilityRating: 'Moderate',
    currentAvgMandi: 20.40,
    currentAgriChainNet: 21.80,
    currentTraderSpot: 16.50,
    netAdvantagePercent: 32.1,
    optimalSellingRecommendation: 'Bullish Momentum: Storage stocks dwindling before Kharif harvest. Compiler locks firm restaurant supply contracts.',
    data: [
      { date: '11 Aug', fullDate: '2026-08-11', mandiPrice: 17.50, mandiMin: 15.50, mandiMax: 19.50, traderOffer: 14.00, agriChainNet: 18.60, arrivalVolumeQtl: 2800 },
      { date: '13 Aug', fullDate: '2026-08-13', mandiPrice: 17.80, mandiMin: 15.80, mandiMax: 19.80, traderOffer: 14.20, agriChainNet: 18.90, arrivalVolumeQtl: 2750 },
      { date: '15 Aug', fullDate: '2026-08-15', mandiPrice: 18.20, mandiMin: 16.00, mandiMax: 20.00, traderOffer: 14.50, agriChainNet: 19.30, arrivalVolumeQtl: 2600 },
      { date: '17 Aug', fullDate: '2026-08-17', mandiPrice: 18.00, mandiMin: 16.00, mandiMax: 20.20, traderOffer: 14.50, agriChainNet: 19.20, arrivalVolumeQtl: 2690 },
      { date: '19 Aug', fullDate: '2026-08-19', mandiPrice: 18.50, mandiMin: 16.50, mandiMax: 20.50, traderOffer: 15.00, agriChainNet: 19.70, arrivalVolumeQtl: 2510 },
      { date: '21 Aug', fullDate: '2026-08-21', mandiPrice: 18.90, mandiMin: 17.00, mandiMax: 21.00, traderOffer: 15.20, agriChainNet: 20.10, arrivalVolumeQtl: 2420 },
      { date: '23 Aug', fullDate: '2026-08-23', mandiPrice: 19.20, mandiMin: 17.20, mandiMax: 21.40, traderOffer: 15.50, agriChainNet: 20.40, arrivalVolumeQtl: 2350 },
      { date: '25 Aug', fullDate: '2026-08-25', mandiPrice: 19.00, mandiMin: 17.00, mandiMax: 21.20, traderOffer: 15.40, agriChainNet: 20.20, arrivalVolumeQtl: 2480 },
      { date: '27 Aug', fullDate: '2026-08-27', mandiPrice: 19.60, mandiMin: 17.50, mandiMax: 21.80, traderOffer: 15.80, agriChainNet: 20.80, arrivalVolumeQtl: 2200 },
      { date: '29 Aug', fullDate: '2026-08-29', mandiPrice: 20.00, mandiMin: 18.00, mandiMax: 22.20, traderOffer: 16.00, agriChainNet: 21.30, arrivalVolumeQtl: 2120 },
      { date: '31 Aug', fullDate: '2026-08-31', mandiPrice: 19.80, mandiMin: 17.80, mandiMax: 22.00, traderOffer: 16.00, agriChainNet: 21.10, arrivalVolumeQtl: 2250 },
      { date: '02 Sep', fullDate: '2026-09-02', mandiPrice: 20.20, mandiMin: 18.20, mandiMax: 22.50, traderOffer: 16.20, agriChainNet: 21.50, arrivalVolumeQtl: 2080 },
      { date: '04 Sep', fullDate: '2026-09-04', mandiPrice: 20.50, mandiMin: 18.50, mandiMax: 22.80, traderOffer: 16.50, agriChainNet: 21.90, arrivalVolumeQtl: 1980 },
      { date: '06 Sep', fullDate: '2026-09-06', mandiPrice: 20.10, mandiMin: 18.00, mandiMax: 22.40, traderOffer: 16.20, agriChainNet: 21.60, arrivalVolumeQtl: 2150 },
      { date: '08 Sep', fullDate: '2026-09-08', mandiPrice: 20.60, mandiMin: 18.60, mandiMax: 23.00, traderOffer: 16.70, agriChainNet: 22.00, arrivalVolumeQtl: 1920 },
      { date: '10 Sep (Today)', fullDate: '2026-09-10', mandiPrice: 20.40, mandiMin: 18.00, mandiMax: 22.00, traderOffer: 16.50, agriChainNet: 21.80, arrivalVolumeQtl: 2050 },
    ]
  },
  'Potato': {
    crop: 'Potato',
    hindiName: 'Aloo',
    primaryMandi: 'Indore APMC & Dewas',
    trendDirection: 'volatile',
    changePercent14d: +5.4,
    volatilityRating: 'Low',
    currentAvgMandi: 14.80,
    currentAgriChainNet: 15.60,
    currentTraderSpot: 12.00,
    netAdvantagePercent: 30.0,
    optimalSellingRecommendation: 'Stable Cold-Chain Demand: Snack & chip processors looking for Grade A sugar-tested tubers at steady pre-negotiated rates.',
    data: [
      { date: '11 Aug', fullDate: '2026-08-11', mandiPrice: 13.80, mandiMin: 12.00, mandiMax: 15.50, traderOffer: 11.00, agriChainNet: 14.70, arrivalVolumeQtl: 3400 },
      { date: '13 Aug', fullDate: '2026-08-13', mandiPrice: 14.00, mandiMin: 12.20, mandiMax: 15.80, traderOffer: 11.20, agriChainNet: 14.90, arrivalVolumeQtl: 3350 },
      { date: '15 Aug', fullDate: '2026-08-15', mandiPrice: 14.10, mandiMin: 12.50, mandiMax: 16.00, traderOffer: 11.40, agriChainNet: 15.00, arrivalVolumeQtl: 3200 },
      { date: '17 Aug', fullDate: '2026-08-17', mandiPrice: 13.90, mandiMin: 12.00, mandiMax: 15.60, traderOffer: 11.00, agriChainNet: 14.80, arrivalVolumeQtl: 3500 },
      { date: '19 Aug', fullDate: '2026-08-19', mandiPrice: 14.20, mandiMin: 12.50, mandiMax: 16.00, traderOffer: 11.50, agriChainNet: 15.10, arrivalVolumeQtl: 3280 },
      { date: '21 Aug', fullDate: '2026-08-21', mandiPrice: 14.40, mandiMin: 12.80, mandiMax: 16.20, traderOffer: 11.60, agriChainNet: 15.30, arrivalVolumeQtl: 3150 },
      { date: '23 Aug', fullDate: '2026-08-23', mandiPrice: 14.30, mandiMin: 12.60, mandiMax: 16.10, traderOffer: 11.50, agriChainNet: 15.20, arrivalVolumeQtl: 3220 },
      { date: '25 Aug', fullDate: '2026-08-25', mandiPrice: 14.50, mandiMin: 12.80, mandiMax: 16.30, traderOffer: 11.70, agriChainNet: 15.40, arrivalVolumeQtl: 3100 },
      { date: '27 Aug', fullDate: '2026-08-27', mandiPrice: 14.20, mandiMin: 12.40, mandiMax: 16.00, traderOffer: 11.40, agriChainNet: 15.10, arrivalVolumeQtl: 3340 },
      { date: '29 Aug', fullDate: '2026-08-29', mandiPrice: 14.60, mandiMin: 13.00, mandiMax: 16.50, traderOffer: 11.80, agriChainNet: 15.50, arrivalVolumeQtl: 2980 },
      { date: '31 Aug', fullDate: '2026-08-31', mandiPrice: 14.50, mandiMin: 12.80, mandiMax: 16.40, traderOffer: 11.70, agriChainNet: 15.40, arrivalVolumeQtl: 3050 },
      { date: '02 Sep', fullDate: '2026-09-02', mandiPrice: 14.70, mandiMin: 13.00, mandiMax: 16.60, traderOffer: 11.90, agriChainNet: 15.60, arrivalVolumeQtl: 2890 },
      { date: '04 Sep', fullDate: '2026-09-04', mandiPrice: 14.90, mandiMin: 13.20, mandiMax: 16.80, traderOffer: 12.10, agriChainNet: 15.80, arrivalVolumeQtl: 2780 },
      { date: '06 Sep', fullDate: '2026-09-06', mandiPrice: 14.60, mandiMin: 13.00, mandiMax: 16.50, traderOffer: 11.80, agriChainNet: 15.50, arrivalVolumeQtl: 3010 },
      { date: '08 Sep', fullDate: '2026-09-08', mandiPrice: 15.00, mandiMin: 13.40, mandiMax: 17.00, traderOffer: 12.20, agriChainNet: 15.90, arrivalVolumeQtl: 2720 },
      { date: '10 Sep (Today)', fullDate: '2026-09-10', mandiPrice: 14.80, mandiMin: 13.00, mandiMax: 16.50, traderOffer: 12.00, agriChainNet: 15.60, arrivalVolumeQtl: 2850 },
    ]
  },
  'Garlic': {
    crop: 'Garlic',
    hindiName: 'Lahsun',
    primaryMandi: 'Mandsaur & Indore APMC',
    trendDirection: 'up',
    changePercent14d: +22.8,
    volatilityRating: 'High',
    currentAvgMandi: 132.00,
    currentAgriChainNet: 144.50,
    currentTraderSpot: 108.00,
    netAdvantagePercent: 33.8,
    optimalSellingRecommendation: 'High Export & Institutional Premium: Direct linkage to spice processors unlocks massive ₹36.50/kg net value premium over village middlemen.',
    data: [
      { date: '11 Aug', fullDate: '2026-08-11', mandiPrice: 112.00, mandiMin: 98.00, mandiMax: 125.00, traderOffer: 88.00, agriChainNet: 122.00, arrivalVolumeQtl: 850 },
      { date: '13 Aug', fullDate: '2026-08-13', mandiPrice: 115.00, mandiMin: 100.00, mandiMax: 128.00, traderOffer: 90.00, agriChainNet: 125.00, arrivalVolumeQtl: 820 },
      { date: '15 Aug', fullDate: '2026-08-15', mandiPrice: 118.00, mandiMin: 104.00, mandiMax: 130.00, traderOffer: 92.00, agriChainNet: 128.00, arrivalVolumeQtl: 780 },
      { date: '17 Aug', fullDate: '2026-08-17', mandiPrice: 116.00, mandiMin: 102.00, mandiMax: 128.00, traderOffer: 91.00, agriChainNet: 126.00, arrivalVolumeQtl: 810 },
      { date: '19 Aug', fullDate: '2026-08-19', mandiPrice: 120.00, mandiMin: 106.00, mandiMax: 132.00, traderOffer: 95.00, agriChainNet: 131.00, arrivalVolumeQtl: 740 },
      { date: '21 Aug', fullDate: '2026-08-21', mandiPrice: 124.00, mandiMin: 110.00, mandiMax: 138.00, traderOffer: 99.00, agriChainNet: 135.00, arrivalVolumeQtl: 690 },
      { date: '23 Aug', fullDate: '2026-08-23', mandiPrice: 122.00, mandiMin: 108.00, mandiMax: 135.00, traderOffer: 97.00, agriChainNet: 133.00, arrivalVolumeQtl: 720 },
      { date: '25 Aug', fullDate: '2026-08-25', mandiPrice: 126.00, mandiMin: 112.00, mandiMax: 140.00, traderOffer: 101.00, agriChainNet: 138.00, arrivalVolumeQtl: 670 },
      { date: '27 Aug', fullDate: '2026-08-27', mandiPrice: 125.00, mandiMin: 110.00, mandiMax: 139.00, traderOffer: 100.00, agriChainNet: 137.00, arrivalVolumeQtl: 700 },
      { date: '29 Aug', fullDate: '2026-08-29', mandiPrice: 128.00, mandiMin: 114.00, mandiMax: 142.00, traderOffer: 103.00, agriChainNet: 140.00, arrivalVolumeQtl: 640 },
      { date: '31 Aug', fullDate: '2026-08-31', mandiPrice: 127.00, mandiMin: 112.00, mandiMax: 141.00, traderOffer: 102.00, agriChainNet: 139.00, arrivalVolumeQtl: 680 },
      { date: '02 Sep', fullDate: '2026-09-02', mandiPrice: 130.00, mandiMin: 116.00, mandiMax: 145.00, traderOffer: 105.00, agriChainNet: 142.00, arrivalVolumeQtl: 610 },
      { date: '04 Sep', fullDate: '2026-09-04', mandiPrice: 133.00, mandiMin: 118.00, mandiMax: 148.00, traderOffer: 108.00, agriChainNet: 145.00, arrivalVolumeQtl: 580 },
      { date: '06 Sep', fullDate: '2026-09-06', mandiPrice: 129.00, mandiMin: 115.00, mandiMax: 144.00, traderOffer: 104.00, agriChainNet: 141.00, arrivalVolumeQtl: 660 },
      { date: '08 Sep', fullDate: '2026-09-08', mandiPrice: 134.00, mandiMin: 120.00, mandiMax: 150.00, traderOffer: 109.00, agriChainNet: 146.00, arrivalVolumeQtl: 550 },
      { date: '10 Sep (Today)', fullDate: '2026-09-10', mandiPrice: 132.00, mandiMin: 118.00, mandiMax: 148.00, traderOffer: 108.00, agriChainNet: 144.50, arrivalVolumeQtl: 590 },
    ]
  }
};
