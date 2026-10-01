'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.myFarm': 'My Farm',
    'nav.cropLibrary': 'Crop Library',
    'nav.askAgriAgent': 'Ask AgriAgent',
    'nav.cropHealth': 'Crop Health',
    'nav.soil': 'Soil Health',
    'nav.weather': 'Weather',
    'nav.market': 'Market Prices',
    'nav.cropCalendar': 'Crop Calendar',

    // App header
    'app.title': 'AgriAgent',
    'app.tagline': 'AI Decision Support for Farmers',
    'app.hackathonBadge': 'BharatAgentic Hackathon',

    // Common UI
    'ui.viewDetails': 'View Technical Details',
    'ui.hideDetails': 'Hide Technical Details',
    'ui.loading': 'Analyzing Agronomic Data...',
    'ui.search': 'Search crops, diseases, or practices...',
    'ui.save': 'Save Changes',
    'ui.cancel': 'Cancel',
    'ui.back': 'Back',
    'ui.submit': 'Submit Query',

    // Home
    'home.greeting': 'Welcome back, Farmer Ramesh 👋',
    'home.subgreeting': 'Here is today’s AI agronomic summary for your farm in Thanjavur.',
    'home.todayAdviceTitle': 'Today’s AI Agronomic Advice',
    'home.myCropsTitle': 'Active Crops on Your Farm',
    'home.quickAskBanner': 'Need immediate advice on crop symptoms, fertilizer dosage, or pest management?',
    'home.quickAskBtn': 'Ask AgriAgent Now',

    // Sections
    'farm.title': 'My Farm Overview',
    'crops.title': 'Crop Knowledge Base',
    'ask.title': 'Ask AgriAgent AI Assistant',
    'health.title': 'Crop Disease Diagnosis',
    'soil.title': 'Soil Health & Fertility Dashboard',
    'weather.title': 'Agricultural Weather Forecast',
    'market.title': 'Mandi Prices & Trends',
    'calendar.title': 'Crop Growth Timeline & Stage Tasks',
  },
  ta: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.myFarm': 'என் பண்ணை',
    'nav.cropLibrary': 'பயிர் நூலகம்',
    'nav.askAgriAgent': 'அக்ரி ஏஜென்ட்டிடம் கேட்க',
    'nav.cropHealth': 'பயிர் ஆரோக்கியம்',
    'nav.soil': 'மண் வளம்',
    'nav.weather': 'வானிலை',
    'nav.market': 'சந்தை நிலவரம்',
    'nav.cropCalendar': 'பயிர் நாட்காட்டி',

    // App header
    'app.title': 'அக்ரி ஏஜென்ட்',
    'app.tagline': 'விவசாயிகளுக்கான செயற்கை நுண்ணறிவு வழிகாட்டி',
    'app.hackathonBadge': 'பாரத் ஏஜென்டிக் ஹேக்கத்தான்',

    // Common UI
    'ui.viewDetails': 'தொழில்நுட்ப விவரங்களை பார்க்க',
    'ui.hideDetails': 'விவரங்களை மறைக்க',
    'ui.loading': 'தரவுகள் பகுப்பாய்வு செய்யப்படுகிறது...',
    'ui.search': 'பயிர்கள், நோய்கள் அல்லது முறைகளைத் தேடுங்கள்...',
    'ui.save': 'சேமிக்க',
    'ui.cancel': 'ரத்து செய்',
    'ui.back': 'பின்செல்',
    'ui.submit': 'கேள்வியை அனுப்பவும்',

    // Home
    'home.greeting': 'வணக்கம், விவசாயி ரமேஷ் 👋',
    'home.subgreeting': 'தஞ்சாவூர் பண்ணைக்கான இன்றைய AI விவசாய அறிக்கை கீழே உள்ளது.',
    'home.todayAdviceTitle': 'இன்றைய AI விவசாய ஆலோசனை',
    'home.myCropsTitle': 'உங்கள் பண்ணையின் தற்போதைய பயிர்கள்',
    'home.quickAskBanner': 'பயிர் நோய், உர அளவு அல்லது பூச்சி கட்டுப்பாடு பற்றி உடனடி ஆலோசனை தேவையா?',
    'home.quickAskBtn': 'அக்ரி ஏஜென்ட்டிடம் கேட்கவும்',

    // Sections
    'farm.title': 'என் பண்ணை விபரங்கள்',
    'crops.title': 'பயிர் அறிவுக் களஞ்சியம்',
    'ask.title': 'அக்ரி ஏஜென்ட் AI உதவியாளர்',
    'health.title': 'பயிர் நோய் கண்டறிதல்',
    'soil.title': 'மண் வளப் பரிசோதனை அறிக்கை',
    'weather.title': 'வேளாண் வானிலை அறிக்கை',
    'market.title': 'சந்தை விலை & போக்குகள்',
    'calendar.title': 'பயிர் வளர்ச்சி காலக்கோடு',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('agriagent_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agriagent_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
