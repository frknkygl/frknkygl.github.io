// Font family names as they'll be registered with expo-font.
export const fontFamilies = {
  displayRegular: 'EBGaramond_600SemiBold',
  displayBold: 'EBGaramond_700Bold',
  body: 'BarlowCondensed_500Medium',
  bodyRegular: 'BarlowCondensed_400Regular',
  bodySemiBold: 'BarlowCondensed_600SemiBold',
  bodyBold: 'BarlowCondensed_700Bold',
} as const;

export const type = {
  displayHero: { fontFamily: fontFamilies.displayBold, fontSize: 32, lineHeight: 36, letterSpacing: 0.5 },
  headlineLg: { fontFamily: fontFamilies.displayBold, fontSize: 26, lineHeight: 30, letterSpacing: 0.3 },
  headlineMd: { fontFamily: fontFamilies.displayBold, fontSize: 21, lineHeight: 25, letterSpacing: 0.3 },
  headlineSm: { fontFamily: fontFamilies.displayRegular, fontSize: 18, lineHeight: 22, letterSpacing: 0.2 },
  titleTactical: { fontFamily: fontFamilies.bodyBold, fontSize: 16, lineHeight: 19, letterSpacing: 1.2 },
  statLg: { fontFamily: fontFamilies.bodyBold, fontSize: 26, lineHeight: 27, letterSpacing: 0.3 },
  statMd: { fontFamily: fontFamilies.bodyBold, fontSize: 18, lineHeight: 20, letterSpacing: 0.2 },
  bodyLg: { fontFamily: fontFamilies.body, fontSize: 15, lineHeight: 19, letterSpacing: 0.1 },
  bodyMd: { fontFamily: fontFamilies.bodyRegular, fontSize: 13, lineHeight: 17, letterSpacing: 0.1 },
  labelCaps: { fontFamily: fontFamilies.bodyBold, fontSize: 11, lineHeight: 13, letterSpacing: 1.4 },
  labelXs: { fontFamily: fontFamilies.bodySemiBold, fontSize: 9.5, lineHeight: 11, letterSpacing: 1 },
} as const;
