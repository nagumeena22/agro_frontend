'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'te' | 'mr';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

export const translations: Translations = {
    // Navigation
    nav_home: {
        en: 'Home',
        hi: 'होम',
        ta: 'முகப்பு',
        te: 'హోమ్',
        mr: 'होम'
    },
    nav_shop: {
        en: 'Shop',
        hi: 'शॉप',
        ta: 'கடை',
        te: 'షాప్',
        mr: 'शॉप'
    },
    nav_prediction: {
        en: 'Disease Prediction',
        hi: 'रोग भविष्यवाणी',
        ta: 'நோய் கணிப்பு',
        te: 'వ్యాధి అంచనా',
        mr: 'रोग भविष्यवाणी'
    },
    nav_community: {
        en: 'Farmer Stories',
        hi: 'किसान कहानियां',
        ta: 'விவசாயிகள் கதைகள்',
        te: 'రైతు కథలు',
        mr: 'शेतकरी कथा'
    },
    nav_login: {
        en: 'Login',
        hi: 'लॉगिन',
        ta: 'உள்நுழைவு',
        te: 'లాగిన్',
        mr: 'लॉगिन'
    },
    nav_register: {
        en: 'Register',
        hi: 'रजिस्टर',
        ta: 'பதிவு',
        te: 'రిజిస్టర్',
        mr: 'नोंदणी'
    },
    nav_logout: {
        en: 'Logout',
        hi: 'लॉगआउट',
        ta: 'வெளியேறு',
        te: 'లాగౌట్',
        mr: 'लॉगआउट'
    },
    nav_cart: {
        en: 'Cart',
        hi: 'कार्ट',
        ta: 'கூடை',
        te: 'కార్ట్',
        mr: 'कार्ट'
    },
    // Home Page
    hero_title: {
        en: 'Welcome to LakshmiAgro',
        hi: 'LakshmiAgro में आपका स्वागत है',
        ta: 'LakshmiAgro-க்கு வரவேற்கிறோம்',
        te: 'LakshmiAgro కి స్వాగతం',
        mr: 'LakshmiAgro मध्ये आपले स्वागत आहे'
    },
    hero_subtitle: {
        en: 'Your One-Stop Solution for Quality Pesticides & Fertilizers',
        hi: 'गुणवत्तापूर्ण कीटनाशकों और उर्वरकों के लिए आपका एकमात्र समाधान',
        ta: 'தரமான பூச்சிக்கொல்லிகள் மற்றும் உரங்களுக்கான உங்கள் ஒரே தீர்வு',
        te: 'నాణ్యమైన పురుగుమందులు & ఎరువుల కోసం మీ వన్-స్టాప్ సొల్యూషన్',
        mr: 'दर्जेदार कीटकनाशके आणि खतांसाठी तुमचे वन-स्टॉप सोल्यूशन'
    },
    btn_shop_now: {
        en: 'Shop Now',
        hi: 'अभी खरीदें',
        ta: 'இப்போது வாங்குங்கள்',
        te: 'ఇప్పుడే షాపింగ్ చేయండి',
        mr: 'आता खरेदी करा'
    },
    btn_detect_disease: {
        en: 'Detect Disease',
        hi: 'रोग का पता लगाएं',
        ta: 'நோயைக் கண்டறியவும்',
        te: 'వ్యాధిని గుర్తించండి',
        mr: 'रोग ओळखा'
    },
    section_fertilizers: {
        en: 'Featured Fertilizers',
        hi: 'विशेष उर्वरक',
        ta: 'சிறப்பு உரங்கள்',
        te: 'ఫీచర్ చేయబడిన ఎరువులు',
        mr: 'वैशिष्ट्यीकृत खते'
    },
    section_pesticides: {
        en: 'Effective Pesticides',
        hi: 'प्रभावी कीटनाशक',
        ta: 'பயனுள்ள பூச்சிக்கொல்லிகள்',
        te: 'ప్రభావవంతమైన పురుగుమందులు',
        mr: 'प्रभावी कीटकनाशके'
    },
    view_all: {
        en: 'View All',
        hi: 'सभी देखें',
        ta: 'அனைத்தையும் காண்க',
        te: 'అన్నీ చూడండి',
        mr: 'सर्व पहा'
    },
    // Shop Page
    shop_title: {
        en: 'Shop Agricultural Products',
        hi: 'कृषि उत्पाद खरीदें',
        ta: 'விவசாய தயாரிப்புகளை வாங்குங்கள்',
        te: 'వ్యవసాయ ఉత్పత్తులను షాపింగ్ చేయండి',
        mr: 'कृषी उत्पादने खरेदी करा'
    },
    cat_all: { en: 'All', hi: 'सभी', ta: 'அனைத்தும்', te: 'అన్నీ', mr: 'सर्व' },
    cat_fertilizer: { en: 'Fertilizer', hi: 'उर्वरक', ta: 'உரம்', te: 'ఎరువులు', mr: 'खते' },
    cat_pesticide: { en: 'Pesticide', hi: 'कीटनाशक', ta: 'பூச்சிக்கொல்லி', te: 'పురుగుమందు', mr: 'कीटकनाशक' },
    cat_seeds: { en: 'Seeds', hi: 'बीज', ta: 'விதை', te: 'విత్తనాలు', mr: 'बियाणे' },
    cat_equipment: { en: 'Equipment', hi: 'उपकरण', ta: 'கருவிகள்', te: 'పరికరాలు', mr: 'उपकरणे' },
    // Product
    btn_buy_now: {
        en: 'Buy Now',
        hi: 'अभी खरीदें',
        ta: 'இப்போது வாங்கு',
        te: 'ఇప్పుడే కొనుగోలు చేయండి',
        mr: 'आता खरेदी करा'
    },
    btn_add_to_cart: {
        en: 'Add to Cart',
        hi: 'कार्ट में डालें',
        ta: 'கூடையில் சேர்',
        te: 'కార్ట్‌కు జోడించు',
        mr: 'कार्टमध्ये जोडा'
    },
    in_stock: { en: 'In Stock', hi: 'स्टॉक में', ta: 'இருப்பில் உள்ளது', te: 'స్టాక్ లో ఉంది', mr: 'स्टॉकमध्ये आहे' },
    out_of_stock: { en: 'Out of Stock', hi: 'स्टॉक में नहीं', ta: 'இருப்பில் இல்லை', te: 'స్టాక్ లేదు', mr: 'स्टॉकमध्ये नाही' },
    // Disease Prediction
    predict_title: {
        en: 'AI Plant Disease Detection',
        hi: 'AI पादप रोग पहचान',
        ta: 'AI தாவர நோய் கண்டறிதல்',
        te: 'AI మొక్కల వ్యాధి గుర్తింపు',
        mr: 'AI वनस्पती रोग ओळख'
    },
    predict_upload_label: {
        en: 'Click to upload leaf image',
        hi: 'पत्ती की फोटो अपलोड करने के लिए क्लिक करें',
        ta: 'இலை படத்தை பதிவேற்ற கிளிக் செய்யவும்',
        te: 'ఆకు చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
        mr: 'पानाचे चित्र अपलोड करण्यासाठी क्लिक करा'
    },
    predict_btn_detect: {
        en: 'Detect Disease',
        hi: 'रोग का पता लगाएं',
        ta: 'நோயைக் கண்டறியவும்',
        te: 'వ్యాధిని గుర్తించండి',
        mr: 'रोग ओळखा'
    },
    predict_analyzing: {
        en: 'Analyzing...',
        hi: 'विश्लेषण कर रहा है...',
        ta: 'பகுப்பாய்வு செய்கிறது...',
        te: 'విశ్లేషిస్తోంది...',
        mr: 'विश्लेषण करत आहे...'
    },
    predict_result_title: {
        en: 'Prediction Result',
        hi: 'भविष्यवाणी का परिणाम',
        ta: 'கணிப்பு முடிவு',
        te: 'అంచనా ఫలితం',
        mr: 'भविष्यवाणी निकाल'
    },
    predict_disease_detected: {
        en: 'Disease Detected',
        hi: 'रोग पाया गया',
        ta: 'நோய் கண்டறியப்பட்டது',
        te: 'వ్యాధి కనుగొనబడింది',
        mr: 'रोग आढळला'
    },
    predict_confidence: {
        en: 'Confidence',
        hi: 'आत्मविश्वास',
        ta: 'நம்பிக்கை',
        te: 'విశ్వాసం',
        mr: 'विश्वास'
    },
    predict_treatment: {
        en: 'Treatment / Prevention',
        hi: 'उपचार / रोकथाम',
        ta: 'சிகிச்சை / தடுப்பு',
        te: 'చికిత్స / నివారణ',
        mr: 'उपचार / प्रतिबंध'
    },
    predict_recommended: {
        en: 'Recommended Products',
        hi: 'अनुशंसित उत्पाद',
        ta: 'பரிந்துரைக்கப்பட்ட தயாரிப்புகள்',
        te: 'సిఫార్సు చేయబడిన ఉత్పత్తులు',
        mr: 'शिफारस केलेली उत्पादనే'
    },
    predict_no_rec: {
        en: 'No specific products recommended for this condition yet.',
        hi: 'इस स्थिति के लिए अभी तक कोई विशेष उत्पाद अनुशंसित नहीं है।',
        ta: 'இந்த நிலைக்கு இதுவரை குறிப்பிட்ட தயாரிப்புகள் எதுவும் பரிந்துரைக்கப்படவில்லை.',
        te: 'ఈ పరిస్థితికి ఇంకా నిర్దిష్ట ఉత్పత్తులు సిఫార్సు చేయబడలేదు.',
        mr: 'या स्थितीसाठी अद्याప कोणतेही विशिष्ट उत्पादने शिफारस केलेली नाहीत.'
    },
    // Product Details
    pd_back_to_shop: {
        en: 'Back to Shop',
        hi: 'शॉप पर वापस जाएं',
        ta: 'கடைக்குத் திரும்பு',
        te: 'షాప్ కి తిరిగి వెళ్ళు',
        mr: 'शॉपवर परत जा'
    },
    pd_reviews: {
        en: 'Reviews',
        hi: 'समीक्षाएं',
        ta: 'விமர்சனங்கள்',
        te: 'సమీక్షలు',
        mr: 'पुनरावलोकने'
    },
    pd_no_reviews: {
        en: 'No reviews yet. Be the first to review!',
        hi: 'अभी तक कोई समीक्षा नहीं। समीक्षा करने वाले पहले व्यक्ति बनें!',
        ta: 'இதுவரை விமர்சனங்கள் எதுவும் இல்லை. முதல் விமர்சகராக இருங்கள்!',
        te: 'ఇంకా సమీక్షలు లేవు. సమీక్షించిన మొదటి వ్యక్తి అవ్వండి!',
        mr: 'अद्याप कोणतीही पुनरावलोकने नाहीत. पुनरावलोकन करणारे पहिले व्हा!'
    },
    pd_summary: {
        en: 'Product Summary',
        hi: 'उत्पाद सारांश',
        ta: 'தயாரிப்பு சுருக்கம்',
        te: 'ఉత్పత్తి సారాంశం',
        mr: 'उत्पादन सारांश'
    },
    pd_items_available: {
        en: 'items available',
        hi: 'वस्तुएं उपलब्ध',
        ta: 'பொருட்கள் உள்ளன',
        te: 'వస్తువులు అందుబాటులో ఉన్నాయి',
        mr: 'वस्तू उपलब्ध आहेत'
    },
    pd_detailed_info: {
        en: 'Detailed Information',
        hi: 'विस्तृत जानकारी',
        ta: 'விரிவான தகவல்',
        te: 'వివరమైన సమాచారం',
        mr: 'तपशीलवार माहिती'
    },
    pd_why_used: {
        en: 'Why it is used?',
        hi: 'इसका उपयोग क्यों किया जाता है?',
        ta: 'இது ஏன் பயன்படுத்தப்படுகிறது?',
        te: 'ఇది ఎందుకు ఉపయోగించబడుతుంది?',
        mr: 'ते का वापरले जाते?'
    },
    pd_items_inside: {
        en: 'Items inside the package',
        hi: 'पैकेज के अंदर की वस्तुएं',
        ta: 'தொகுப்பிற்குள் உள்ள பொருட்கள்',
        te: 'ప్యాకేజీ లోపల ఉన్న వస్తువులు',
        mr: 'पॅकेजमधील वस्तू'
    },
    pd_related_products: {
        en: 'Related Products',
        hi: 'संबंधित उत्पाद',
        ta: 'தொடர்புடைய தயாரிப்புகள்',
        te: 'సంబంధిత ఉత్పత్తులు',
        mr: 'సంबंधित उत्पादने'
    },
    pd_usage_desc: {
        en: 'This product is specially formulated to provide maximum effectiveness for agricultural use. It helps in enhancing crop yield, protecting plants from diseases, and ensuring healthy growth throughout the season.',
        hi: 'यह उत्पाद विशेष रूप से कृषि उपयोग के लिए अधिकतम प्रभावशीलता प्रदान करने के लिए तैयार किया गया है। यह फसल की उपज बढ़ाने, पौधों को बीमारियों से बचाने और पूरे मौसम में स्वस्थ विकास सुनिश्चित करने में मदद करता है।',
        ta: 'இந்த தயாரிப்பு விவசாய பயன்பாட்டிற்கு அதிகபட்ச செயல்திறனை வழங்க சிறப்பாக வடிவமைக்கப்பட்டுள்ளது. இது பயிர் விளைச்சலை அதிகரிக்கவும், தாவரங்களை நோய்களிலிருந்து பாதுகாக்கவும், பருவம் முழுவதும் ஆரோக்கியமான வளர்ச்சியை உறுதி செய்யவும் உதவுகிறது.',
        te: 'ఈ ఉత్పత్తి వ్యవసాయ వినియోగం కోసం గరిష్ట ప్రభావాన్ని అందించడానికి ప్రత్యేకంగా రూపొందించబడింది. ఇది పంట దిగుబడిని పెంచడానికి, మొక్కలను వ్యాధుల నుండి రక్షించడానికి మరియు సీజన్ అంతటా ఆరోగ్యకరమైన పెరుగుదలను నిర్ధారించడానికి సహాయపడుతుంది.',
        mr: 'हे उत्पादन विशेषतः कृषी वापरासाठी जास्तीत जास्त प्रभावीता प्रदान करण्यासाठी तयार केले आहे. हे पिकांचे उत्पादन वाढवण्यासाठी, झाडांचे रोगांपासून संरक्षण करण्यासाठी आणि संपूर्ण हंगामात निरोगी वाढ सुनिश्चित करण्यासाठी मदत करते.'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app_language') as Language;
        if (savedLang && ['en', 'hi', 'ta', 'te', 'mr'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    const t = (key: string) => {
        if (!translations[key]) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        return translations[key][language] || translations[key]['en'];
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
