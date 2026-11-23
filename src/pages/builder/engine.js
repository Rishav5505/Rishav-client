/**
 * Prompt → website, without an AI model.
 *
 * A small rule-based "smart template engine": it reads keywords from the
 * prompt (business type, name, city, colour, style, sections), builds a
 * config, and renders a complete standalone HTML page from templates.
 * Follow-up prompts ("make it blue", "add pricing", "dark karo") edit the config.
 */

/* --------------------------------------------------------------- content */

const CATS = {
  bakery: {
    keys: ['bakery', 'cake', 'pastry', 'bread', 'dessert', 'cupcake', 'patisserie', 'mithai', 'sweet shop', 'sweets'],
    name: 'Sweet Crumbs', icon: '🧁', color: 'pink', font: 'playful',
    tag: 'Freshly baked happiness, every single morning.',
    about: 'Small-batch cakes, breads and pastries made by hand with real butter and a lot of love.',
    services: [['🎂', 'Custom cakes', 'Birthdays, weddings and everything in between — designed with you.'], ['🥐', 'Fresh every morning', 'Croissants, sourdough and buns out of the oven by 7 am.'], ['🚚', 'Home delivery', 'Hot and fresh to your door across the city.'], ['🌱', 'Eggless options', 'Most of our menu is available eggless on request.']],
    offer: { type: 'menu', title: 'Today’s menu', items: [['Chocolate truffle cake', '₹650'], ['Butter croissant', '₹120'], ['Red velvet cupcake', '₹90'], ['Sourdough loaf', '₹220'], ['Blueberry cheesecake', '₹180'], ['Almond biscotti (6)', '₹160']] },
    gallery: ['🎂', '🥐', '🍰', '🧁', '🍪', '🥖'],
    cta: 'Order now',
  },
  restaurant: {
    keys: ['restaurant', 'cafe', 'café', 'coffee', 'food', 'dhaba', 'kitchen', 'diner', 'bistro', 'pizza', 'burger', 'biryani', 'eatery'],
    name: 'The Spice Room', icon: '🍽️', color: 'orange', font: 'elegant',
    tag: 'Honest food, warm hosts, unforgettable evenings.',
    about: 'Seasonal ingredients, family recipes and a dining room that feels like home.',
    services: [['🍛', 'Signature dishes', 'Slow-cooked classics with a modern twist.'], ['🥂', 'Private dining', 'Celebrate birthdays and team dinners in our private room.'], ['🛵', 'Takeaway & delivery', 'Your favourites, packed fresh and delivered hot.'], ['🌿', 'Fresh & local', 'Ingredients sourced from local farms every week.']],
    offer: { type: 'menu', title: 'Chef’s specials', items: [['Butter chicken', '₹420'], ['Paneer tikka', '₹320'], ['Dum biryani', '₹380'], ['Garlic naan', '₹70'], ['Mango lassi', '₹140'], ['Gulab jamun', '₹120']] },
    gallery: ['🍛', '🍢', '🥘', '🍹', '🍨', '🫓'],
    cta: 'Book a table',
  },
  gym: {
    keys: ['gym', 'fitness', 'workout', 'crossfit', 'yoga', 'trainer', 'muscle', 'zumba', 'pilates'],
    name: 'Iron Pulse', icon: '🏋️', color: 'red', font: 'bold', dark: true,
    tag: 'Stronger every day. Start today.',
    about: 'Modern equipment, certified coaches and a community that pushes you to be your best.',
    services: [['💪', 'Strength training', 'Free weights, racks and machines for every level.'], ['🧘', 'Yoga & mobility', 'Daily classes to stretch, breathe and recover.'], ['🔥', 'HIIT classes', 'High-energy group sessions that torch calories.'], ['🥗', 'Diet coaching', 'Personal nutrition plans that actually fit your life.']],
    offer: { type: 'pricing', title: 'Membership plans', items: [['Monthly', '₹1,999', ['Full gym access', 'Locker & shower', '1 trainer session']], ['Quarterly', '₹4,999', ['Everything in Monthly', 'All group classes', 'Diet plan'], true], ['Yearly', '₹14,999', ['Everything in Quarterly', '12 PT sessions', 'Body composition scans']]] },
    gallery: ['🏋️', '🤸', '🚴', '🥊', '🧘', '🏃'],
    cta: 'Start free trial',
  },
  salon: {
    keys: ['salon', 'spa', 'beauty', 'makeup', 'hair', 'parlour', 'parlor', 'nail', 'skincare', 'barber'],
    name: 'Glow Studio', icon: '💇', color: 'rose', font: 'elegant',
    tag: 'Look good. Feel even better.',
    about: 'Expert stylists, premium products and a calm space made for you to unwind.',
    services: [['✂️', 'Hair styling', 'Cuts, colour and treatments by senior stylists.'], ['💅', 'Nails', 'Manicures, pedicures and nail art.'], ['🧖', 'Spa & facials', 'Relaxing treatments for glowing skin.'], ['👰', 'Bridal makeup', 'Complete bridal packages, trial included.']],
    offer: { type: 'menu', title: 'Price list', items: [['Haircut & styling', '₹599'], ['Global hair colour', '₹2,499'], ['Classic facial', '₹1,299'], ['Gel manicure', '₹899'], ['Full body spa', '₹2,999'], ['Bridal package', 'from ₹14,999']] },
    gallery: ['💇', '💅', '💄', '🧴', '🌸', '🪞'],
    cta: 'Book appointment',
  },
  clinic: {
    keys: ['clinic', 'doctor', 'dental', 'dentist', 'hospital', 'health', 'physio', 'medical', 'pharmacy', 'skin clinic'],
    name: 'CarePlus Clinic', icon: '🩺', color: 'teal', font: 'clean',
    tag: 'Caring for your family, the way we’d care for ours.',
    about: 'Experienced doctors, modern diagnostics and appointments that run on time.',
    services: [['🩺', 'General consultation', 'Same-day appointments for the whole family.'], ['🦷', 'Dental care', 'Check-ups, cleaning, fillings and braces.'], ['🧪', 'Lab tests', 'Accurate reports, home sample collection available.'], ['📱', 'Online consults', 'Talk to a doctor from home by video call.']],
    offer: { type: 'pricing', title: 'Health packages', items: [['Basic check-up', '₹999', ['Blood sugar', 'CBC', 'Doctor consult']], ['Full body', '₹2,999', ['60+ tests', 'Thyroid & lipid profile', 'Diet consult'], true], ['Senior care', '₹4,499', ['Full body + ECG', 'Home sample pickup', 'Follow-up call']]] },
    gallery: ['🩺', '💊', '🏥', '🧬', '❤️', '🦷'],
    cta: 'Book a visit',
  },
  education: {
    keys: ['school', 'coaching', 'academy', 'tuition', 'institute', 'course', 'classes', 'education', 'learning', 'college', 'jee', 'neet', 'upsc'],
    name: 'BrightPath Academy', icon: '🎓', color: 'blue', font: 'clean',
    tag: 'Where curious minds become confident achievers.',
    about: 'Small batches, expert faculty and a proven way of turning hard topics into easy wins.',
    services: [['📚', 'Expert faculty', 'Teachers with years of results behind them.'], ['🧑‍🏫', 'Small batches', 'Personal attention for every student.'], ['📝', 'Weekly tests', 'Track progress with regular mock tests.'], ['💻', 'Online + offline', 'Attend in class or join live from home.']],
    offer: { type: 'pricing', title: 'Courses', items: [['Foundation', '₹2,499/mo', ['Class 8–10', 'Maths & Science', 'Weekly tests']], ['Achiever', '₹3,999/mo', ['Class 11–12', 'Doubt sessions', 'Test series'], true], ['Ranker', '₹5,999/mo', ['Competitive exams', 'Mentorship', 'All study material']]] },
    gallery: ['📚', '🧪', '🧮', '🌍', '🏆', '✏️'],
    cta: 'Enroll now',
  },
  startup: {
    keys: ['startup', 'saas', 'app', 'software', 'tech', 'ai', 'platform', 'product', 'tool', 'api', 'dashboard'],
    name: 'Nimbus', icon: '🚀', color: 'violet', font: 'modern', dark: true,
    tag: 'Ship faster. Scale smarter. Sleep better.',
    about: 'The all-in-one platform that helps modern teams build, launch and grow — without the busywork.',
    services: [['⚡', 'Lightning fast', 'Built on a modern stack for instant performance.'], ['🔒', 'Secure by default', 'Encryption, SSO and audit logs out of the box.'], ['🔌', 'Integrations', 'Connect the tools you already use in one click.'], ['📈', 'Real-time insights', 'Dashboards that tell you what matters, live.']],
    offer: { type: 'pricing', title: 'Simple pricing', items: [['Starter', 'Free', ['Up to 3 users', 'Core features', 'Community support']], ['Pro', '$29/mo', ['Unlimited users', 'All integrations', 'Priority support'], true], ['Enterprise', 'Custom', ['SSO & SAML', 'Dedicated manager', 'SLA']]] },
    gallery: ['📊', '🧠', '☁️', '🔗', '🛡️', '⚙️'],
    cta: 'Get started',
  },
  portfolio: {
    keys: ['portfolio', 'personal', 'designer', 'developer', 'freelancer', 'photographer', 'artist', 'resume', 'creator', 'my website', 'meri website'],
    name: 'Aarav Mehta', icon: '✨', color: 'indigo', font: 'modern',
    tag: 'Designer & developer crafting thoughtful digital experiences.',
    about: 'I help brands and startups turn ideas into products people love — from first sketch to launch.',
    services: [['🎨', 'UI/UX design', 'Interfaces that look great and feel effortless.'], ['💻', 'Web development', 'Fast, responsive sites built with modern tools.'], ['📱', 'Mobile apps', 'Cross-platform apps with a native feel.'], ['🧭', 'Brand strategy', 'Identity systems that tell your story.']],
    offer: { type: 'projects', title: 'Selected work', items: [['Fintech dashboard', 'UI/UX · React'], ['Travel booking app', 'Mobile · Flutter'], ['Café brand identity', 'Branding'], ['SaaS landing page', 'Web · Next.js']] },
    gallery: ['🎨', '📱', '💻', '🖌️', '📷', '🧩'],
    cta: 'Hire me',
  },
  realestate: {
    keys: ['real estate', 'property', 'properties', 'builder', 'flats', 'apartment', 'realty', 'homes', 'villa'],
    name: 'Skyline Homes', icon: '🏡', color: 'emerald', font: 'elegant',
    tag: 'Find the home that fits your life.',
    about: 'Verified listings, transparent pricing and advisors who walk you through every step.',
    services: [['🏠', 'Buy a home', 'Handpicked, verified properties across the city.'], ['🔑', 'Rent', 'Flats and villas ready to move in.'], ['📄', 'Legal help', 'Paperwork and registration made simple.'], ['💰', 'Home loans', 'Best rates from partner banks.']],
    offer: { type: 'menu', title: 'Featured listings', items: [['2 BHK · Sector 62', '₹68 L'], ['3 BHK · Golf Course Rd', '₹1.4 Cr'], ['Studio · Cyber City', '₹32 K/mo'], ['4 BHK Villa · Sohna', '₹3.2 Cr']] },
    gallery: ['🏡', '🏢', '🛋️', '🌳', '🏊', '🌇'],
    cta: 'Schedule a visit',
  },
  travel: {
    keys: ['travel', 'tour', 'trip', 'holiday', 'trek', 'adventure', 'tourism', 'resort', 'hotel', 'homestay'],
    name: 'Wanderlust Trails', icon: '🏔️', color: 'sky', font: 'bold',
    tag: 'Adventures you’ll talk about for years.',
    about: 'Handcrafted trips, local guides and every detail taken care of — you just pack your bags.',
    services: [['🏔️', 'Mountain treks', 'Guided Himalayan treks for every level.'], ['🏖️', 'Beach escapes', 'Sun, sand and slow mornings.'], ['🚐', 'Road trips', 'Curated routes with stays booked.'], ['🧳', 'Custom trips', 'Tell us your dream — we’ll plan it.']],
    offer: { type: 'pricing', title: 'Popular packages', items: [['Manali weekend', '₹8,999', ['3 days · 2 nights', 'Stay & breakfast', 'Local sightseeing']], ['Spiti expedition', '₹24,999', ['8 days', 'All meals', 'Expert trek lead'], true], ['Goa getaway', '₹12,499', ['4 days', 'Beach resort', 'Airport transfers']]] },
    gallery: ['🏔️', '🏕️', '🌅', '🚣', '🗺️', '📸'],
    cta: 'Plan my trip',
  },
  shop: {
    keys: ['shop', 'store', 'ecommerce', 'e-commerce', 'fashion', 'clothing', 'boutique', 'jewellery', 'jewelry', 'shoes', 'sell', 'products'],
    name: 'Urban Thread', icon: '🛍️', color: 'amber', font: 'modern',
    tag: 'Style that speaks before you do.',
    about: 'Curated collections, honest prices and free returns — shopping the way it should be.',
    services: [['🚚', 'Free shipping', 'On every order above ₹999.'], ['🔁', '7-day returns', 'Changed your mind? No questions asked.'], ['💳', 'Secure payments', 'UPI, cards and cash on delivery.'], ['⭐', 'Top quality', 'Every piece checked before it ships.']],
    offer: { type: 'menu', title: 'Bestsellers', items: [['Linen shirt', '₹1,299'], ['Denim jacket', '₹2,499'], ['Classic sneakers', '₹2,999'], ['Silk scarf', '₹899'], ['Leather tote', '₹3,499'], ['Gold hoops', '₹1,599']] },
    gallery: ['👗', '👟', '👜', '🧥', '💍', '🕶️'],
    cta: 'Shop now',
  },
  business: {
    keys: [],
    name: 'Brightwave', icon: '💼', color: 'blue', font: 'modern',
    tag: 'Helping you grow, one smart step at a time.',
    about: 'A dedicated team that delivers quality work on time — and treats your goals like our own.',
    services: [['🎯', 'Strategy', 'Clear plans built around your goals.'], ['🛠️', 'Execution', 'Experienced people who get things done.'], ['🤝', 'Support', 'We stay with you long after launch.'], ['📊', 'Results', 'Transparent reports you can actually read.']],
    offer: { type: 'pricing', title: 'Plans', items: [['Basic', '₹9,999', ['Consultation', 'Starter package', 'Email support']], ['Growth', '₹24,999', ['Everything in Basic', 'Dedicated manager', 'Monthly reports'], true], ['Premium', 'Custom', ['Full service', 'Priority support', 'Quarterly reviews']]] },
    gallery: ['💼', '📈', '🤝', '🏆', '💡', '🌐'],
    cta: 'Get in touch',
  },
};

const COLORS = {
  pink: [330, 80], rose: [345, 75], red: [0, 75], orange: [24, 90], amber: [38, 92], yellow: [48, 95], gold: [43, 74], brown: [25, 45],
  green: [142, 60], emerald: [158, 64], teal: [174, 70], sky: [199, 85], blue: [221, 80], indigo: [234, 70], violet: [262, 75], purple: [275, 70],
  black: [240, 6], grey: [220, 9], gray: [220, 9], white: [220, 15],
};
// Hinglish / Hindi colour words
const COLOR_ALIAS = { gulabi: 'pink', laal: 'red', lal: 'red', neela: 'blue', nila: 'blue', hara: 'green', peela: 'yellow', pila: 'yellow', kala: 'black', kaala: 'black', sunehra: 'gold', baingani: 'purple', narangi: 'orange', safed: 'white', golden: 'gold', navy: 'indigo', maroon: 'red', lavender: 'violet', mint: 'emerald', cyan: 'teal' };

const FONTS = {
  playful: { head: 'Fredoka', body: 'Nunito', w: '600' },
  elegant: { head: 'Playfair Display', body: 'Inter', w: '700' },
  bold: { head: 'Oswald', body: 'Inter', w: '600' },
  clean: { head: 'Poppins', body: 'Inter', w: '600' },
  modern: { head: 'Space Grotesk', body: 'Inter', w: '700' },
  minimal: { head: 'DM Sans', body: 'DM Sans', w: '700' },
};

const SECTION_WORDS = {
  services: ['service', 'services', 'features', 'feature'],
  offer: ['menu', 'pricing', 'price', 'prices', 'plans', 'packages', 'courses', 'listings', 'products', 'projects', 'work'],
  gallery: ['gallery', 'photos', 'images', 'pictures'],
  reviews: ['testimonial', 'testimonials', 'reviews', 'review'],
  faq: ['faq', 'faqs', 'questions'],
  contact: ['contact', 'form', 'enquiry', 'inquiry'],
};
const ALL_SECTIONS = ['services', 'offer', 'gallery', 'reviews', 'faq', 'contact'];

const CITIES = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'gurugram', 'gurgaon', 'noida', 'pune', 'hyderabad', 'chennai', 'kolkata', 'jaipur', 'lucknow', 'patna', 'chandigarh', 'ahmedabad', 'indore', 'bhopal', 'goa', 'dehradun', 'kochi', 'surat', 'nagpur', 'london', 'dubai', 'new york', 'singapore'];

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/* --------------------------------------------------------------- parsing */

function findName(p) {
  const quoted = p.match(/["“'‘]([^"”'’]{2,40})["”'’]/);
  if (quoted) return quoted[1].trim();
  const m = p.match(/\b(?:called|named|name is)\s+([a-z0-9&' ]{2,30}?)(?=\s+(?:in|for|with|ki|ka|ke|mein|which|that|and)\b|[,.]|$)/i);
  if (m) return cap(m[1].trim());
  // Hinglish: "… Iron Pulse naam ki …" → take the words right before "naam", minus filler words
  const h = p.match(/((?:[a-z0-9&']+\s+){0,3}[a-z0-9&']+)\s+naam\s+(?:ki|ka|ke|se)\b/i);
  if (h) {
    const STOP = new Set(['ek', 'meri', 'mera', 'mere', 'website', 'site', 'banao', 'bana', 'do', 'ki', 'ka', 'ke', 'for', 'my', 'the', 'a', 'gym', 'bakery', 'shop', 'cafe', 'restaurant', 'salon', 'clinic', 'store']);
    const words = h[1].split(/\s+/);
    while (words.length && STOP.has(words[0].toLowerCase())) words.shift();
    if (words.length) return cap(words.join(' '));
  }
  return null;
}

export function parsePrompt(prompt) {
  const p = ` ${prompt.toLowerCase()} `;
  // business type: the category with the most keyword hits
  let cat = 'business';
  let best = 0;
  for (const [k, c] of Object.entries(CATS)) {
    const hits = c.keys.reduce((n, w) => n + (p.includes(` ${w}`) ? w.length : 0), 0);
    if (hits > best) {
      best = hits;
      cat = k;
    }
  }
  const base = CATS[cat];
  let color = base.color;
  for (const w of [...Object.keys(COLORS), ...Object.keys(COLOR_ALIAS)]) if (p.includes(` ${w}`)) color = COLOR_ALIAS[w] || w;
  const dark = /\b(dark|black|night|andhera)\b/.test(p) ? true : /\b(light|white|bright|safed)\b/.test(p) ? false : !!base.dark;
  let font = base.font;
  if (/\b(luxury|premium|elegant|classy)\b/.test(p)) font = 'elegant';
  else if (/\b(minimal|simple|clean)\b/.test(p)) font = 'minimal';
  else if (/\b(fun|playful|cute|kids)\b/.test(p)) font = 'playful';
  else if (/\b(bold|strong|sporty)\b/.test(p)) font = 'bold';
  const city = CITIES.find((c) => p.includes(` ${c}`));
  const asked = ALL_SECTIONS.filter((s) => SECTION_WORDS[s]?.some((w) => p.includes(` ${w}`)));
  const sections = ['services', 'offer', 'gallery', 'reviews', ...(asked.includes('faq') ? ['faq'] : []), 'contact'];
  return {
    cat,
    name: findName(prompt) || base.name,
    city: city ? cap(city) : 'your city',
    color,
    dark,
    font,
    radius: /\b(sharp|square|boxy)\b/.test(p) ? 4 : 18,
    sections,
  };
}

/* ---------------------------------------------------------------- edits */

/** Applies a follow-up instruction to a config. Returns { cfg, note }. */
export function applyEdit(cfg, text) {
  const p = ` ${text.toLowerCase()} `;
  const c = { ...cfg, sections: [...cfg.sections] };
  const notes = [];
  for (const w of [...Object.keys(COLORS), ...Object.keys(COLOR_ALIAS)]) {
    if (p.includes(` ${w}`)) {
      const col = COLOR_ALIAS[w] || w;
      if (col !== 'black' && col !== 'white') {
        c.color = col;
        notes.push(`colour → ${col}`);
        break;
      }
    }
  }
  if (/\b(dark|black|andhera|night)\b/.test(p)) (c.dark = true), notes.push('dark mode');
  if (/\b(light|white|safed|bright)\b/.test(p)) (c.dark = false), notes.push('light mode');
  for (const [f, words] of Object.entries({ elegant: ['luxury', 'premium', 'elegant', 'serif'], minimal: ['minimal', 'simple', 'clean'], playful: ['playful', 'fun', 'cute', 'rounded font'], bold: ['bold', 'sporty', 'strong'], modern: ['modern', 'techy', 'futuristic'] }))
    if (words.some((w) => p.includes(` ${w}`))) (c.font = f), notes.push(`${f} style`);
  if (/\b(sharp|square|boxy)\b/.test(p)) (c.radius = 4), notes.push('sharp corners');
  if (/\b(round|rounded|soft|gol)\b/.test(p)) (c.radius = 24), notes.push('rounded corners');

  const remove = /\b(remove|delete|hide|hata|hatao|hata do|nikal|without)\b/.test(p);
  const add = /\b(add|include|show|daal|dalo|daalo|jodo|lagao|with)\b/.test(p);
  for (const s of ALL_SECTIONS) {
    if (!SECTION_WORDS[s].some((w) => p.includes(` ${w}`))) continue;
    if (remove && c.sections.includes(s)) (c.sections = c.sections.filter((x) => x !== s)), notes.push(`removed ${s === 'offer' ? 'menu/pricing' : s}`);
    else if (add && !c.sections.includes(s)) {
      const order = ALL_SECTIONS;
      c.sections.push(s);
      c.sections.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      notes.push(`added ${s === 'offer' ? 'menu/pricing' : s}`);
    }
  }
  const rename = text.match(/\b(?:rename(?: it)? to|name(?: it)?|call it|naam(?: badal ke)?)\s+["“']?([^"”'.]{2,30})["”']?/i);
  if (rename) (c.name = cap(rename[1].trim().replace(/\s+(karo|kar do|rakho)$/i, ''))), notes.push(`renamed to ${c.name}`);
  const city = CITIES.find((x) => p.includes(` ${x}`));
  if (city) (c.city = cap(city)), notes.push(`city → ${cap(city)}`);
  for (const [k, cat] of Object.entries(CATS))
    if (k !== c.cat && /\b(make it|change to|switch to|banao|bana do)\b/.test(p) && cat.keys.some((w) => p.includes(` ${w}`))) {
      c.cat = k;
      notes.push(`type → ${k}`);
      break;
    }
  return { cfg: c, note: notes.length ? notes.join(', ') : null };
}

/* ------------------------------------------------------------- rendering */

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

export function renderSite(cfg) {
  const d = CATS[cfg.cat];
  const [h, s] = COLORS[cfg.color] || COLORS.blue;
  const f = FONTS[cfg.font] || FONTS.modern;
  const dark = cfg.dark;
  const P = `hsl(${h} ${s}% ${dark ? 62 : 52}%)`;
  const P2 = `hsl(${(h + 35) % 360} ${s}% ${dark ? 66 : 58}%)`;
  const BG = dark ? `hsl(${h} 18% 7%)` : `hsl(${h} 60% 98%)`;
  const CARD = dark ? `hsl(${h} 16% 12%)` : '#ffffff';
  const FG = dark ? `hsl(${h} 20% 95%)` : `hsl(${h} 25% 12%)`;
  const MUTED = dark ? `hsl(${h} 10% 68%)` : `hsl(${h} 10% 40%)`;
  const LINE = dark ? `hsl(${h} 14% 20%)` : `hsl(${h} 30% 90%)`;
  const r = cfg.radius;
  const name = esc(cfg.name);
  const has = (x) => cfg.sections.includes(x);
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.head)}:wght@400;${f.w}&family=${encodeURIComponent(f.body)}:wght@400;500;600&display=swap`;

  const offer = d.offer;
  let offerHtml = '';
  if (offer.type === 'menu')
    offerHtml = `<div class="menu">${offer.items.map(([n, pr]) => `<div class="mi"><span>${esc(n)}</span><i></i><b>${esc(pr)}</b></div>`).join('')}</div>`;
  else if (offer.type === 'pricing')
    offerHtml = `<div class="grid3">${offer.items
      .map(([n, pr, feats, hot]) => `<div class="card plan${hot ? ' hot' : ''}">${hot ? '<span class="badge">Most popular</span>' : ''}<h3>${esc(n)}</h3><p class="price">${esc(pr)}</p><ul>${feats.map((x) => `<li>✓ ${esc(x)}</li>`).join('')}</ul><a class="btn${hot ? '' : ' ghost'}" href="#contact">${esc(d.cta)}</a></div>`)
      .join('')}</div>`;
  else
    offerHtml = `<div class="grid2">${offer.items.map(([n, t], i) => `<div class="card proj"><div class="thumb" style="--i:${i}">${d.gallery[i % d.gallery.length]}</div><h3>${esc(n)}</h3><p>${esc(t)}</p></div>`).join('')}</div>`;

  const reviews = [
    ['Absolutely loved the experience — will definitely be back!', 'Priya S.'],
    ['Professional, friendly and worth every rupee.', 'Rahul M.'],
    [`Best ${cfg.cat === 'business' ? 'service' : cfg.cat} in ${esc(cfg.city)}, hands down.`, 'Ananya K.'],
  ];
  const faqs = [
    ['How do I get started?', `Just reach out through the form below or call us — we’ll take it from there.`],
    ['Do you offer discounts?', 'Yes — ask us about seasonal offers and packages.'],
    ['What are your timings?', 'Monday to Saturday, 9 am to 8 pm.'],
  ];

  const nav = [has('services') && ['#services', 'Services'], has('offer') && ['#offer', offer.title.split(' ').slice(-1)[0].replace(/^\w/, (c) => c.toUpperCase())], has('gallery') && ['#gallery', 'Gallery'], has('contact') && ['#contact', 'Contact']].filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${name} — ${esc(d.tag)}</title>
<meta name="description" content="${esc(d.about)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="${fontUrl}" rel="stylesheet" />
<style>
:root{--p:${P};--p2:${P2};--bg:${BG};--card:${CARD};--fg:${FG};--muted:${MUTED};--line:${LINE};--r:${r}px}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'${f.body}',system-ui,sans-serif;background:var(--bg);color:var(--fg);line-height:1.6}
h1,h2,h3{font-family:'${f.head}',system-ui,sans-serif;font-weight:${f.w};line-height:1.1}
a{color:inherit;text-decoration:none}
.wrap{max-width:1120px;margin:0 auto;padding:0 22px}
header{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:68px;gap:16px}
.logo{display:flex;align-items:center;gap:10px;font-family:'${f.head}';font-weight:${f.w};font-size:20px}
.logo span{display:grid;place-items:center;width:38px;height:38px;border-radius:calc(var(--r)*.6);background:linear-gradient(135deg,var(--p),var(--p2));font-size:20px}
nav{display:flex;gap:26px;font-size:15px;color:var(--muted)}nav a:hover{color:var(--fg)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:calc(var(--r)*1.5);background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;font-weight:600;box-shadow:0 10px 30px -10px var(--p);transition:transform .2s}
.btn:hover{transform:translateY(-2px)}.btn.ghost{background:transparent;color:var(--fg);border:1.5px solid var(--line);box-shadow:none}
.hero{padding:96px 0 80px;position:relative;overflow:hidden}
.hero:before{content:'';position:absolute;width:620px;height:620px;right:-160px;top:-180px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--p) 35%,transparent),transparent 70%)}
.hero .wrap{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;align-items:center;position:relative}
.pill{display:inline-block;padding:7px 14px;border-radius:999px;background:color-mix(in srgb,var(--p) 14%,transparent);color:var(--p);font-weight:600;font-size:13px;margin-bottom:18px}
.hero h1{font-size:clamp(40px,6vw,72px);letter-spacing:-.02em}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,var(--p),var(--p2));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{font-size:19px;color:var(--muted);margin:20px 0 32px;max-width:520px}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.art{aspect-ratio:1;border-radius:calc(var(--r)*2);background:linear-gradient(135deg,var(--p),var(--p2));display:grid;place-items:center;font-size:140px;box-shadow:0 40px 80px -30px var(--p);transform:rotate(3deg)}
section{padding:84px 0}
.head{text-align:center;max-width:620px;margin:0 auto 46px}.head h2{font-size:clamp(30px,4vw,44px)}.head p{color:var(--muted);margin-top:10px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:26px}
.card .ic{font-size:32px;width:58px;height:58px;display:grid;place-items:center;border-radius:calc(var(--r)*.7);background:color-mix(in srgb,var(--p) 14%,transparent);margin-bottom:16px}
.card h3{font-size:19px;margin-bottom:8px}.card p{color:var(--muted);font-size:15px}
.menu{max-width:720px;margin:0 auto;display:grid;gap:14px}
.mi{display:flex;align-items:baseline;gap:12px;font-size:18px}.mi i{flex:1;border-bottom:2px dotted var(--line)}.mi b{color:var(--p)}
.plan{position:relative;display:flex;flex-direction:column}.plan .price{font-family:'${f.head}';font-size:36px;font-weight:${f.w};color:var(--fg);margin:10px 0 16px}
.plan ul{list-style:none;display:grid;gap:8px;margin-bottom:24px;color:var(--muted)}.plan .btn{margin-top:auto}
.plan.hot{border:2px solid var(--p);transform:translateY(-8px)}.badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--p);color:#fff;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px}
.proj .thumb{aspect-ratio:16/10;border-radius:calc(var(--r)*.7);display:grid;place-items:center;font-size:64px;margin-bottom:16px;background:linear-gradient(calc(var(--i)*60deg + 120deg),var(--p),var(--p2))}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gallery div{aspect-ratio:4/3;border-radius:var(--r);display:grid;place-items:center;font-size:64px;background:linear-gradient(135deg,color-mix(in srgb,var(--p) 30%,var(--card)),color-mix(in srgb,var(--p2) 30%,var(--card)));transition:transform .3s}.gallery div:hover{transform:scale(1.03)}
.quote{font-size:17px}.quote b{display:block;margin-top:14px;color:var(--p)}.stars{color:#f5b301;margin-bottom:10px}
details{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px 22px;margin-bottom:12px}summary{cursor:pointer;font-weight:600}details p{color:var(--muted);margin-top:10px}
.contact{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
.contact form{display:grid;gap:12px}
input,textarea{width:100%;padding:14px 16px;border-radius:calc(var(--r)*.7);border:1px solid var(--line);background:var(--card);color:var(--fg);font:inherit}
.info p{margin-bottom:12px;color:var(--muted)}.info b{color:var(--fg)}
.cta{background:linear-gradient(135deg,var(--p),var(--p2));border-radius:calc(var(--r)*1.6);padding:56px 28px;text-align:center;color:#fff}.cta h2{font-size:clamp(28px,4vw,42px)}.cta .btn{background:#fff;color:#111;margin-top:22px}
footer{border-top:1px solid var(--line);padding:32px 0;color:var(--muted);font-size:14px}footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
@media(max-width:860px){.hero .wrap,.contact{grid-template-columns:1fr}.art{max-width:300px;font-size:110px}.grid4{grid-template-columns:repeat(2,1fr)}.grid3,.grid2{grid-template-columns:1fr}.plan.hot{transform:none}nav{display:none}.gallery{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.grid4{grid-template-columns:1fr}.hero{padding:64px 0}}
</style>
</head>
<body>
<header><div class="wrap"><a class="logo" href="#"><span>${d.icon}</span>${name}</a><nav>${nav.map(([hh, t]) => `<a href="${hh}">${t}</a>`).join('')}</nav><a class="btn" href="#contact">${esc(d.cta)}</a></div></header>

<section class="hero"><div class="wrap"><div><span class="pill">${d.icon} ${esc(cfg.city === 'your city' ? 'Now open' : `Now in ${cfg.city}`)}</span><h1>${name}: <em>${esc(d.tag)}</em></h1><p>${esc(d.about)}</p><div class="actions"><a class="btn" href="#contact">${esc(d.cta)} →</a>${has('offer') ? `<a class="btn ghost" href="#offer">${esc(offer.title)}</a>` : ''}</div></div><div class="art">${d.icon}</div></div></section>

${has('services') ? `<section id="services"><div class="wrap"><div class="head"><h2>Why ${name}?</h2><p>Everything you need, done right.</p></div><div class="grid4">${d.services.map(([ic, t, ds]) => `<div class="card"><div class="ic">${ic}</div><h3>${esc(t)}</h3><p>${esc(ds)}</p></div>`).join('')}</div></div></section>` : ''}

${has('offer') ? `<section id="offer"><div class="wrap"><div class="head"><h2>${esc(offer.title)}</h2><p>Picked with care — updated regularly.</p></div>${offerHtml}</div></section>` : ''}

${has('gallery') ? `<section id="gallery"><div class="wrap"><div class="head"><h2>Gallery</h2><p>A little peek inside ${name}.</p></div><div class="gallery">${d.gallery.map((g) => `<div>${g}</div>`).join('')}</div></div></section>` : ''}

${has('reviews') ? `<section><div class="wrap"><div class="head"><h2>Loved by customers</h2><p>Sample reviews — replace with your own.</p></div><div class="grid3">${reviews.map(([q, n]) => `<div class="card quote"><div class="stars">★★★★★</div>“${q}”<b>— ${n}</b></div>`).join('')}</div></div></section>` : ''}

${has('faq') ? `<section><div class="wrap" style="max-width:760px"><div class="head"><h2>FAQs</h2></div>${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>` : ''}

<section><div class="wrap"><div class="cta"><h2>Ready when you are.</h2><p>Let’s make it happen — reach out today.</p><a class="btn" href="#contact">${esc(d.cta)}</a></div></div></section>

${has('contact') ? `<section id="contact"><div class="wrap contact"><div class="info"><h2 style="font-size:40px;margin-bottom:18px">Get in touch</h2><p>📍 <b>${esc(cfg.city === 'your city' ? 'Your address here' : cfg.city)}</b></p><p>📞 <b>+91 98765 43210</b></p><p>✉️ <b>hello@${esc(cfg.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'example')}.com</b></p><p>🕘 Mon–Sat · 9 am – 8 pm</p></div><form onsubmit="event.preventDefault();this.innerHTML='<div class=card><h3>Thank you! 🎉</h3><p>We’ll get back to you shortly.</p></div>'"><input placeholder="Your name" required><input type="email" placeholder="Email" required><textarea rows="4" placeholder="How can we help?"></textarea><button class="btn" type="submit">Send message</button></form></div></section>` : ''}

<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${name}. All rights reserved.</span><span>Built with Rishav’s Site Builder</span></div></footer>
</body>
</html>`;
}

export const EXAMPLES = [
  ['🧁 Bakery', 'A cute bakery called "Sweet Crumbs" in Delhi with a pink theme and a menu'],
  ['🏋️ Gym', 'Dark, bold website for a gym named Iron Pulse in Gurugram with membership pricing'],
  ['🚀 Startup', 'Modern landing page for an AI startup called Nimbus with pricing and FAQ'],
  ['✨ Portfolio', 'Minimal portfolio website for a designer called Aarav Mehta, indigo colour'],
  ['🍽️ Restaurant', 'Luxury restaurant "The Spice Room" in Mumbai, orange theme, with gallery'],
  ['💇 Salon', 'Elegant beauty salon Glow Studio in Pune with price list and reviews'],
  ['🎓 Coaching', 'JEE coaching institute BrightPath Academy in Patna with courses, blue theme'],
  ['🏔️ Travel', 'Adventure travel agency Wanderlust Trails with Himalayan trek packages'],
];

export const describe = (cfg) =>
  `${cap(cfg.cat === 'business' ? 'business' : cfg.cat)} site · “${cfg.name}” · ${cfg.color} · ${cfg.dark ? 'dark' : 'light'} · ${cfg.font} font · ${cfg.sections.length} sections`;
