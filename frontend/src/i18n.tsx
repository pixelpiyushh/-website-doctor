import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIDoctorDiagnosis } from './types';

export type Language = 'en' | 'hinglish';

export interface Translations {
  // Navigation
  navOverview: string;
  navMonitors: string;
  navFleet: string;
  navCompare: string;
  navBrokenLinks: string;
  navAnalytics: string;
  navIncidents: string;
  navAlerts: string;
  navScanner: string;
  navAIDoctor: string;
  navSettings: string;
  navPlatform: string;
  navHome: string;

  // Navbar
  liveTelemetry: string;
  reconnecting: string;
  demoActive: string;
  demoMode: string;
  exitDemo: string;
  diagnoseBtn: string;
  langSelect: string;
  ownerTitle: string;

  // Overview Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  platformOwner: string;
  targetWebsite: string;
  checkNowBtn: string;
  checkingStatus: string;
  compareScoreBtn: string;
  generatePdfReportBtn: string;

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
  sslExpired: string;
  sslDaysLeft: string;

  // Health Score Ring
  healthScoreTitle: string;
  healthGrade: string;
  formulaBtn: string;
  whyScoreBtn: string;
  catAvailability: string;
  catPerformance: string;
  catSecurity: string;
  catSEO: string;
  catTechnical: string;

  // Issue Priority System
  priorityAll: string;
  priorityCritical: string;
  priorityImportant: string;
  priorityGood: string;
  howToFixBtn: string;
  noIssuesFound: string;

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
  healthCertBtn: string;
  doctorRxBtn: string;

  // Scanner Tabs
  tabOverview: string;
  tabPrescription: string;
  tabChatbot: string;
  tabPerformance: string;
  tabSEO: string;
  tabSecurity: string;
  tabTechStack: string;
  tabPages: string;
  tabBrokenLinks: string;
  tabHistory: string;

  // AI Doctor View
  aiDoctorTitle: string;
  aiDoctorSubtitle: string;
  aiDoctorVerdict: string;
  aiDoctorProblems: string;
  aiDoctorRecommendations: string;
  aiDoctorRefresh: string;

  // AI Doctor Chatbot
  chatTitle: string;
  chatSubtitle: string;
  chatPlaceholder: string;
  chatSendBtn: string;
  chatTyping: string;
  chatClear: string;
  chatDisclaimer: string;

  // Website Comparison
  compareTitle: string;
  compareSubtitle: string;
  compareUrl1Placeholder: string;
  compareUrl2Placeholder: string;
  compareBtn: string;
  comparingBtn: string;
  winnerBadge: string;
  scoreDifference: string;
  metricOverallScore: string;
  metricResponseTime: string;
  metricTtfb: string;
  metricSeoScore: string;
  metricSecurityScore: string;
  metricTechCount: string;

  // Doctor Prescription Slip
  prescriptionTitle: string;
  clinicName: string;
  clinicReg: string;
  patientWebsite: string;
  diagnosisSummary: string;
  overallHealthScore: string;
  problemsFoundCount: string;
  criticalCount: string;
  recommendedActionsRx: string;
  clinicStamp: string;
  signedBy: string;
  printPrescriptionBtn: string;
  copyPrescriptionBtn: string;

  // Health Certificate
  certTitle: string;
  certSubtitle: string;
  certQualification: string;
  certSerial: string;
  certVerifiedSeal: string;
  certEmbedCode: string;
  certCopyEmbed: string;
  certPrintBtn: string;

  // Fix-It Guide Modal
  fixModalTitle: string;
  whyItMatters: string;
  resolutionSteps: string;
  codeSnippet: string;
  verifyFix: string;
  copySnippet: string;
  copiedSnippet: string;

  // Score Comparison (Before vs After)
  beforeAfterTitle: string;
  beforeScore: string;
  afterScore: string;
  scoreImprovement: string;
  resolvedFixesTitle: string;
  saveBaselineBtn: string;

  // Performance Audit
  perfTitle: string;
  perfSubtitle: string;
  ttfbCheck: string;
  largeImagesCheck: string;
  cachingCheck: string;
  compressionCheck: string;
  slowResourcesCheck: string;
  perfSuggestion: string;

  // Security Headers
  secTitle: string;
  secSubtitle: string;
  secPass: string;
  secWarning: string;
  secFail: string;
  secMissing: string;
  secConfigureHeader: string;

  // Technical SEO
  seoTitle: string;
  seoSubtitle: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoHeadingH1: string;
  seoXMLSitemap: string;
  seoRobotsTxt: string;
  seoImageAlt: string;
  seoMobileViewport: string;
  seoOpenGraph: string;

  // Page by Page Analysis
  pagesTitle: string;
  pagesSubtitle: string;
  pagesAddRoutePlaceholder: string;
  pagesAddRouteBtn: string;
  pagesColumnRoute: string;
  pagesColumnStatus: string;
  pagesColumnLatency: string;
  pagesColumnGrade: string;
  pagesColumnIssues: string;

  // Fleet Monitoring Dashboard
  fleetTitle: string;
  fleetSubtitle: string;
  fleetAddSiteBtn: string;
  fleetFilterAll: string;
  fleetFilterOnline: string;
  fleetFilterDegraded: string;
  fleetFilterDown: string;

  // Broken Links Scanner
  brokenLinksTitle: string;
  brokenLinksSubtitle: string;
  crawlLinksBtn: string;
  crawlingBtn: string;
  healthyLinks: string;
  redirectLinks: string;
  deadBrokenLinks: string;
  noBrokenLinksFound: string;

  // Report Download Modal
  reportModalTitle: string;
  reportDownloadPdf: string;
  reportPrint: string;
  reportExecutiveSummary: string;
  reportFivePillars: string;
  reportSecurityAudit: string;
  reportSeoAudit: string;
  reportPrescriptions: string;

  // Incidents & Alerts
  activeIncidentsTitle: string;
  noActiveIncidents: string;
  allSystemsNormal: string;

  // General Status & Alerts
  loading: string;
  errorGeneric: string;
  successSaved: string;
  tryAgain: string;
  backToHome: string;
  enterValidUrl: string;
  closeBtn: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navOverview: 'Overview',
    navMonitors: 'Monitors',
    navFleet: 'Fleet Dashboard 📡',
    navCompare: 'Website Compare 🆚',
    navBrokenLinks: 'Broken Links 🔗',
    navAnalytics: 'Analytics',
    navIncidents: 'Incidents',
    navAlerts: 'Alerts',
    navScanner: 'Website Scanner',
    navAIDoctor: 'AI Doctor',
    navSettings: 'Settings',
    navPlatform: 'Platform',
    navHome: 'Home',

    liveTelemetry: 'Live Real-time',
    reconnecting: 'Reconnecting...',
    demoActive: 'Demo Data Active',
    demoMode: 'Demo Mode',
    exitDemo: 'Exit Demo',
    diagnoseBtn: 'Diagnose URL',
    langSelect: 'Language',
    ownerTitle: 'Platform Owner',

    dashboardTitle: 'Website Doctor Dashboard',
    dashboardSubtitle: 'Real-time clinical telemetry, availability metrics, and automated website doctor diagnostics',
    platformOwner: 'Platform Owner:',
    targetWebsite: 'Target:',
    checkNowBtn: 'Check Now',
    checkingStatus: 'Probing...',
    compareScoreBtn: 'Compare (Before vs After)',
    generatePdfReportBtn: 'Generate PDF Report',

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
    sslExpired: 'Expired',
    sslDaysLeft: 'days remaining',

    healthScoreTitle: 'Website Health Score',
    healthGrade: 'GRADE',
    formulaBtn: 'Formula',
    whyScoreBtn: 'Why is my score',
    catAvailability: 'Availability',
    catPerformance: 'Performance',
    catSecurity: 'Security',
    catSEO: 'SEO Health',
    catTechnical: 'Technical',

    priorityAll: 'All Checks',
    priorityCritical: 'Critical Issues',
    priorityImportant: 'Important Fixes',
    priorityGood: 'Passing Checks',
    howToFixBtn: 'How to Fix 🛠️',
    noIssuesFound: 'No issues found in this category.',

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
    healthCertBtn: 'Health Certificate 🏆',
    doctorRxBtn: 'Doctor Prescription 🩺',

    tabOverview: 'Overview Diagnosis',
    tabPrescription: 'Prescription Slip 🩺',
    tabChatbot: 'AI Chatbot 🤖',
    tabPerformance: 'Performance ⚡',
    tabSEO: 'Technical SEO 🔎',
    tabSecurity: 'Security Headers 🔐',
    tabTechStack: 'Tech Stack 💻',
    tabPages: 'Pages Scan 📄',
    tabBrokenLinks: 'Broken Links 🔗',
    tabHistory: 'Score History 📊',

    aiDoctorTitle: 'AI Website Doctor',
    aiDoctorSubtitle: 'Intelligent clinical diagnostics, root cause synthesis, and prioritized remediation playbooks',
    aiDoctorVerdict: 'AI Doctor Clinical Verdict:',
    aiDoctorProblems: 'Detected Health Issues',
    aiDoctorRecommendations: 'Prescribed Actions',
    aiDoctorRefresh: 'Re-Analyze Website',

    chatTitle: 'AI Doctor Consultation Chat',
    chatSubtitle: 'Ask real-time questions about your website diagnostics, performance bottlenecks, and SEO solutions.',
    chatPlaceholder: 'Ask AI Doctor anything (e.g. Why is my website slow?)...',
    chatSendBtn: 'Send Message',
    chatTyping: 'AI Doctor is formulating diagnosis...',
    chatClear: 'Clear Chat',
    chatDisclaimer: 'AI Doctor uses factual telemetry gathered during the latest diagnostic probe.',

    compareTitle: 'Website Comparison (Head-to-Head 🆚)',
    compareSubtitle: 'Benchmark two website URLs side-by-side on Performance, SEO, Security, and Overall Health.',
    compareUrl1Placeholder: 'https://site-a.com',
    compareUrl2Placeholder: 'https://site-b.com',
    compareBtn: 'Compare Websites',
    comparingBtn: 'Running Dual Audit...',
    winnerBadge: 'WINNER',
    scoreDifference: 'Score Difference',
    metricOverallScore: 'Overall Health Score',
    metricResponseTime: 'Response Time (Latency)',
    metricTtfb: 'Time to First Byte (TTFB)',
    metricSeoScore: 'Technical SEO Score',
    metricSecurityScore: 'Security Posture Score',
    metricTechCount: 'Detected Technologies',

    prescriptionTitle: 'Clinical Rx Prescription Slip',
    clinicName: 'Website Doctor Health Clinic',
    clinicReg: 'Official Reg # WD-CLINIC-2026-994',
    patientWebsite: 'Patient Website',
    diagnosisSummary: 'Website Diagnosis',
    overallHealthScore: 'Overall Health',
    problemsFoundCount: 'Problems Found',
    criticalCount: 'Critical',
    recommendedActionsRx: 'Recommended Actions (Rx):',
    clinicStamp: 'OFFICIALLY VERIFIED CLINIC STAMP',
    signedBy: 'Prescribed & Signed by',
    printPrescriptionBtn: 'Print Prescription (Rx)',
    copyPrescriptionBtn: 'Copy Prescription Summary',

    certTitle: 'Website Health Certified',
    certSubtitle: 'Digital Certificate of Web Health & Performance Excellence',
    certQualification: 'Officially awarded to websites achieving a score of 90+ out of 100.',
    certSerial: 'Certificate Verification Serial',
    certVerifiedSeal: 'OFFICIAL 90+ CERTIFIED SEAL',
    certEmbedCode: 'Copy Website Badge HTML for Your Footer',
    certCopyEmbed: 'Copy Badge Code',
    certPrintBtn: 'Print / Save PDF Certificate',

    fixModalTitle: 'Fix-It Resolution Guide',
    whyItMatters: 'Why This Matters',
    resolutionSteps: 'Step-by-Step Resolution',
    codeSnippet: 'Recommended Configuration Snippet',
    verifyFix: 'How to Verify Your Fix',
    copySnippet: 'Copy Snippet',
    copiedSnippet: 'Copied to Clipboard!',

    beforeAfterTitle: 'Score Comparison (Before vs After)',
    beforeScore: 'Baseline Score',
    afterScore: 'Current Score',
    scoreImprovement: 'Score Improvement',
    resolvedFixesTitle: 'Resolved Optimizations Impact',
    saveBaselineBtn: 'Save Current as New Baseline',

    perfTitle: 'Performance & Speed Recommendations',
    perfSubtitle: 'Actionable remedies for TTFB, resource weight, caching, and compression',
    ttfbCheck: 'Time To First Byte (TTFB)',
    largeImagesCheck: 'Large & Unoptimized Images',
    cachingCheck: 'Browser Cache Headers',
    compressionCheck: 'HTTP Compression (Gzip / Brotli)',
    slowResourcesCheck: 'Render-Blocking Resources',
    perfSuggestion: 'Suggestion',

    secTitle: 'Security Header Checker',
    secSubtitle: 'Browser exploit defense, HSTS, CSP, and clickjacking protection audits',
    secPass: 'PASS',
    secWarning: 'WARNING',
    secFail: 'FAIL',
    secMissing: 'MISSING',
    secConfigureHeader: 'How to configure this header',

    seoTitle: 'Technical SEO Health Audit',
    seoSubtitle: 'Search engine crawler readiness, metadata, headings, and discoverability',
    seoMetaTitle: 'Page Title (<title>)',
    seoMetaDescription: 'Meta Description Tag',
    seoHeadingH1: 'Single Primary Heading (<h1>)',
    seoXMLSitemap: 'XML Sitemap Availability',
    seoRobotsTxt: 'Robots.txt Crawler Rules',
    seoImageAlt: 'Image Alt Text Accessibility',
    seoMobileViewport: 'Mobile Viewport Meta Tag',
    seoOpenGraph: 'OpenGraph Social Preview Tags',

    pagesTitle: 'Page-by-Page Health Analysis',
    pagesSubtitle: 'Audit internal routes beyond the homepage to discover subpage latency & errors',
    pagesAddRoutePlaceholder: 'E.g. /features or /pricing',
    pagesAddRouteBtn: 'Scan Route',
    pagesColumnRoute: 'Route Path',
    pagesColumnStatus: 'HTTP Status',
    pagesColumnLatency: 'Latency',
    pagesColumnGrade: 'Health Grade',
    pagesColumnIssues: 'Issues',

    fleetTitle: 'Fleet Monitoring Dashboard',
    fleetSubtitle: 'Real-time pulse across all monitored web properties',
    fleetAddSiteBtn: 'Add Website to Fleet',
    fleetFilterAll: 'All Sites',
    fleetFilterOnline: 'Operational Only',
    fleetFilterDegraded: 'Degraded',
    fleetFilterDown: 'Down / Failing',

    brokenLinksTitle: 'Broken Links Scanner',
    brokenLinksSubtitle: 'Multi-anchor crawler scanning internal and external hyperlinked pages',
    crawlLinksBtn: 'Scan Page Links',
    crawlingBtn: 'Crawling Links...',
    healthyLinks: 'Healthy (200 OK)',
    redirectLinks: 'Redirects (301/302)',
    deadBrokenLinks: 'Broken (404/500)',
    noBrokenLinksFound: 'No broken links detected on this page! All anchor targets are valid.',

    reportModalTitle: 'Executive Clinical PDF Report',
    reportDownloadPdf: 'Download Executive Report',
    reportPrint: 'Print Report',
    reportExecutiveSummary: 'Executive Clinical Summary',
    reportFivePillars: 'Five Core Health Pillars Breakdown',
    reportSecurityAudit: 'Security Posture Audit',
    reportSeoAudit: 'Search Discoverability Checklist',
    reportPrescriptions: 'Prescribed Remediations',

    activeIncidentsTitle: 'Active Incidents',
    noActiveIncidents: 'No active incidents detected.',
    allSystemsNormal: 'All monitored endpoints are operating within normal thresholds.',

    loading: 'Loading...',
    errorGeneric: 'An unexpected error occurred. Please try again.',
    successSaved: 'Saved successfully!',
    tryAgain: 'Try Again',
    backToHome: 'Back to Home',
    enterValidUrl: 'Please enter a valid website URL (e.g. https://example.com)',
    closeBtn: 'Close',
  },

  hinglish: {
    navOverview: 'Overview (Dashboard)',
    navMonitors: 'Monitors (Websites)',
    navFleet: 'Fleet Dashboard 📡',
    navCompare: 'Website Compare 🆚',
    navBrokenLinks: 'Broken Links Scanner 🔗',
    navAnalytics: 'Analytics (Raftaar)',
    navIncidents: 'Incidents (Problems)',
    navAlerts: 'Alerts (Soochna)',
    navScanner: 'Website Scanner',
    navAIDoctor: 'AI Doctor (Ilaaj)',
    navSettings: 'Settings (Vyavastha)',
    navPlatform: 'Platform Menu',
    navHome: 'Homepage',

    liveTelemetry: 'Live Telemetry Chalu Hai',
    reconnecting: 'Dobara Connect Ho Rha Hai...',
    demoActive: 'Demo Data Chalu Hai',
    demoMode: 'Demo Mode',
    exitDemo: 'Exit Demo',
    diagnoseBtn: 'Website Check Karo',
    langSelect: 'Bhasha',
    ownerTitle: 'Platform Owner',

    dashboardTitle: 'Website Doctor Dashboard',
    dashboardSubtitle: 'Real-time live telemetry, website ki health status, aur AI doctor ke actionable solutions',
    platformOwner: 'Platform Owner:',
    targetWebsite: 'Target Website:',
    checkNowBtn: 'Abhi Check Karo',
    checkingStatus: 'Check Ho Rha Hai...',
    compareScoreBtn: 'Score Compare (Pehle vs Abhi)',
    generatePdfReportBtn: 'PDF Report Generate Karo',

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
    sslExpired: 'Expire Ho Chuka Hai',
    sslDaysLeft: 'din baaki hain',

    healthScoreTitle: 'Website Health Score',
    healthGrade: 'GRADE',
    formulaBtn: 'Formula Dekho',
    whyScoreBtn: 'Mera score kyu hai',
    catAvailability: 'Availability (Uptime)',
    catPerformance: 'Performance (Speed)',
    catSecurity: 'Security (Suraksha)',
    catSEO: 'SEO Health',
    catTechnical: 'Technical Setup',

    priorityAll: 'Saare Checks',
    priorityCritical: '🔴 Critical (G गंभीर)',
    priorityImportant: '🟠 Important (Zaroori)',
    priorityGood: '🟢 Good (Theek Hai)',
    howToFixBtn: 'Kaise Fix Karein 🛠️',
    noIssuesFound: 'Is category me koi problem nahi mili.',

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
    healthCertBtn: 'Health Certificate 🏆',
    doctorRxBtn: 'Doctor Prescription 🩺',

    tabOverview: 'Clinical Diagnosis',
    tabPrescription: 'Prescription Parcha 🩺',
    tabChatbot: 'AI Doctor Chat 🤖',
    tabPerformance: 'Performance (Speed) ⚡',
    tabSEO: 'Technical SEO 🔎',
    tabSecurity: 'Security Headers 🔐',
    tabTechStack: 'Tech Stack 💻',
    tabPages: 'Pages Scan 📄',
    tabBrokenLinks: 'Broken Links 🔗',
    tabHistory: 'Score History 📊',

    aiDoctorTitle: 'AI Doctor Ka Prescription',
    aiDoctorSubtitle: 'Real telemetry data par aadharit clinical analysis aur step-by-step sudhar ke steps',
    aiDoctorVerdict: 'AI Doctor Ki Clinical Report:',
    aiDoctorProblems: 'Pata Chali Hui Kamiya (Issues)',
    aiDoctorRecommendations: 'Doctor Ki Salah (Actionable Steps)',
    aiDoctorRefresh: 'Dobara Check Karo',

    chatTitle: 'AI Doctor Se Baat Karo (Chatbot)',
    chatSubtitle: 'Apni website ki speed, SEO, aur security se jude sawal poochiye — AI live data dekhkar solution batayega.',
    chatPlaceholder: 'AI Doctor se kuch bhi poochiye (e.g. Meri website slow kyun hai?)...',
    chatSendBtn: 'Bhejo',
    chatTyping: 'AI Doctor ilaaj soch raha hai...',
    chatClear: 'Chat Clear Karein',
    chatDisclaimer: 'AI Doctor live test results ke aadhar par advice deta hai.',

    compareTitle: 'Website Comparison (Aamne-Saamne 🆚)',
    compareSubtitle: 'Do websites ke URLs daalkar unka Speed, SEO, Security, aur Health Score compare karein.',
    compareUrl1Placeholder: 'https://site-a.com',
    compareUrl2Placeholder: 'https://site-b.com',
    compareBtn: 'Compare Karo',
    comparingBtn: 'Dono Sites Check Ho Rahi Hain...',
    winnerBadge: 'WINNER 🏆',
    scoreDifference: 'Score Ka Antar',
    metricOverallScore: 'Overall Health Score',
    metricResponseTime: 'Response Time (Raftaar)',
    metricTtfb: 'Time to First Byte (TTFB)',
    metricSeoScore: 'Technical SEO Score',
    metricSecurityScore: 'Security Posture Score',
    metricTechCount: 'Detected Technologies',

    prescriptionTitle: 'Doctor Ka Clinical Prescription Slip',
    clinicName: 'Website Doctor Health Clinic',
    clinicReg: 'Official Reg # WD-CLINIC-2026-994',
    patientWebsite: 'Website (Mareez)',
    diagnosisSummary: '🩺 Website Diagnosis Summary',
    overallHealthScore: 'Overall Health Score',
    problemsFoundCount: 'Problems Found (Kamiya)',
    criticalCount: 'Critical Issues',
    recommendedActionsRx: 'Doctor Ki Salah (Recommended Actions Rx):',
    clinicStamp: 'OFFICIALLY VERIFIED CLINIC MOHAR',
    signedBy: 'Prescribe & Sign Kiya Gaya',
    printPrescriptionBtn: 'Prescription Print Karein (Rx)',
    copyPrescriptionBtn: 'Prescription Copy Karein',

    certTitle: 'Website Health Certified 🏆',
    certSubtitle: 'High Performance Aur Behtar Health Ka Digital Certificate',
    certQualification: 'Sirf unhi websites ko milta hai jinka score 90+ out of 100 ho.',
    certSerial: 'Certificate Verification Number',
    certVerifiedSeal: '90+ HEALTH CERTIFIED SEAL',
    certEmbedCode: 'Website ke Footer Me Lagane Ke Liye HTML Code',
    certCopyEmbed: 'Badge Code Copy Karein',
    certPrintBtn: 'Certificate Print / Save PDF',

    fixModalTitle: 'Problem Fix Karne Ki Guide 🛠️',
    whyItMatters: 'Ye Problem Kyun Zaroori Hai?',
    resolutionSteps: 'Step-by-Step Kaise Theek Karein:',
    codeSnippet: 'Ready-to-use Code / Configuration:',
    verifyFix: 'Fix Check Kaise Karein:',
    copySnippet: 'Code Copy Karein',
    copiedSnippet: 'Code Copy Ho Gaya!',

    beforeAfterTitle: 'Score Comparison (Pehle vs Abhi)',
    beforeScore: 'Pehle Ka Score',
    afterScore: 'Abhi Ka Score',
    scoreImprovement: 'Score Me Sudhar',
    resolvedFixesTitle: 'Theek Kiye Gaye Fixes Ka Asar',
    saveBaselineBtn: 'Is Score Ko Baseline Save Karein',

    perfTitle: 'Speed Aur Performance Sudharne Ke Tarike',
    perfSubtitle: 'TTFB, uncompressed images, caching aur compression ke actionable solutions',
    ttfbCheck: 'Server Response Time (TTFB)',
    largeImagesCheck: 'Badi Aur Uncompressed Images',
    cachingCheck: 'Browser Cache-Control Headers',
    compressionCheck: 'Gzip / Brotli Compression',
    slowResourcesCheck: 'Render-Blocking CSS/JS Files',
    perfSuggestion: 'Doctor Ki Salah',

    secTitle: 'Security Headers Checker 🔐',
    secSubtitle: 'Clickjacking, XSS aur browser security headers ki live jaanch',
    secPass: 'PASS (Theek Hai)',
    secWarning: 'WARNING (Dhyan De)',
    secFail: 'FAIL (Khatra)',
    secMissing: 'MISSING (Nahi Mila)',
    secConfigureHeader: 'Is header ko kaise lagayein',

    seoTitle: 'Technical SEO Checklist 🔎',
    seoSubtitle: 'Google search rankings, metadata, headings aur sitemap ki jankari',
    seoMetaTitle: 'Page Title (<title> Tag)',
    seoMetaDescription: 'Meta Description Tag',
    seoHeadingH1: 'Main Heading (Sirf Ek <h1> Tag)',
    seoXMLSitemap: 'XML Sitemap (/sitemap.xml)',
    seoRobotsTxt: 'Robots.txt Crawler File',
    seoImageAlt: 'Images Ka Alt Text Tag',
    seoMobileViewport: 'Mobile Friendly Viewport Tag',
    seoOpenGraph: 'Social Share (OpenGraph Tags)',

    pagesTitle: 'Page-by-Page Analysis 📄',
    pagesSubtitle: 'Homepage ke alawa website ke individual routes ka response time aur health check',
    pagesAddRoutePlaceholder: 'Jaise /about ya /pricing',
    pagesAddRouteBtn: 'Page Check Karo',
    pagesColumnRoute: 'Route Path',
    pagesColumnStatus: 'HTTP Status',
    pagesColumnLatency: 'Raftaar',
    pagesColumnGrade: 'Grade',
    pagesColumnIssues: 'Issues',

    fleetTitle: 'Fleet Monitoring Dashboard 📡',
    fleetSubtitle: 'Aapki saari websites ka real-time live status ek jagah',
    fleetAddSiteBtn: 'Nayi Website Add Karein',
    fleetFilterAll: 'Saari Websites',
    fleetFilterOnline: 'Online Sites',
    fleetFilterDegraded: 'Slow Sites',
    fleetFilterDown: 'Band / Down Sites',

    brokenLinksTitle: 'Broken Links Scanner 🔗',
    brokenLinksSubtitle: 'Website ke saare hyperlinks scan karke 404 dead links find karein',
    crawlLinksBtn: 'Links Scan Karein',
    crawlingBtn: 'Links Scan Ho Rahe Hain...',
    healthyLinks: 'Healthy Links (200 OK)',
    redirectLinks: 'Redirect Links (301/302)',
    deadBrokenLinks: 'Broken Dead Links (404/500)',
    noBrokenLinksFound: 'Badhai ho! Is page par koi broken link nahi mila, saare links sahi chal rahe hain.',

    reportModalTitle: 'Executive Clinical PDF Report 📄',
    reportDownloadPdf: 'PDF Report Download Karein',
    reportPrint: 'Report Print Karein',
    reportExecutiveSummary: 'Executive Clinical Summary',
    reportFivePillars: 'Panch Core Health Pillars Ka Score',
    reportSecurityAudit: 'Security Posture Ki Report',
    reportSeoAudit: 'Google Search Discoverability Report',
    reportPrescriptions: 'Doctor Ke Diye Gaye Actionable Steps',

    activeIncidentsTitle: 'Active Incidents (Downtime / Slowdowns)',
    noActiveIncidents: 'Koi incident active nahi hai.',
    allSystemsNormal: 'Aapki saari websites smoothly aur fast chal rahi hain!',

    loading: 'Loading Ho Raha Hai...',
    errorGeneric: 'Kuch gadbad ho gayi. Kripya dobara koshish karein.',
    successSaved: 'Safalta-purvak save ho gaya!',
    tryAgain: 'Dobara Koshish Karein',
    backToHome: 'Home Par Jayein',
    enterValidUrl: 'Kripya ek valid website URL dalein (jaise https://example.com)',
    closeBtn: 'Band Karein',
  },
};

/**
 * Dynamic problem translation mapper for switching language on already-scanned results
 */
export function translateProblem(
  problem: { id: string; title: string; description: string; measuredFact: string; severity: string },
  language: Language
): { title: string; description: string } {
  if (language === 'en') {
    return { title: problem.title, description: problem.description };
  }

  const id = problem.id.toLowerCase();
  const t = problem.title.toLowerCase();

  if (id.includes('down') || t.includes('offline')) {
    return {
      title: 'Website Offline Hai Ya Server Error De Rahi Hai',
      description: `Tumhari website health check mein fail ho gayi hai (${problem.measuredFact}). Web server service check karein.`,
    };
  }
  if (id.includes('latency') || t.includes('latency') || t.includes('response')) {
    return {
      title: 'Website Ka Response Time Slow Hai (High Latency)',
      description: `Tumhari website ka response time slow (${problem.measuredFact}) measure hua hai. Database queries aur caching optimize karein.`,
    };
  }
  if (id.includes('ssl-expired') || t.includes('expired')) {
    return {
      title: 'SSL Certificate Expire Ho Chuka Hai',
      description: `Tumhara SSL certificate expire ho chuka hai. Visitors ko browser warnings dikhegi. Turant renew karein.`,
    };
  }
  if (id.includes('ssl-expiring') || t.includes('expiring')) {
    return {
      title: 'SSL Certificate Jald Expire Hone Wala Hai',
      description: `Tumhara SSL certificate expire hone wala hai (${problem.measuredFact}). Auto-renewal verify karein.`,
    };
  }
  if (id.includes('redirect') || t.includes('redirect')) {
    return {
      title: 'HTTP Se HTTPS Auto-Redirect Missing Hai',
      description: 'Requests unencrypted http:// se https:// par automatically redirect nahi ho rahi hain.',
    };
  }
  if (id.includes('headers') || t.includes('headers')) {
    return {
      title: 'Zaroori Security Headers Missing Hain',
      description: 'HSTS, CSP, aur X-Frame-Options headers server par missing hain. Inhe add karein.',
    };
  }
  if (id.includes('broken') || t.includes('broken')) {
    return {
      title: 'Broken Links Pata Chale Hain',
      description: `Website par dead hyperlinks (${problem.measuredFact}) mile hain jo visitors ko error dikha rahe hain.`,
    };
  }
  if (id.includes('seo') || t.includes('seo')) {
    return {
      title: 'SEO Metadata Mein Kamiya Mili Hain',
      description: 'Title, meta description ya headings miss ho rahi hain jisse Google ranking par asar padta hai.',
    };
  }

  return { title: problem.title, description: problem.description };
}

/**
 * Dynamic action translation mapper for switching language on already-scanned results
 */
export function translateAction(
  action: { id: string; title: string; rationale: string },
  language: Language
): { title: string; rationale: string } {
  if (language === 'en') {
    return { title: action.title, rationale: action.rationale };
  }

  const t = action.title.toLowerCase();

  if (t.includes('log') || t.includes('server')) {
    return {
      title: 'Web Server Aur Application Error Logs Check Karein',
      rationale: 'Check karein ki origin service (Node, Nginx, PHP) chal rahi hai aur application error logs inspect karein.',
    };
  }
  if (t.includes('caching') || t.includes('database') || t.includes('edge')) {
    return {
      title: 'Edge CDN Caching Enable Karein Aur Queries Optimize Karein',
      rationale: 'Slow database queries aur render time kam karne ke liye Edge CDN lagayein.',
    };
  }
  if (t.includes('renew') || t.includes('ssl')) {
    return {
      title: 'SSL Certificate Ko Turant Renew Karein',
      rationale: 'Expired ya expiring certificate ko reload karein taaki HTTPS safely chalta rahe.',
    };
  }
  if (t.includes('security') || t.includes('header')) {
    return {
      title: 'Standard Security Headers Server Config Mein Add Karein',
      rationale: 'HSTS, X-Content-Type-Options aur X-Frame-Options browser-level vulnerabilities ko block karte hain.',
    };
  }
  if (t.includes('broken') || t.includes('anchor') || t.includes('link')) {
    return {
      title: 'Broken Anchor Links Ko Fix Ya Redirect Karein',
      rationale: 'Dead links repair karne se user experience aur crawl health dono behtar hoti hain.',
    };
  }
  if (t.includes('seo') || t.includes('meta') || t.includes('tag')) {
    return {
      title: 'Missing SEO Tags (<title>, <meta description>, <h1>) Add Karein',
      rationale: 'Zaroori metadata hone se Google search results aur social shares par CTR boost hota hai.',
    };
  }

  return { title: action.title, rationale: action.rationale };
}

/**
 * Dynamic diagnosis mapper: picks bilingual translation if available, or dynamically localizes
 */
export function getLocalizedDiagnosis(
  diagnosis: AIDoctorDiagnosis | undefined,
  language: Language
): AIDoctorDiagnosis | undefined {
  if (!diagnosis) return undefined;

  // 1. If backend returned explicit translations, use the exact match
  if (diagnosis.translations && diagnosis.translations[language]) {
    const matched = diagnosis.translations[language];
    return {
      ...diagnosis,
      headline: matched.headline,
      clinicalAssessment: matched.clinicalAssessment,
      vitalSigns: matched.vitalSigns,
      problemsDetected: matched.problemsDetected,
      recommendedActions: matched.recommendedActions,
    };
  }

  // 2. If already in requested language or no translations property, dynamically localize
  if (language === 'hinglish') {
    return {
      ...diagnosis,
      headline: diagnosis.headline.includes('Alert') || diagnosis.headline.includes('Offline')
        ? 'Critical Alert: Website Abhi Offline Hai'
        : diagnosis.headline.includes('Urgent')
        ? 'Emergency Ilaaj Ki Zaroorat: Serious Issues Detect Hue'
        : diagnosis.headline.includes('Operational')
        ? 'Chal Rahi Hai Lekin Warnings Hain: Performance Ya Setup Gaps'
        : 'Website Healthy Hai — Chhote Optimizations Kar Sakte Hain',
      clinicalAssessment: diagnosis.clinicalAssessment.includes('unreachable')
        ? 'Tumhari website unreachable hai. Incoming traffic disrupt ho raha hai. Origin service ya DNS turant check karein.'
        : `Tumhari website abhi online hai aur achhi tarah response de rahi hai. Doctor ke recommended steps follow karke score ko aur badhayein.`,
      problemsDetected: diagnosis.problemsDetected.map((p) => {
        const tr = translateProblem(p, 'hinglish');
        return { ...p, title: tr.title, description: tr.description };
      }),
      recommendedActions: diagnosis.recommendedActions.map((a) => {
        const tr = translateAction(a, 'hinglish');
        return { ...a, title: tr.title, rationale: tr.rationale };
      }),
    };
  }

  return diagnosis;
}

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
