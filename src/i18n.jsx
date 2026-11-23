import { useEffect, useState } from 'react';

/**
 * Tiny English / Hindi switch. `t(key)` returns the string for the active
 * language (falls back to English). Section titles are [before, accent, after]
 * so the gradient-italic accent survives translation — render them with <T k="…" />.
 */

const dict = {
  en: {
    'nav.about': 'About', 'nav.work': 'Work', 'nav.services': 'Services', 'nav.journey': 'Journey', 'nav.contact': 'Contact',
    'nav.resume': 'Résumé', 'nav.lab': 'Lab', 'nav.games': 'Games', 'nav.talk': "Let's talk", 'nav.quick': 'Quick menu',

    'hero.available': 'Available', 'hero.currently': 'Currently at', 'hero.hi': "Hi, I'm Rishav",
    'hero.build': 'I build', 'hero.that': 'that', 'hero.perform': 'perform.',
    'hero.para': 'AI research engineer at Ethara AI — LLM post-training evaluation, benchmark pipelines and model analysis, plus polished full-stack products shipped to production.',
    'hero.cta': 'See my work', 'hero.resume': 'Résumé',

    'about.title': ['A little', 'about me'],
    'about.aside': 'Engineer by trade, perfectionist by habit. I care about the details that make software feel effortless.',
    'about.hello': 'Hello there',
    'about.bio': ['I’m an AI research engineer at', ', working on LLM post-training evaluation, benchmark pipelines and dataset quality — and I build full-stack products too.'],
    'about.bio2': 'From React interfaces to Node & Python services and Dockerised pipelines, I love taking an idea all the way to production — clean, fast and genuinely delightful to use.',
    'about.currently': 'Currently', 'about.promoted': 'Promoted from Software Engineer · LLM evaluation & benchmarks',
    'about.values': ['Clean code, kind UX,', 'and shipping on time — every time.'], 'about.toolkit': 'Toolkit',

    'work.title': ['Things I’ve', 'built & shipped'], 'work.aside': 'Real products, live on the internet. Open any card for the full case study.',
    'showcase.title': ['Live on', 'every screen'], 'showcase.aside': 'A 3D tour of the products I’ve shipped. Move your mouse to look around — pick any project below.',
    'services.title': ['How I can', 'help you'], 'services.aside': 'From model evaluation infrastructure to polished customer-facing products — one engineer, the whole stack.',
    'process.title': ['How we’ll', 'work together'], 'process.aside': 'A simple, transparent process — so you always know what’s happening and what comes next.',
    'universe.title': ['My', 'tech universe', ', in 3D'], 'universe.aside': 'Every tool I work with, orbiting one idea: build things that work beautifully. Grab it and give it a spin.',
    'terminal.title': ['Prefer the', 'command line?'], 'terminal.aside': 'A tiny interactive shell — explore my work the developer way. Type help to begin.',
    'experience.title': ['Where I’ve', 'grown'], 'experience.aside': 'From an LLM post-training internship to a PPO, a full-time role and a promotion to AI Research Engineer at Ethara AI.',
    'credentials.title': ['Proof,', 'on paper'], 'credentials.aside': 'Certifications, awards and résumés — open any of them right here.',
    'games.title': ['Take a break —', 'play a game'], 'games.aside': '25 mini-games I built from scratch — arcade, puzzles, brain-teasers and AI opponents. Here are a few favourites.',
    'testimonials.title': ['What people', 'say'], 'testimonials.aside': 'Words from people I’ve worked with and learned from.',

    'contact.title': ['Let’s make something', 'lovely together.'],
    'contact.online': 'Online now — replies within a few hours', 'contact.night': 'It’s night in Gurugram',
    'contact.local': 'Local time', 'contact.morning': 'I’ll reply first thing in the morning',
    'contact.intro': 'Tell me about what you’re building. I usually reply within 24 hours.', 'contact.copy': 'Copy',
    'contact.based': 'Based in', 'contact.brief': 'Project brief', 'contact.pick': '· pick any',
    'contact.q.type': 'What are we building?', 'contact.q.budget': 'Budget range', 'contact.q.timeline': 'Timeline',
    'contact.name': 'Your name', 'contact.email': 'Email address', 'contact.msg': 'A few lines about your idea, goals or the problem to solve',
    'contact.send': 'Send enquiry', 'contact.form': 'or use the Google Form', 'contact.sent': 'Your email app should open with the full brief ready — just hit send. 💌',
    'contact.whatsapp': 'Chat on WhatsApp', 'contact.book': 'Book a 15-min call',
    'footer.made': 'Designed & engineered by hand.', 'footer.share': 'Share / QR', 'footer.shortcuts': 'Shortcuts', 'footer.top': 'Back to top ↑', 'footer.install': 'Install app',

    'wa.label': 'Chat on WhatsApp', 'wa.msg': 'Hi Rishav! I saw your portfolio and would like to discuss a project.',
    'book.title': 'Book a 15-min call', 'book.sub': 'Pick a day and time (IST). I’ll confirm on WhatsApp or email.',
    'book.day': 'Day', 'book.time': 'Time (IST)', 'book.name': 'Your name', 'book.topic': 'What would you like to discuss?',
    'book.viaWa': 'Request on WhatsApp', 'book.viaMail': 'Request by email', 'book.note': 'This sends a request — the slot is confirmed once I reply.',
    'install.title': 'Install my portfolio', 'install.sub': 'Add it to your home screen — opens like an app, works offline.', 'install.btn': 'Install', 'install.later': 'Not now',
    'install.ios': 'On iPhone: tap the Share button, then “Add to Home Screen”.',
  },

  hi: {
    'nav.about': 'परिचय', 'nav.work': 'काम', 'nav.services': 'सेवाएँ', 'nav.journey': 'सफ़र', 'nav.contact': 'संपर्क',
    'nav.resume': 'रिज़्यूमे', 'nav.lab': 'लैब', 'nav.games': 'गेम्स', 'nav.talk': 'बात करें', 'nav.quick': 'क्विक मेन्यू',

    'hero.available': 'उपलब्ध', 'hero.currently': 'अभी कार्यरत', 'hero.hi': 'नमस्ते, मैं ऋषव हूँ',
    'hero.build': 'मैं बनाता हूँ', 'hero.that': 'जो', 'hero.perform': 'कमाल करें।',
    'hero.para': 'Ethara AI में AI रिसर्च इंजीनियर — LLM पोस्ट-ट्रेनिंग इवैल्यूएशन, बेंचमार्क पाइपलाइन और मॉडल एनालिसिस, साथ ही प्रोडक्शन तक पहुँचे बेहतरीन फुल-स्टैक प्रोडक्ट्स।',
    'hero.cta': 'मेरा काम देखें', 'hero.resume': 'रिज़्यूमे',

    'about.title': ['थोड़ा', 'मेरे बारे में'],
    'about.aside': 'पेशे से इंजीनियर, आदत से परफ़ेक्शनिस्ट। मुझे उन बारीकियों की परवाह है जो सॉफ़्टवेयर को सहज बनाती हैं।',
    'about.hello': 'नमस्ते',
    'about.bio': ['मैं AI रिसर्च इंजीनियर हूँ —', ' में LLM पोस्ट-ट्रेनिंग इवैल्यूएशन, बेंचमार्क पाइपलाइन और डेटासेट क्वालिटी पर काम करता हूँ — और फुल-स्टैक प्रोडक्ट्स भी बनाता हूँ।'],
    'about.bio2': 'React इंटरफ़ेस से लेकर Node और Python सर्विसेज़ और Docker पाइपलाइन तक — मुझे किसी आइडिया को प्रोडक्शन तक ले जाना पसंद है: साफ़, तेज़ और इस्तेमाल में मज़ेदार।',
    'about.currently': 'अभी', 'about.promoted': 'Software Engineer से प्रमोट · LLM इवैल्यूएशन और बेंचमार्क',
    'about.values': ['साफ़ कोड, सरल UX,', 'और हर बार समय पर डिलीवरी।'], 'about.toolkit': 'टूलकिट',

    'work.title': ['जो मैंने', 'बनाया और लॉन्च किया'], 'work.aside': 'असली प्रोडक्ट्स, इंटरनेट पर लाइव। पूरी केस स्टडी के लिए कोई भी कार्ड खोलें।',
    'showcase.title': ['हर स्क्रीन पर', 'लाइव'], 'showcase.aside': 'मेरे बनाए प्रोडक्ट्स का 3D टूर। माउस घुमाकर देखें — नीचे से कोई भी प्रोजेक्ट चुनें।',
    'services.title': ['मैं आपकी', 'कैसे मदद कर सकता हूँ'], 'services.aside': 'मॉडल इवैल्यूएशन इंफ्रास्ट्रक्चर से लेकर शानदार कस्टमर-फ़ेसिंग प्रोडक्ट्स तक — एक इंजीनियर, पूरा स्टैक।',
    'process.title': ['हम साथ में', 'कैसे काम करेंगे'], 'process.aside': 'एक सरल और पारदर्शी प्रक्रिया — ताकि आपको हमेशा पता रहे कि क्या चल रहा है और आगे क्या है।',
    'universe.title': ['मेरा', 'टेक यूनिवर्स', ', 3D में'], 'universe.aside': 'हर टूल जिसके साथ मैं काम करता हूँ, एक ही सोच के चारों ओर: ऐसी चीज़ें बनाना जो खूबसूरती से काम करें। पकड़कर घुमाइए।',
    'terminal.title': ['कमांड लाइन', 'पसंद है?'], 'terminal.aside': 'एक छोटा इंटरैक्टिव शेल — मेरा काम डेवलपर वाले अंदाज़ में देखें। शुरू करने के लिए help लिखें।',
    'experience.title': ['मेरा', 'सफ़र'], 'experience.aside': 'LLM पोस्ट-ट्रेनिंग इंटर्नशिप से PPO, फुल-टाइम जॉब और Ethara AI में AI रिसर्च इंजीनियर तक का प्रमोशन।',
    'credentials.title': ['सबूत,', 'कागज़ पर'], 'credentials.aside': 'सर्टिफ़िकेट, अवॉर्ड और रिज़्यूमे — कोई भी यहीं खोलकर देखें।',
    'games.title': ['थोड़ा ब्रेक लें —', 'गेम खेलें'], 'games.aside': 'मेरे खुद बनाए 25 मिनी-गेम्स — आर्केड, पज़ल, दिमागी खेल और AI से मुकाबला। ये रहे कुछ पसंदीदा।',
    'testimonials.title': ['लोग क्या', 'कहते हैं'], 'testimonials.aside': 'उन लोगों के शब्द जिनके साथ मैंने काम किया और जिनसे सीखा।',

    'contact.title': ['चलिए साथ मिलकर कुछ', 'खूबसूरत बनाते हैं।'],
    'contact.online': 'अभी ऑनलाइन — कुछ घंटों में जवाब', 'contact.night': 'गुरुग्राम में अभी रात है',
    'contact.local': 'स्थानीय समय', 'contact.morning': 'सुबह सबसे पहले जवाब दूँगा',
    'contact.intro': 'बताइए आप क्या बना रहे हैं। मैं आमतौर पर 24 घंटे में जवाब देता हूँ।', 'contact.copy': 'कॉपी',
    'contact.based': 'स्थान', 'contact.brief': 'प्रोजेक्ट ब्रीफ़', 'contact.pick': '· कोई भी चुनें',
    'contact.q.type': 'हम क्या बना रहे हैं?', 'contact.q.budget': 'बजट', 'contact.q.timeline': 'समय-सीमा',
    'contact.name': 'आपका नाम', 'contact.email': 'ईमेल पता', 'contact.msg': 'अपने आइडिया, लक्ष्य या समस्या के बारे में कुछ पंक्तियाँ',
    'contact.send': 'संदेश भेजें', 'contact.form': 'या Google Form इस्तेमाल करें', 'contact.sent': 'आपका ईमेल ऐप पूरे ब्रीफ़ के साथ खुलेगा — बस भेज दीजिए। 💌',
    'contact.whatsapp': 'WhatsApp पर बात करें', 'contact.book': '15 मिनट की कॉल बुक करें',
    'footer.made': 'हाथ से डिज़ाइन और इंजीनियर किया गया।', 'footer.share': 'शेयर / QR', 'footer.shortcuts': 'शॉर्टकट', 'footer.top': 'ऊपर जाएँ ↑', 'footer.install': 'ऐप इंस्टॉल करें',

    'wa.label': 'WhatsApp पर बात करें', 'wa.msg': 'नमस्ते ऋषव! मैंने आपका पोर्टफ़ोलियो देखा और एक प्रोजेक्ट पर बात करना चाहता/चाहती हूँ।',
    'book.title': '15 मिनट की कॉल बुक करें', 'book.sub': 'दिन और समय (IST) चुनें। मैं WhatsApp या ईमेल पर कन्फ़र्म करूँगा।',
    'book.day': 'दिन', 'book.time': 'समय (IST)', 'book.name': 'आपका नाम', 'book.topic': 'आप किस बारे में बात करना चाहते हैं?',
    'book.viaWa': 'WhatsApp पर रिक्वेस्ट भेजें', 'book.viaMail': 'ईमेल से रिक्वेस्ट भेजें', 'book.note': 'यह एक रिक्वेस्ट है — मेरे जवाब के बाद स्लॉट पक्का होगा।',
    'install.title': 'मेरा पोर्टफ़ोलियो इंस्टॉल करें', 'install.sub': 'होम स्क्रीन पर जोड़ें — ऐप की तरह खुलेगा, ऑफ़लाइन भी चलेगा।', 'install.btn': 'इंस्टॉल', 'install.later': 'अभी नहीं',
    'install.ios': 'iPhone पर: Share बटन दबाएँ, फिर “Add to Home Screen”।',
  },
};

// Services & process are lists, translated by position.
export const listHi = {
  services: [
    ['AI रिसर्च और मॉडल इवैल्यूएशन', 'RL एनवायरनमेंट, एजेंट इवैल्यूएशन, LLM और फ्रंटियर-मॉडल बेंचमार्किंग, डेटासेट क्यूरेशन और पोस्ट-ट्रेनिंग पाइपलाइन।'],
    ['फुल-स्टैक प्रोडक्ट डेवलपमेंट', 'React, Node.js और Python से पूरे वेब ऐप — इंटरफ़ेस से API और डेटाबेस तक।'],
    ['ऑटोमेशन और DevOps', 'Docker के साथ कंटेनर सर्विसेज़, CI/CD, वैलिडेशन सूट और बड़े पैमाने पर चलने वाली पाइपलाइन।'],
    ['बैकएंड और API डिज़ाइन', 'सुरक्षित और स्केलेबल सर्वर लॉजिक — REST API, JWT/OAuth ऑथ, मिडलवेयर और ऑप्टिमाइज़्ड डेटा मॉडल।'],
    ['QA और परफ़ॉर्मेंस', 'बग, धीमेपन, अलग-अलग ब्राउज़र और हर स्क्रीन पर सही रिस्पॉन्सिव डिज़ाइन की गहरी जाँच।'],
  ],
  process: [
    ['खोज', 'हम आपके लक्ष्य, यूज़र्स और सीमाओं पर बात करते हैं। कोड की एक लाइन से पहले मैं स्कोप, जोखिम और साफ़ प्लान तय करता हूँ।', ['किक-ऑफ़ कॉल', 'स्कोप और लक्ष्य', 'टाइमलाइन']],
    ['डिज़ाइन', 'वायरफ़्रेम से लेकर शानदार इंटरफ़ेस तक — साथ ही आर्किटेक्चर, डेटा मॉडल और API की प्लानिंग।', ['वायरफ़्रेम', 'UI डिज़ाइन', 'टेक प्लान']],
    ['निर्माण', 'नियमित डेमो के साथ काम, ताकि आप हमेशा प्रगति देख सकें। साफ़, टेस्टेड और डॉक्यूमेंटेड कोड।', ['नियमित डेमो', 'कोड रिव्यू', 'टेस्टिंग']],
    ['लॉन्च और आगे', 'सही तरीके से डिप्लॉय, मॉनिटर और हैंडओवर — और फ़िक्स या अगले सुधार के लिए मैं हमेशा उपलब्ध।', ['डिप्लॉयमेंट', 'हैंडओवर डॉक्स', 'लगातार सपोर्ट']],
  ],
  stats: ['वेब प्रोडक्ट लॉन्च किए', 'LLM evals के लिए Docker images', 'साल प्रोडक्शन कोड', 'सर्टिफ़िकेट और अवॉर्ड'],
};

const read = () => {
  try {
    return localStorage.getItem('rk-lang') === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
};

let current = typeof window !== 'undefined' ? read() : 'en';
if (typeof document !== 'undefined') document.documentElement.lang = current;

export function setLang(l) {
  current = l;
  try {
    localStorage.setItem('rk-lang', l);
  } catch {}
  document.documentElement.lang = l;
  window.dispatchEvent(new CustomEvent('app:lang', { detail: l }));
}
export const toggleLang = () => setLang(current === 'hi' ? 'en' : 'hi');
export const getLang = () => current;

/** Re-renders the caller when the language changes; returns { t, lang }. */
export function useLang() {
  const [lang, set] = useState(current);
  useEffect(() => {
    const on = (e) => set(e.detail);
    window.addEventListener('app:lang', on);
    return () => window.removeEventListener('app:lang', on);
  }, []);
  const t = (k) => dict[lang][k] ?? dict.en[k] ?? k;
  return { t, lang };
}

/** Section title with a gradient-italic accent: [before, accent, after]. */
export function T({ k }) {
  const { t } = useLang();
  const [a, b, c] = t(k);
  return (
    <>
      {a} <span className="text-gradient font-serif font-normal italic">{b}</span>
      {c || ''}
    </>
  );
}

export function LangToggle({ className = '' }) {
  const { lang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className={`glass relative grid h-10 min-w-10 place-items-center rounded-full px-2.5 text-[13px] font-semibold ${className}`}
      aria-label={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
      title={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
    >
      {lang === 'hi' ? 'EN' : 'हि'}
    </button>
  );
}
