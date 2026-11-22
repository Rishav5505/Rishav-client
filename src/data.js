import cybervigil from './assets/w_cybervigil_thumb.webp';
import wavygo from './assets/w_wavygo_thumb.webp';
import hrms from './assets/w_hrms_final.webp';
import safar from './assets/w_SafarChaska_Thumb.webp';
import therapy from './assets/w_Therpy_Web_Full.webp';
import oasis from './assets/w_Oasis_ERP_Full.webp';
import jal from './assets/w_JalConnect_Thumb.webp';
import labour from './assets/w_LabourChowk_Thumb.webp';
import fresh from './assets/w_FreshPlant_Thumb.webp';
import nexus from './assets/w_nexus_thumb.webp';

const base = import.meta.env.BASE_URL;

export const profile = {
  name: 'Rishav Kumar',
  role: 'AI Research Engineer',
  company: 'Ethara AI',
  location: 'Gurugram, India',
  email: 'rishavkumar33372@gmail.com',
  phone: '+91 95082 87609',
  phoneHref: 'tel:+919508287609',
  github: 'https://github.com/Rishav5505',
  githubUser: 'Rishav5505',
  linkedin: 'https://www.linkedin.com/in/rishav5505/',
  form: 'https://forms.gle/PY15yq5JVvo2TS5H9',
  resume: `${base}assets/pdfs/Rishav_Kumar_Resume.pdf`,
};

export const stats = [
  { value: '20+', label: 'Web products shipped' },
  { value: '100+', label: 'Docker images built for LLM evals' },
  { value: '2+', label: 'Years building production code' },
  { value: '12+', label: 'Certifications & awards' },
];

export const projects = [
  {
    id: 'cybervigil',
    overview: 'A sleek, modern cybersecurity dashboard featuring high-tech ecosystem interfaces, advanced data visualisations and live threat web maps — built to give security teams a clear, real-time picture at a glance.',
    features: [{ t: 'Live threat maps', d: 'Global attack origins and targets plotted on an interactive map.' }, { t: 'Cyber dashboard', d: 'Risk score, event status and alerts in one command-centre view.' }, { t: 'Data visualisation', d: 'Network traffic and system-health charts that update in real time.' }],
    filters: ['Dashboards', 'UI/UX'],
    title: 'CyberVigil',
    kicker: 'Security ecosystem',
    category: 'Cyber Security',
   
    image: cybervigil,
    description:
      'A cybersecurity command centre with live threat maps, risk scoring and real-time data visualisation for security teams.',
    tags: ['React', 'Data Viz', 'UI/UX'],
    url: 'https://final-year-ten-delta.vercel.app/',
  },
  {
    id: 'nexus',
    overview: 'Nexus is a team workspace for planning, tracking and shipping work — projects, tasks and team flow brought into one home. Built as a full-stack coding assignment, with separate experiences for team members and admins.',
    features: [{ t: 'Role-based access', d: 'Distinct sign-in and permissions for team members and admins.' }, { t: 'Projects & tasks', d: 'Plan work, assign tasks and track progress across the team.' }, { t: 'Polished onboarding', d: 'A modern sign-in flow with social login options and one-click demo access.' }],
    filters: ['Full-Stack', 'Dashboards', 'UI/UX'],
    title: 'Nexus',
    kicker: 'Team task manager',
    category: 'Productivity SaaS',
    image: nexus,
    description:
      'A team workspace to plan, track and ship work — projects, tasks and role-based access for members and admins.',
    tags: ['TypeScript', 'Full-Stack', 'Auth & Roles'],
    url: 'https://nexus-ethara-assignment.vercel.app/',
  },
  {
    id: 'wavygo',
    overview: 'Experience pure freedom with WavyGo — a premium platform for luxury motorcycle rentals, with a sleek mint-green UI, a curated fleet and seamless web booking.',
    features: [{ t: 'Premium rentals', d: 'A curated fleet catalogue with specs and pricing per bike.' }, { t: 'Mint design UI', d: 'A distinctive, polished visual identity across the whole flow.' }, { t: 'Live booking', d: 'Real-time availability and a smooth booking journey.' }],
    filters: ['Full-Stack', 'Booking'],
    title: 'WavyGo',
    kicker: 'Premium bike rentals',
    category: 'Full Stack',
   
    image: wavygo,
    description:
      'A luxury motorcycle rental platform with a fleet catalogue, real-time availability and a seamless booking flow.',
    tags: ['React', 'Tailwind', 'Booking'],
    url: 'https://wavy-go.vercel.app/',
  },
  {
    id: 'hrms',
    overview: 'An enterprise-ready human resource management system with employee onboarding, automated payroll, attendance tracking, self-service portals and real-time analytics.',
    features: [{ t: 'Employee dashboards', d: 'Self-service portals for every employee.' }, { t: 'Payroll logic', d: 'Automated payroll calculation and management.' }, { t: 'Department stats', d: 'Real-time analytics across teams and departments.' }],
    filters: ['Full-Stack', 'Dashboards'],
    title: 'HRMS Lite',
    kicker: 'Workforce management',
    category: 'Enterprise SaaS',
   
    image: hrms,
    description:
      'An HR suite with automated payroll, attendance tracking, onboarding and employee self-service portals.',
    tags: ['React', 'Node.js', 'Payroll'],
    url: 'https://hrm-comapny.vercel.app/',
  },
  {
    id: 'safar',
    overview: 'A premium travel platform for Himalayan adventures — handcrafted journeys, adventure packages and booking management, wrapped in an immersive interface.',
    features: [{ t: 'Travel booking', d: 'Seamless booking integration for every journey.' }, { t: 'Package discovery', d: 'Browse handcrafted itineraries and adventure packages.' }, { t: 'Premium UI', d: 'Rich imagery and an experience that sells the destination.' }],
    filters: ['Booking', 'UI/UX'],
    title: 'Safar Chaska',
    kicker: 'Himalayan travel',
    category: 'Travel & Tourism',
   
    image: safar,
    description:
      'A travel brand platform for handcrafted Himalayan journeys — package discovery, itineraries and booking.',
    tags: ['React', 'Tailwind', 'Booking'],
    url: 'https://safar-chaska.vercel.app/',
  },
  {
    id: 'therapy',
    overview: 'Mind Mend — a complete teletherapy platform with secure authentication, therapy booking, mood tracking and AI-driven insights, plus real-time consultation and patient management.',
    features: [{ t: 'Live video sessions', d: 'Real-time consultations powered by Socket.IO and Jitsi.' }, { t: 'Mood tracking', d: 'Clients log their mood and see AI-driven insights over time.' }, { t: 'Appointment system', d: 'Therapy booking with secure JWT authentication.' }],
    filters: ['Full-Stack', 'Real-time'],
    title: 'Therpy',
    kicker: 'Mental wellness',
    category: 'HealthTech',
   
    image: therapy,
    description:
      'A teletherapy platform with secure auth, session booking, live video consultations, mood tracking and AI insights.',
    tags: ['MERN', 'Socket.IO', 'Jitsi'],
    url: 'https://therpy-web-4anr.vercel.app',
  },
  {
    id: 'oasis',
    overview: 'An advanced educational resource planning system with multi-role dashboards, fee management, exam cycles and student portals.',
    features: [{ t: 'Fee management', d: 'Track and manage fees for every student.' }, { t: 'Exam cycles', d: 'Plan and run examination cycles end-to-end.' }, { t: 'Student portals', d: 'Multi-role dashboards for students, staff and admins.' }],
    filters: ['Full-Stack', 'Dashboards'],
    title: 'Oasis ERP',
    kicker: 'Education resource planning',
    category: 'EdTech',
   
    image: oasis,
    description:
      'A school ERP with multi-role dashboards, fee management, exam cycles and student portals.',
    tags: ['React', 'Node.js', 'MongoDB'],
    url: 'https://oasispatna-ejbz.vercel.app',
  },
  {
    id: 'jal',
    overview: 'A smart water distribution and management system for real-time monitoring of tank levels, with leak detection and automated alerts.',
    features: [{ t: 'IoT dashboard', d: 'Live tank levels from connected sensors.' }, { t: 'Real-time stats', d: 'Distribution metrics as they happen.' }, { t: 'Leak detection', d: 'Automated alerts when something looks wrong.' }],
    filters: ['Real-time', 'Dashboards'],
    title: 'JalConnect',
    kicker: 'Smart water systems',
    category: 'IoT · Utility',
   
    image: jal,
    description:
      'Smart water distribution monitoring — live tank levels, leak detection and automated alerts.',
    tags: ['IoT', 'MERN', 'Real-time'],
    url: 'https://water-distubution-system.vercel.app/',
  },
  {
    id: 'labour',
    overview: 'An enterprise-grade administrative dashboard for managing the workforce, job assignments and real-time attendance tracking.',
    features: [{ t: 'Workforce management', d: 'Manage workers and their details in one place.' }, { t: 'Job tracking', d: 'Assign jobs and follow them through to completion.' }, { t: 'Analytics', d: 'Attendance and workforce insights at a glance.' }],
    filters: ['Dashboards'],
    title: 'Labour Chowk',
    kicker: 'Workforce admin',
    category: 'Admin Dashboard',
   
    image: labour,
    description:
      'An operations dashboard for managing workers, job assignments and real-time attendance analytics.',
    tags: ['React', 'Tailwind', 'Analytics'],
    url: 'https://dashbord-labour.vercel.app/',
  },
  {
    id: 'fresh',
    overview: 'A modern e-commerce platform for high-quality indoor and outdoor plants, featuring a glassmorphism design and a seamless shopping experience.',
    features: [{ t: 'E-commerce', d: 'A complete storefront from browsing to checkout.' }, { t: 'Glassmorphism', d: 'A light, modern visual language throughout.' }, { t: 'Product catalogue', d: 'Well-organised plant categories and product pages.' }],
    filters: ['E-commerce', 'UI/UX'],
    title: 'Fresh Plant',
    kicker: 'Nursery e-commerce',
    category: 'E-commerce',
   
    image: fresh,
    description:
      'A modern storefront for indoor and outdoor plants with a refined catalogue and smooth checkout experience.',
    tags: ['React', 'E-commerce', 'UI/UX'],
    url: 'https://newplant-fresh.vercel.app/',
  },
];

export const projectFilters = ['All', 'Full-Stack', 'Dashboards', 'Booking', 'Real-time', 'E-commerce', 'UI/UX'];

export const services = [
  {
    title: 'AI Research & Model Evaluation',
    body: 'RL environments, agent evaluations, LLM & frontier-model benchmarking, dataset curation and post-training pipelines.',
  },
  {
    title: 'Full-Stack Product Development',
    body: 'End-to-end web apps with React, Node.js and Python — from interface to API to database.',
  },
  {
    title: 'Automation & DevOps',
    body: 'Containerised services with Docker, CI/CD, validation suites and pipelines that run at scale.',
  },
  {
    title: 'Backend & API Design',
    body: 'Secure, scalable server logic — REST APIs, JWT/OAuth auth, middleware and optimised data models.',
  },
  {
    title: 'QA & Performance',
    body: 'Rigorous testing for bugs, bottlenecks, cross-browser behaviour and pixel-perfect responsive design.',
  },
];

export const experience = [
  {
    period: 'Oct 2026 — Present',
    role: 'AI Research Engineer',
    org: 'Ethara AI · Promoted from Software Engineer',
    body: 'AI research and post-training evaluation of large language models across multiple repositories — benchmark evaluation pipelines, model performance analysis and dataset quality validation, plus improvements to the reliability and reproducibility of evaluation infrastructure.',
  },
  {
    period: 'Jul 2026 — Sep 2026',
    role: 'Software Engineer',
    org: 'Ethara AI · Full-time (PPO)',
    body: 'Joined full-time through a Pre-Placement Offer. Worked on LLM evaluation and benchmarking workflows; built and validated 100+ multi-architecture Docker images for large-scale evaluation; evaluated model performance, golden patches and dataset quality.',
  },
  {
    period: 'Jan 2026 — Jun 2026',
    role: 'LLM Post-Training Intern',
    org: 'Ethara AI · Internship',
    body: 'Contributed to post-training evaluation and benchmarking pipelines for large language models.',
  },
  {
    period: 'Mar 2025 — Jun 2025',
    role: 'Full Stack Developer Intern',
    org: 'Xebia · Xcelerate Live Project',
    body: 'Developed a survey application with React Native, Node.js, Express.js and MongoDB in an Agile team — sprint planning, collaboration and code reviews.',
  },
  {
    period: '2022 — 2026',
    role: 'B.Tech, Computer Science & Engineering',
    org: 'K.R. Mangalam University · Full Stack Development',
    body: 'Specialisation in full-stack development, software architecture and enterprise technologies.',
  },
  {
    period: '2022',
    role: 'Senior Secondary Education (PCM)',
    org: 'Sir Ganesh Dutt Inter Memorial College',
    body: 'Physics, Chemistry and Mathematics.',
  },
];

export const stack = [
  { group: 'AI Research', items: ['LLM Evaluation', 'Post-Training Eval', 'Benchmark Validation', 'Dataset Quality', 'RL Environments', 'Agent Evals'] },
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Bash'] },
  { group: 'Frontend', items: ['React', 'React Native', 'Redux', 'Tailwind CSS', 'Bootstrap'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'OAuth / JWT', 'Socket.IO'] },
  { group: 'Data & Cloud', items: ['MongoDB', 'MySQL', 'PostgreSQL', 'AWS'] },
  { group: 'DevOps & Tools', items: ['Docker', 'Git / GitHub', 'Linux', 'CI/CD', 'Postman', 'Figma'] },
]

export const marquee = [
  'React', 'Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL',
  'RL Environments', 'Agent Evals', 'Frontier Model Evaluation', 'TypeScript', 'Tailwind', 'Socket.IO', 'CI/CD',
];

export const certifications = [
  { title: 'Microsoft Azure Developer Solutions', issuer: 'Microsoft', file: null, type: 'listed' },
  { title: 'Full Stack Web Development Internship', issuer: 'Xebia IT Architects', file: `${base}assets/pdfs/Internship_Letter.pdf`, type: 'pdf' },
  { title: 'Microsoft Learn Student Ambassador', issuer: 'Microsoft', file: `${base}assets/certs/Microsoft_Ambassador.jpg`, type: 'image' },
  { title: 'NASSCOM Certification', issuer: 'NASSCOM', file: `${base}assets/pdfs/Certificate_1.pdf`, type: 'pdf' },
  { title: 'Advanced Python', issuer: 'Professional Academy', file: `${base}assets/pdfs/Certificate_2.pdf`, type: 'pdf' },
  { title: 'Drone Technology Bootcamp', issuer: 'IIT Mandi', file: `${base}assets/pdfs/Drone_Certificate.pdf`, type: 'pdf' },
  { title: 'TechOdyssey — National Technical Symposium', issuer: 'Technical Society', file: `${base}assets/pdfs/TechOdyssey_Certificate.pdf`, type: 'pdf' },
  { title: 'SNAP Photography Award', issuer: 'K.R. Mangalam University', file: `${base}assets/certs/Photography_Certificate.jpg`, type: 'image' },
];

export const resumeData = {
  summary:
    'Full Stack Developer and AI Research Engineer with experience in scalable web applications, Large Language Model (LLM) evaluation, post-training workflows and benchmark infrastructure. Skilled in the MERN stack, Python, Docker, Git and Linux, with hands-on experience building benchmark evaluation pipelines and validating multi-architecture container images.',
  roles: [
    {
      role: 'AI Research Engineer',
      org: 'Ethara.AI',
      note: 'Promoted from Software Engineer',
      period: 'Oct 2026 – Present',
      bullets: [
        'Contribute to AI research and post-training evaluation of Large Language Models (LLMs) across multiple repositories.',
        'Work on benchmark evaluation pipelines, model performance analysis and dataset quality validation.',
        'Support reproducible AI evaluation workflows and improvements to benchmark reliability and infrastructure.',
      ],
    },
    {
      role: 'Software Engineer',
      org: 'Ethara.AI',
      note: 'Full-Time – PPO',
      period: 'Jul 2026 – Sep 2026',
      bullets: [
        'Worked on LLM evaluation and benchmarking workflows across multiple repositories.',
        'Built and validated 100+ multi-architecture Docker images for large-scale evaluation workflows.',
        'Evaluated model performance, golden patches and dataset quality using benchmark validation pipelines.',
      ],
    },
    {
      role: 'LLM Post-Training Intern',
      org: 'Ethara.AI',
      note: 'Internship',
      period: 'Jan 2026 – Jun 2026',
      bullets: ['Contributed to post-training evaluation and benchmarking pipelines for Large Language Models.'],
    },
    {
      role: 'Full Stack Developer Intern',
      org: 'Xcelerate Live Project, Xebia',
      note: 'Internship',
      period: 'Mar 2025 – Jun 2025',
      bullets: [
        'Developed a survey application using React Native, Node.js, Express.js and MongoDB.',
        'Worked in an Agile environment involving sprint planning, team collaboration and code reviews.',
      ],
    },
  ],
  skills: [
    ['Programming Languages', 'JavaScript, TypeScript, Java, Python, Bash'],
    ['Frontend', 'HTML5, CSS3, React, React Native, Bootstrap, Tailwind CSS, Redux'],
    ['Backend', 'Node.js, Express.js, REST APIs, OAuth, JWT'],
    ['Databases', 'MongoDB, MySQL'],
    ['AI/ML', 'LLM Evaluation, Post-Training Evaluation, Benchmark Validation, Dataset Quality Analysis'],
    ['DevOps / Tools', 'Docker, Git, GitHub, Linux, CI/CD, AWS, Postman, Figma'],
  ],
  projects: [
    {
      name: 'Mind Mend – Full Stack Developer (MERN Stack)',
      period: '2025 – Present',
      bullets: [
        'Built a teletherapy platform with authentication, therapy booking, mood tracking and AI insights.',
        'Tech stack: React.js, Tailwind CSS, Node.js, Express.js, MongoDB, JWT.',
      ],
    },
    {
      name: 'Blockchain-Based Secure Health Record System',
      period: '2024 – 2025',
      bullets: ['Developed a decentralized medical record system using Ethereum smart contracts.', 'Enabled secure sharing and tamper-proof storage of patient records.'],
    },
  ],
  education: [
    { name: 'B.Tech in Computer Science & Engineering', place: 'K.R. Mangalam University, Gurugram', note: 'Full Stack Development', period: '2022 – 2026' },
    { name: 'Senior Secondary Education (PCM)', place: 'Sir Ganesh Dutt Inter Memorial College', note: '', period: '2022' },
  ],
  achievements: ['Built and validated 100+ benchmark container images across multiple repositories.', 'Contributed to large-scale AI model evaluation and benchmark validation workflows.'],
  certifications: [
    ['Microsoft Azure Developer Solutions', 'Microsoft'],
    ['Drone Technology Bootcamp', 'IIT Mandi'],
  ],
};
