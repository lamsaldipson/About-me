/**
 * Central type definitions for the portfolio.
 * Everything the site renders is typed here so that editing
 * `src/data/portfolio.ts` stays safe and autocompleted.
 */

/** A single capability / skill shown in the radar chart + bar list. */
export interface Skill {
  /** Display name, e.g. "Web Development" */
  name: string;
  /** Proficiency in percent (0 - 100) */
  value: number;
  /** Optional short note shown under the bar list */
  note?: string;
}

/** A featured project card. */
export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link: string;
  /** Short label such as "2026" or "Case Study" */
  tag?: string;
  /** Two hex colours used for the card's generated artwork */
  gradient?: [string, string];
  /** Large glyph / emoji rendered on the card artwork */
  glyph?: string;
}

/** One entry of the interactive journey timeline. */
export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  /** Emoji or short glyph rendered inside the timeline node */
  glyph?: string;
}

/** A service / "what I do" card. */
export interface Service {
  icon: string;
  title: string;
  description: string;
  bullets?: string[];
}

/** An animated statistic. */
export interface Stat {
  /** Numeric part that gets counted up, e.g. 10 */
  value: number;
  /** Rendered before the number, e.g. "+" prefix is `suffix`, so use prefix for "24" -> "" */
  prefix?: string;
  /** Rendered after the number, e.g. "+", "%", "/7" */
  suffix?: string;
  label: string;
  description?: string;
}

/** A social / contact channel. */
export interface SocialLink {
  name: string;
  /** What is displayed under the name, e.g. "@dipson" */
  handle: string;
  url: string;
  /** Inline glyph used as the icon */
  icon: string;
  /** Optional accent colour for the hover glow */
  accent?: string;
}

/** Navigation item. */
export interface NavItem {
  label: string;
  /** DOM id of the target section (without the leading "#") */
  target: string;
}

/** The complete editable configuration object. */
export interface PortfolioConfig {
  profile: {
    name: string;
    greeting: string;
    roles: string[];
    headline: string;
    intro: string;
    about: string;
    location: string;
    availability: string;
    email: string;
    resumeLabel: string;
  };
  nav: NavItem[];
  stats: Stat[];
  skills: Skill[];
  timeline: TimelineEntry[];
  projects: Project[];
  services: Service[];
  socials: SocialLink[];
}
