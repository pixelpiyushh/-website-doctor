import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hinglish';

export interface Translations {
  // Navigation
  navOverview: string;
  navMonitors: string;
  navAnalytics: string;
  navIncidents: string;
  navAlerts: string;
  navScanner: string;
  navAIDoctor: string;
  navSettings: string;
  navPlatform: string;
  
  // Navbar
  liveTelemetry: string;
  reconnecting: string;
  demoActive: string;
  demoMode: string;
  exitDemo: string;
  diagnoseBtn: string;
  langSelect: string;
  
  // Overview Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  platformOwner: string;
  targetWebsite: string;
  checkNowBtn: string;
  checkingStatus: string;
  
  // Vital Stat Cards
  statusTitle: string;
  statusOnline: string;
  statusDown: string;
  statusDegraded: string;
  statusHttpOk: string;
  
  responseTimeTitle: string;
  responseTimeUnit: string;
  responseTimeAvg: string;
  responseTimeP95: string;
  
  uptimeTitle: string;
  uptimeLast24h: string;
  uptimeLast30d: string;
  
  sslTitle: string;
  sslValid: string;
  sslExpiring: string;
  sslDaysLeft: string;
  
  // Health Score Ring
  healthScoreTitle: string;
  healthGrade: string;
  formulaBtn: string;
  catAvailability: string;
  catPerformance: string;
  catSecurity: string;
  catSEO: string;
  catTechnical: string;
  
  // Response Time Chart
  chartTitle: string;
  chartSubtitle: string;
  chartLiveStream: string;
  chartLiveOscilloscope: string;
  chartCurrent: string;
  chartAverage: string;
  chartP95: string;
  chartMinMax: string;
  
  // URL Checker & Scanner
  scannerBadge: string;
  scannerTitle: string;
  scannerSubtitle: string;
  scannerPlaceholder: string;
  scannerAnalyzeBtn: string;
  scannerAnalyzingBtn: string;
  scannerLiveProgress: string;
  
  // AI Doctor
  aiDoctorTitle: string;
  aiDoctorSubtitle: string;
  aiDoctorVerdict: string;
  aiDoctorProblems: string;
  aiDoctorRecommendations: string;
  aiDoctorRefresh: string;
  
  // Incidents & Alerts
  activeIncidentsTitle: string;
  noActiveIncidents: string;
  allSystemsNormal: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navOverview: 'Overview',
    navMonitors: 'Monitors',
    navAnalytics: 'Analytics',
    navIncidents: 'Incidents',
    navAlerts: 'Alerts',
    navScanner: 'Website Scanner',
    navAIDoctor: 'AI Doctor',
    navSettings: 'Settings',
    navPlatform: 'Platform',

    liveTelemetry: 'Live Real-time',
    reconnecting: 'Reconnecting...',
    demoActive: 'Demo Data Active',
    demoMode: 'Demo Mode',
    exitDemo: 'Exit Demo',
    diagnoseBtn: 'Diagnose URL',
    langSelect: 'Language',

    dashboardTitle: 'Website Doctor Dashboard',
    dashboardSubtitle: 'Real-time clinical telemetry, availability metrics, and automated website doctor diagnostics',
    platformOwner: 'Platform Owner:',
    targetWebsite: 'Target:',
    checkNowBtn: 'Check Now',
    checkingStatus: 'Probing...',

    statusTitle: 'Website Status',
    statusOnline: 'ONLINE',
    statusDown: 'DOWN',
    statusDegraded: 'DEGRADED',
    statusHttpOk: 'HTTP 200 OK',

    responseTimeTitle: 'Response Time',
    responseTimeUnit: 'ms',
    responseTimeAvg: 'Avg',
    responseTimeP95: 'P95',

    uptimeTitle: 'Rolling Uptime',
    uptimeLast24h: '24h',
    uptimeLast30d: '30d',

    sslTitle: 'SSL Certificate',
    sslValid: 'Valid',
    sslExpiring: 'Expiring Soon',
    sslDaysLeft: 'days remaining',

    healthScoreTitle: 'Website Health Score',
    healthGrade: 'GRADE',
    formulaBtn: 'Formula',
    catAvailability: 'Availability',
    catPerformance: 'Performance',
    catSecurity: 'Security',
    catSEO: 'SEO Health',
    catTechnical: 'Technical',

    chartTitle: 'Response Time & Latency Trends',
    chartSubtitle: 'High-precision end-to-end network latency waveform',
    chartLiveStream: 'LIVE STREAMING HEALTH CHECK',
    chartLiveOscilloscope: 'LIVE OSCILLOSCOPE ACTIVE',
    chartCurrent: 'Current Latency',
    chartAverage: 'Average',
    chartP95: 'P95 Latency',
    chartMinMax: 'Min / Max',

    scannerBadge: 'Instant Deep Clinical Scan',
    scannerTitle: 'Diagnose Any Website in Seconds',
    scannerSubtitle: 'Enter any public URL to execute live availability, SSL inspection, security header audits, and AI diagnosis.',
    scannerPlaceholder: 'https://yourwebsite.com',
    scannerAnalyzeBtn: 'Analyze',
    scannerAnalyzingBtn: 'Analyzing...',
    scannerLiveProgress: 'Conducting Live Telemetry & Clinical Scan on',

    aiDoctorTitle: 'AI Website Doctor',
    aiDoctorSubtitle: 'Intelligent clinical diagnostics, root cause synthesis, and prioritized remediation playbooks',
    aiDoctorVerdict: 'AI Doctor Clinical Verdict:',
    aiDoctorProblems: 'Detected Health Issues',
    aiDoctorRecommendations: 'Prescribed Actions',
    aiDoctorRefresh: 'Re-Analyze Website',

    activeIncidentsTitle: 'Active Incidents',
    noActiveIncidents: 'No active incidents detected.',
    allSystemsNormal: 'All monitored endpoints are operating within normal thresholds.',
  },

  hinglish: {
    navOverview: 'Overview (Dashboard)',
    navMonitors: 'Monitors (Websites)',
    navAnalytics: 'Analytics (Raftaar)',
    navIncidents: 'Incidents (Problems)',
    navAlerts: 'Alerts (Soochna)',
    navScanner: 'Website Scanner',
    navAIDoctor: 'AI Doctor (Ilaaj)',
    navSettings: 'Settings (Vyavastha)',
    navPlatform: 'Platform Menu',

    liveTelemetry: 'Live Telemetry Chalu Hai',
    reconnecting: 'Dobara Connect Ho Rha Hai...',
    demoActive: 'Demo Data Chalu Hai',
    demoMode: 'Demo Mode',
    exitDemo: 'Exit Demo',
    diagnoseBtn: 'Website Check Karo',
    langSelect: 'Bhasha',

    dashboardTitle: 'Website Doctor Dashboard',
    dashboardSubtitle: 'Real-time live telemetry, website ki health status, aur AI doctor ke actionable solutions',
    platformOwner: 'Platform Owner:',
    targetWebsite: 'Target Website:',
    checkNowBtn: 'Abhi Check Karo',
    checkingStatus: 'Check Ho Rha Hai...',

    statusTitle: 'Website Ki Halat (Status)',
    statusOnline: 'ONLINE (Mast Chal Rhi Hai)',
    statusDown: 'DOWN (Band Ho Gyi)',
    statusDegraded: 'DEGRADED (Slow Chal Rhi Hai)',
    statusHttpOk: 'HTTP 200 OK (Sab Theek Hai)',

    responseTimeTitle: 'Response Time (Raftaar)',
    responseTimeUnit: 'ms',
    responseTimeAvg: 'Average',
    responseTimeP95: 'P95 Latency',

    uptimeTitle: 'Uptime (Chalane Ka Record)',
    uptimeLast24h: 'Pichle 24 Ghante',
    uptimeLast30d: 'Pichle 30 Din',

    sslTitle: 'SSL Suraksha (Certificate)',
    sslValid: 'Valid (Surakshit)',
    sslExpiring: 'Jald Expire Hone Wala Hai',
    sslDaysLeft: 'din baaki hain',

    healthScoreTitle: 'Website Health Score',
    healthGrade: 'GRADE',
    formulaBtn: 'Formula Dekho',
    catAvailability: 'Availability (Uptime)',
    catPerformance: 'Performance (Speed)',
    catSecurity: 'Security (Suraksha)',
    catSEO: 'SEO Health',
    catTechnical: 'Technical Setup',

    chartTitle: 'Response Time Aur Speed Graph (Live)',
    chartSubtitle: 'High-precision network duration ka live moving waveform graph',
    chartLiveStream: 'LIVE WAVEFORM STREAM CHALU HAI',
    chartLiveOscilloscope: 'LIVE GRAPH RUNNING',
    chartCurrent: 'Abhi Ki Raftaar',
    chartAverage: 'Average Raftaar',
    chartP95: 'P95 Latency',
    chartMinMax: 'Kam / Jyada',

    scannerBadge: 'Instant Live Clinical Scan',
    scannerTitle: 'Kisi Bhi Website Ko Seconds Me Check Karo',
    scannerSubtitle: 'Koi bhi public URL paste karo aur availability, SSL expiry, security headers, aur AI diagnosis turant dekho.',
    scannerPlaceholder: 'https://aapkiwebsite.com',
    scannerAnalyzeBtn: 'Check Karo (Analyze)',
    scannerAnalyzingBtn: 'Check Ho Rha Hai...',
    scannerLiveProgress: 'Website Ka Live Health Check Chal Rha Hai:',

    aiDoctorTitle: 'AI Doctor Ka Prescription',
    aiDoctorSubtitle: 'Real telemetry data par aadharit clinical analysis aur step-by-step sudhar ke steps',
    aiDoctorVerdict: 'AI Doctor Ki Clinical Report:',
    aiDoctorProblems: 'Pata Chali Hui Kamiya (Issues)',
    aiDoctorRecommendations: 'Doctor Ki Salah (Actionable Steps)',
    aiDoctorRefresh: 'Dobara Check Karo',

    activeIncidentsTitle: 'Active Incidents (Downtime / Slowdowns)',
    noActiveIncidents: 'Koi incident active nahi hai.',
    allSystemsNormal: 'Aapki saari websites smoothly aur fast chal rahi hain!',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('website_doctor_lang');
    if (saved === 'hinglish' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('website_doctor_lang', lang);
    } catch {}
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
