import type { PortfolioConfig } from "@/types";

/**
 * ============================================================
 *  EDIT EVERYTHING HERE — the whole website reads from this file
 * ============================================================
 */

export const portfolio: PortfolioConfig = {
  profile: {
    name: "Dipson Lamsal",
    greeting: "Hello, I'm",
    roles: ["Creator", "Developer", "Digital Explorer"],
    headline: "I build immersive digital experiences.",
    intro:
      "I'm passionate about technology, digital creativity, content creation, and building things that stand out.",
    about:
      "Hi, I'm Dipson Lamsal. I'm a creative and technology-focused individual interested in web development, content creation, digital media, and emerging technologies. I enjoy learning new skills, experimenting with ideas, and turning concepts into real projects.",
    location: "Based in Nepal · Working worldwide",
    availability: "Open for collaborations & freelance work",
    email: "lamsaldipson2099@gmail.com",
    resumeLabel: "Explore My Work",
  },

  nav: [
    { label: "Home", target: "home" },
    { label: "About", target: "about" },
    { label: "Capabilities", target: "capabilities" },
    { label: "Journey", target: "journey" },
    { label: "Projects", target: "projects" },
    { label: "Services", target: "services" },
    { label: "Contact", target: "contact" },
  ],

  stats: [
    { value: 10, suffix: "+", label: "Projects", description: "Shipped & experimenting" },
    { value: 5, suffix: "+", label: "Technologies", description: "Across web, AI & media" },
    { value: 100, suffix: "%", label: "Curiosity", description: "Always asking why" },
    { value: 24, suffix: "/7", label: "Learning", description: "Never offline" },
  ],

  skills: [
    { name: "Web Development", value: 85, note: "React · TypeScript · Html · CSS ·" },
    { name: "Python", value: 65, note: "Scripting & automation" },
    { name: "Data analytic", value: 80, note: "Insights from raw data" },
    { name: "Vibe coding", value: 90, note: "Fast, intuitive building" },
    { name: "AI ", value: 90, note: "Automation, prompts, workflows" },
    { name: "Video Editing", value: 68, note: "Short form & cinematic" },
    { name: "Content Creation", value: 78, note: "Story-first publishing" },
    { name: "Creative Design", value: 82, note: "Visual systems & taste" },
  ],

  timeline: [
    {
      year: "2023",
      title: "Started exploring digital creation",
      description:
        "First steps into content creation, design tools and the world of building things for the web.",
      glyph: "✦",
    },
    {
      year: "2024",
      title: "Learned web development and content creation",
      description:
        "Dove into HTML, CSS and JavaScript while publishing content and learning how to tell stories online.",
      glyph: "◆",
    },
    {
      year: "2025",
      title: "Started building larger digital projects",
      description:
        "Moved from experiments to real products — full sites, tools and multi-platform creative work.",
      glyph: "▲",
    },
    {
      year: "2026",
      title: "Exploring AI, 3D web experiences and advanced creative projects",
      description:
        "Building immersive 3D interfaces, AI-powered workflows and cinematic digital experiences.",
      glyph: "◉",
    },
  ],

  projects: [
    {
      title: "Nebula Interface",
      description:
        "A cinematic 3D landing experience with a real-time particle field, scroll-driven camera moves and a fully reactive hero object.",
      technologies: ["React", "Three.js", "R3F", "TypeScript"],
      link: "#",
      tag: "2026",
      gradient: ["#22d3ee", "#6366f1"],
      glyph: "◉",
    },
    {
      title: "Signal Analytics",
      description:
        "A lightweight analytics dashboard that turns messy spreadsheets into clean, readable visual stories.",
      technologies: ["Python", "Data", "Charts"],
      link: "#",
      tag: "2025",
      gradient: ["#a78bfa", "#ec4899"],
      glyph: "◧",
    },
    {
      title: "Creator Studio",
      description:
        "A content-planning workspace for short-form creators: scripts, shot lists and publishing rhythm in one place.",
      technologies: ["AI Tools", "Video", "Design"],
      link: "#",
      tag: "2025",
      gradient: ["#34d399", "#22d3ee"],
      glyph: "◈",
    },
    {
      title: "Orbit Portfolio",
      description:
        "An experimental scroll narrative where each section is a planet in a small interactive solar system.",
      technologies: ["Three.js", "GSAP-style", "CSS"],
      link: "#",
      tag: "2024",
      gradient: ["#f59e0b", "#ef4444"],
      glyph: "◎",
    },
    {
      title: "Prompt Forge",
      description:
        "A personal library of tested AI prompts and workflows, organised by outcome instead of by tool.",
      technologies: ["AI Tools", "JSON", "Python"],
      link: "#",
      tag: "2024",
      gradient: ["#38bdf8", "#818cf8"],
      glyph: "✳",
    },
    {
      title: "Echo Visuals",
      description:
        "A series of motion experiments syncing generative visuals with music — built fully in the browser.",
      technologies: ["WebGL", "Audio", "Motion"],
      link: "#",
      tag: "2023",
      gradient: ["#f472b6", "#a855f7"],
      glyph: "❋",
    },
  ],

  services: [
    {
      icon: "◱",
      title: "Web Development",
      description:
        "Fast, responsive and accessible websites built with modern React, TypeScript ... and clean architecture.",
      bullets: ["React - TypeScript - Vibecoding", "Html - CSS - Javascript", "Responsive by default", "Performance first"],
    },
    {
  icon: "◈",
  title: "Data Analytics",
  description:
    "Turning complex data into clear, actionable insights through analysis, visualisation and data-driven decision making.",
  bullets: ["Data Visualisation", "Statistical Analysis", "Insights & Reporting"],
},
    {
      icon: "✎",
      title: "Content Creation",
      description:
        "Story-driven content for social platforms, from idea and script through to publish-ready delivery.",
      bullets: ["Ideation & scripts", "Short form", "AI Generated"],
    },
    {
      icon: "◈",
      title: "AI & Technology",
      description:
        "AI-assisted workflows, automation and smart tooling that turn slow manual work into instant output.",
      bullets: ["Prompt systems", "Automation", "AI integrations"],
    },
    {
      icon: "✦",
      title: "Creative Projects",
      description:
        "Experimental builds, generative visuals and playful concepts that explore what the web can feel like.",
      bullets: ["Generative art", "Interaction design", "Vibe coded"],
    },
  ],

  socials: [
    {
      name: "Email",
      handle: "lamsaldipson2099@gmail.com",
      url: "https://mail.google.com/mail/?view=cm&fs=1&to=lamsaldipson2099@gmail.com",
      icon: "✉",
      accent: "#22d3ee",
    },
    {
      name: "Instagram",
      handle: "@dipsonlamsal",
      url: "https://instagram.com/",
      icon: "🅾",
      accent: "#ec4899",
    },
    {
      name: "GitHub",
      handle: "@lamsaldipson",
      url: "https://github.com/lamsaldipson",
      icon: "◇",
      accent: "#a78bfa",
    },

  ],
};

/** Convenience exports so components can import only what they need. */
export const { profile, nav, stats, skills, timeline, projects, services, socials } = portfolio;
