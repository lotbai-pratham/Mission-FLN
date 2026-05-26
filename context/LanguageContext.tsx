"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'Dashboards': 'Dashboards',
    'Implementation Corner': 'Implementation Corner',
    'Students': 'Students',
    'Upload': 'Upload',
    'Users': 'Users',
    'Data': 'Data',
    'Logins': 'Logins',
    'Record Score': 'Record Score',
    'Sign In': 'Sign In',
    'Sign Out': 'Sign Out',
    // Dashboard
    'FLN Impact Dashboard': 'FLN Impact Dashboard',
    'Real-time state and division progress tracking towards NIPUN Bharat Mission targets.': 'Real-time state and division progress tracking towards NIPUN Bharat Mission targets.',
    'Select Division': 'Select Division',
    'Select Project Office': 'Select Project Office',
    'Select School': 'Select School',
    'NIPUN Bharat Mission': 'NIPUN Bharat Mission',
    'The NIPUN Bharat Mission targets 100% foundational literacy and numeracy proficiency for all grade-level students. We monitor student progress through targeted baseline and endline assessments to bridge the learning gap.': 'The NIPUN Bharat Mission targets 100% foundational literacy and numeracy proficiency for all grade-level students. We monitor student progress through targeted baseline and endline assessments to bridge the learning gap.',
    'Literacy (L4 Story Reading)': 'Literacy (L4 Story Reading)',
    'Numeracy (L3 Division)': 'Numeracy (L3 Division)',
    'Current Level': 'Current Level',
    'Target': 'Target',
    'Total Assessments': 'Total Assessments',
    'Total Students': 'Total Students',
    'Arena Engagement': 'Arena Engagement',
    'Single Games': 'Single Games',
    'Target Tracking': 'Target Tracking',
    'Growth Velocity': 'Growth Velocity',
    'Engagement Metrics': 'Engagement Metrics',
    'Pedagogy Coverage': 'Pedagogy Coverage',
    'Division Rank': 'Division Rank',
    'Division': 'Division',
    'Proficiency': 'Proficiency',
    'Assessments': 'Assessments',
    'Status': 'Status',
    'Growth Over Time': 'Growth Over Time',
    'Progress timeline showing baseline vs midline vs endline outcomes.': 'Progress timeline showing baseline vs midline vs endline outcomes.',
    'All Divisions': 'All Divisions',
    'All Project Offices': 'All Project Offices',
    'All Schools': 'All Schools',
    'All Terms': 'All Terms',
    'Filters': 'Filters',
    'Detailed Breakdown': 'Detailed Breakdown',
    'Level': 'Level',
    'Showing page': 'Showing page',
    'of': 'of',
    'records': 'records',
    // Students / Roster
    'Search student...': 'Search student...',
    'Class': 'Class',
    'Gender': 'Gender',
    'Age': 'Age',
    'School': 'School',
    'Actions': 'Actions',
    'Add Student': 'Add Student',
    'No students found.': 'No students found.',
    'Active Students': 'Active Students',
    'List of all registered students and their status.': 'List of all registered students and their status.',
    'Female': 'Female',
    'Male': 'Male',
    // Resources
    'Interactive Simulations': 'Interactive Simulations',
    'Hands-on simulations, games and learning pathways to master FLN concepts.': 'Hands-on simulations, games and learning pathways to master FLN concepts.',
    'Session Planner': 'Session Planner',
    'Pedagogy Videos': 'Pedagogy Videos',
    'Articles': 'Articles',
    'Filter by Subject': 'Filter by Subject',
    'All Subjects': 'All Subjects',
    'Language': 'Language',
    'Maths': 'Maths',
    'Play Game': 'Play Game',
    'Start Competition': 'Start Competition',
  },
  hi: {
    // Navbar
    'Dashboards': 'डैशबोर्ड',
    'Implementation Corner': 'कार्यान्वयन कोना',
    'Students': 'छात्र',
    'Upload': 'अपलोड',
    'Users': 'उपयोगकर्ता',
    'Data': 'डेटा',
    'Logins': 'लॉगिन',
    'Record Score': 'स्कोर दर्ज करें',
    'Sign In': 'साइन इन करें',
    'Sign Out': 'साइन आउट करें',
    // Dashboard
    'FLN Impact Dashboard': 'FLN प्रभाव डैशबोर्ड',
    'Real-time state and division progress tracking towards NIPUN Bharat Mission targets.': 'निपुण भारत मिशन लक्ष्यों की ओर वास्तविक समय राज्य और डिवीजन प्रगति ट्रैकिंग।',
    'Select Division': 'डिवीजन चुनें',
    'Select Project Office': 'परियोजना कार्यालय चुनें',
    'Select School': 'स्कूल चुनें',
    'NIPUN Bharat Mission': 'निपुण भारत मिशन',
    'The NIPUN Bharat Mission targets 100% foundational literacy and numeracy proficiency for all grade-level students. We monitor student progress through targeted baseline and endline assessments to bridge the learning gap.': 'निपुण भारत मिशन सभी ग्रेड-स्तर के छात्रों के लिए 100% बुनियादी साक्षरता और संख्यात्मकता प्रवीणता का लक्ष्य रखता है। हम सीखने के अंतर को पाटने के लिए लक्षित बेसलाइन और एंडलाइन मूल्यांकनों के माध्यम से छात्र प्रगति की निगरानी करते हैं।',
    'Literacy (L4 Story Reading)': 'साक्षरता (L4 कहानी पढ़ना)',
    'Numeracy (L3 Division)': 'संख्यात्मकता (L3 विभाजन)',
    'Current Level': 'वर्तमान स्तर',
    'Target': 'लक्ष्य',
    'Total Assessments': 'कुल मूल्यांकन',
    'Total Students': 'कुल छात्र',
    'Arena Engagement': 'अखाड़ा जुड़ाव',
    'Single Games': 'सिंगल गेम्स',
    'Target Tracking': 'लक्ष्य ट्रैकिंग',
    'Growth Velocity': 'विकास वेग',
    'Engagement Metrics': 'जुड़ाव मेट्रिक्स',
    'Pedagogy Coverage': 'शिक्षाशास्त्र कवरेज',
    'Division Rank': 'डिवीजन रैंक',
    'Division': 'डिवीजन',
    'Proficiency': 'प्रवीणता',
    'Assessments': 'मूल्यांकन',
    'Status': 'स्थिति',
    'Growth Over Time': 'समय के साथ विकास',
    'Progress timeline showing baseline vs midline vs endline outcomes.': 'बेसलाइन बनाम मिडलाइन बनाम एंडलाइन परिणामों को दर्शाने वाली प्रगति समयरेखा।',
    'All Divisions': 'सभी डिवीजन',
    'All Project Offices': 'सभी परियोजना कार्यालय',
    'All Schools': 'सभी स्कूल',
    'All Terms': 'सभी सत्र',
    'Filters': 'फ़िल्टर',
    'Detailed Breakdown': 'विस्तृत विवरण',
    'Level': 'स्तर',
    'Showing page': 'पृष्ठ दिखा रहा है',
    'of': 'का',
    'records': 'रिकॉर्ड',
    // Students / Roster
    'Search student...': 'छात्र खोजें...',
    'Class': 'कक्षा',
    'Gender': 'लिंग',
    'Age': 'आयु',
    'School': 'स्कूल',
    'Actions': 'क्रियाएँ',
    'Add Student': 'छात्र जोड़ें',
    'No students found.': 'कोई छात्र नहीं मिला।',
    'Active Students': 'सक्रिय छात्र',
    'List of all registered students and their status.': 'सभी पंजीकृत छात्रों और उनकी स्थिति की सूची।',
    'Female': 'महिला',
    'Male': 'पुरुष',
    // Resources
    'Interactive Simulations': 'इंटरैक्टिव सिमुलेशन',
    'Hands-on simulations, games and learning pathways to master FLN concepts.': 'FLN अवधारणाओं में महारत हासिल करने के लिए व्यावहारिक सिमुलेशन, खेल और सीखने के रास्ते।',
    'Session Planner': 'सत्र योजनाकार',
    'Pedagogy Videos': 'शिक्षाशास्त्र वीडियो',
    'Articles': 'लेख',
    'Filter by Subject': 'विषय के अनुसार फ़िल्टर करें',
    'All Subjects': 'सभी विषय',
    'Language': 'भाषा',
    'Maths': 'गणित',
    'Play Game': 'खेल खेलें',
    'Start Competition': 'प्रतियोगिता शुरू करें',
  },
  mr: {
    // Navbar
    'Dashboards': 'डॅशबोर्ड',
    'Implementation Corner': 'अंमलबजावणी कोपरा',
    'Students': 'विद्यार्थी',
    'Upload': 'अपलोड',
    'Users': 'वापरकर्ते',
    'Data': 'माहिती',
    'Logins': 'लॉगिन',
    'Record Score': 'गुण नोंदवा',
    'Sign In': 'लॉग इन करा',
    'Sign Out': 'बाहेर पडा',
    // Dashboard
    'FLN Impact Dashboard': 'FLN प्रभाव डॅशबोर्ड',
    'Real-time state and division progress tracking towards NIPUN Bharat Mission targets.': 'निपुण भारत मिशन लक्ष्यांच्या दिशेने रिअल-टाइम राज्य आणि विभाग प्रगती ट्रॅकिंग.',
    'Select Division': 'विभाग निवडा',
    'Select Project Office': 'प्रकल्प कार्यालय निवडा',
    'Select School': 'शाळा निवडा',
    'NIPUN Bharat Mission': 'निपुण भारत मिशन',
    'The NIPUN Bharat Mission targets 100% foundational literacy and numeracy proficiency for all grade-level students. We monitor student progress through targeted baseline and endline assessments to bridge the learning gap.': 'निपुण भारत मिशन सर्व इयत्तेच्या विद्यार्थ्यांसाठी १००% पायाभूत साक्षरता आणि संख्याज्ञान प्राविण्य लक्ष्य ठेवते. आम्ही शिकण्यातील अंतर भरून काढण्यासाठी लक्ष्यित बेसलाइन आणि एंडलाइन मूल्यमापनांद्वारे विद्यार्थ्यांच्या प्रगतीचे निरीक्षण करतो.',
    'Literacy (L4 Story Reading)': 'साक्षरता (L4 कथा वाचन)',
    'Numeracy (L3 Division)': 'संख्याज्ञान (L3 भागाकार)',
    'Current Level': 'सध्याची पातळी',
    'Target': 'लक्ष्य',
    'Total Assessments': 'एकूण मूल्यमापने',
    'Total Students': 'एकूण विद्यार्थी',
    'Arena Engagement': 'आखाडा सहभाग',
    'Single Games': 'सिंगल गेम्स',
    'Target Tracking': 'लक्ष्य ट्रॅकिंग',
    'Growth Velocity': 'वाढ वेग',
    'Engagement Metrics': 'सहभाग मेट्रिक्स',
    'Pedagogy Coverage': 'शिक्षणशास्त्र व्याप्ती',
    'Division Rank': 'विभाग रँक',
    'Division': 'विभाग',
    'Proficiency': 'प्राविण्य',
    'Assessments': 'मूल्यमापने',
    'Status': 'स्थिती',
    'Growth Over Time': 'काळानुसार वाढ',
    'Progress timeline showing baseline vs midline vs endline outcomes.': 'बेसलाइन विरुद्ध मिडलाइन विरुद्ध एंडलाइन परिणाम दर्शवणारी प्रगती टाइमलाइन.',
    'All Divisions': 'सर्व विभाग',
    'All Project Offices': 'सर्व प्रकल्प कार्यालये',
    'All Schools': 'सर्व शाळा',
    'All Terms': 'सर्व सत्र',
    'Filters': 'फिल्टर्स',
    'Detailed Breakdown': 'तपशीलवार वर्गीकरण',
    'Level': 'पातळी',
    'Showing page': 'पृष्ठ दर्शवत आहे',
    'of': 'पैकी',
    'records': 'नोंदी',
    // Students / Roster
    'Search student...': 'विद्यार्थी शोधा...',
    'Class': 'इयत्ता',
    'Gender': 'लिंग',
    'Age': 'वय',
    'School': 'शाळा',
    'Actions': 'कृती',
    'Add Student': 'विद्यार्थी जोडा',
    'No students found.': 'कोणतेही विद्यार्थी आढळले नाहीत.',
    'Active Students': 'सक्रिय विद्यार्थी',
    'List of all registered students and their status.': 'सर्व नोंदणीकृत विद्यार्थ्यांची आणि त्यांच्या स्थितीची सूची.',
    'Female': 'स्त्री',
    'Male': 'पुरुष',
    // Resources
    'Interactive Simulations': 'परस्परसंवादी सिम्युलेशन',
    'Hands-on simulations, games and learning pathways to master FLN concepts.': 'FLN संकल्पनांवर प्रभुत्व मिळविण्यासाठी हँड्स-ऑन सिम्युलेशन, खेळ आणि शिकण्याचे मार्ग.',
    'Session Planner': 'सत्र नियोजक',
    'Pedagogy Videos': 'अध्यापनशास्त्र व्हिडिओ',
    'Articles': 'लेख',
    'Filter by Subject': 'विषयानुसार फिल्टर करा',
    'All Subjects': 'सर्व विषय',
    'Language': 'भाषा',
    'Maths': 'गणित',
    'Play Game': 'खेळ खेळा',
    'Start Competition': 'स्पर्धा सुरू करा',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
