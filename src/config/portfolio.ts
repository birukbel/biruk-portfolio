import type { Flags, Item, ItemKind, Profile, SiteContent, Theme } from "@/lib/kinds";

/**
 * All site content lives here as typed defaults. They are used:
 *  1. as the seed data for the database (`npm run db:seed`), and
 *  2. as the fallback when the database is unreachable (the public site never breaks).
 *
 * Anything in {{DOUBLE_BRACES}} is a placeholder I could not verify. Replace it in /admin
 * (or here before seeding). Placeholders are hidden from visitors automatically.
 */

export const DEFAULT_LANG = "en" as const;
export const SITE_NAME = "Biruk Belete";

export const defaultProfile: Profile = {
  name: { en: "Biruk Belete", am: "ብሩክ በለጠ" },
  headline: {
    en: "Digital skills coach · IT systems · Youth empowerment",
    am: "የዲጂታል ክህሎት አሰልጣኝ · የአይቲ ሲስተሞች · የወጣቶች ማብቃት",
  },
  tagline: {
    en: "I help young people in Ethiopia turn digital skills, AI tools and data literacy into real opportunities.",
    am: "በኢትዮጵያ ያሉ ወጣቶች የዲጂታል ክህሎትን፣ የAI መሳሪያዎችን እና የዳታ እውቀትን ወደ እውነተኛ ዕድል እንዲቀይሩ እረዳለሁ።",
  },
  about: {
    en: "I am an Instant Network School (DIY) Coach at Amref Health Africa, where I run a youth digital centre at Atse Zereyakob Youth Center in Debre Berhan. I hold an MBA and a BSc in Computer Science, and my background combines IT systems with digital marketing.\n\nI like building practical things: bilingual websites with their own content management, AI-assisted content for children in an Ethiopian context, and training programmes that leave young people able to work, learn and earn online.",
    am: "በአምሬፍ ሄልዝ አፍሪካ የኢንስታንት ኔትወርክ ስኩል (DIY) አሰልጣኝ ሆኜ በደብረ ብርሃን አፄ ዘርዓያዕቆብ ወጣቶች ማዕከል የወጣቶች ዲጂታል ማዕከልን እመራለሁ። የMBA እና የኮምፒውተር ሳይንስ የመጀመሪያ ዲግሪ ያለኝ ሲሆን፣ ልምዴ የአይቲ ሲስተሞችን እና ዲጂታል ማርኬቲንግን ያጣምራል።\n\nተግባራዊ ነገሮችን መስራት እወዳለሁ፤ የራሳቸው የይዘት አስተዳደር ያላቸው ሁለት ቋንቋ ድረ ገጾች፣ በኢትዮጵያ አውድ በAI የታገዘ የህጻናት ይዘት፣ እና ወጣቶች በኢንተርኔት እንዲሰሩ፣ እንዲማሩ እና እንዲያገኙ የሚያስችሉ የስልጠና ፕሮግራሞች።",
  },
  location: { en: "Ethiopia", am: "ኢትዮጵያ" },
  availability: {
    en: "Open to project-based and full-time roles",
    am: "ለፕሮጀክት ላይ የተመሰረቱ እና ሙሉ ጊዜ ስራዎች ክፍት ነኝ",
  },
  email: "{{EMAIL}}",
  phone: "{{PHONE}}",
  linkedin: "{{LINKEDIN_URL}}",
  github: "{{GITHUB_URL}}",
  telegram: "{{TELEGRAM_URL}}",
  youtube: "{{YOUTUBE_URL}}",
  cvUrl: "",
  avatarUrl: "",
  heroImage: "",
};

export const defaultFlags: Flags = {
  services: true,
  projects: true,
  certifications: true,
  gallery: false,
  contactOpen: true,
};

export const defaultTheme: Theme = { accent: "#2dd4bf", accent2: "#f5b942" };

type Seed = { kind: ItemKind; data: Record<string, any> };

const seeds: Seed[] = [
  /* ------------------------------- services ------------------------------- */
  {
    kind: "service",
    data: {
      title: { en: "Digital skills training", am: "የዲጂታል ክህሎት ስልጠና" },
      summary: {
        en: "Practical coaching for youth on digital literacy, online work, AI tools and entrepreneurship.",
        am: "ለወጣቶች በዲጂታል እውቀት፣ በኦንላይን ስራ፣ በAI መሳሪያዎች እና በስራ ፈጠራ ላይ ተግባራዊ ስልጠና።",
      },
      icon: "learn",
    },
  },
  {
    kind: "service",
    data: {
      title: { en: "Web & CMS development", am: "የድረ ገጽ እና CMS ልማት" },
      summary: {
        en: "Fast, mobile-first, bilingual websites with an admin panel so owners can edit content from a phone.",
        am: "ባለቤቶች ይዘቱን ከስልካቸው ማስተካከል እንዲችሉ የአድሚን ፓኔል ያላቸው ፈጣን፣ ለስልክ የተመቹ ሁለት ቋንቋ ድረ ገጾች።",
      },
      icon: "code",
    },
  },
  {
    kind: "service",
    data: {
      title: { en: "IT systems support", am: "የአይቲ ሲስተም ድጋፍ" },
      summary: {
        en: "Setting up and maintaining the systems and tools small teams and youth centres depend on.",
        am: "አነስተኛ ቡድኖች እና የወጣቶች ማዕከላት የሚመኩባቸውን ሲስተሞች እና መሳሪያዎች ማዘጋጀት እና መጠበቅ።",
      },
      icon: "users",
    },
  },
  {
    kind: "service",
    data: {
      title: { en: "Digital marketing & AI content", am: "ዲጂታል ማርኬቲንግ እና AI ይዘት" },
      summary: {
        en: "Social media, content strategy and AI-assisted storytelling, with a focus on Ethiopian audiences.",
        am: "በኢትዮጵያ ተመልካቾች ላይ ትኩረት ያደረገ ማህበራዊ ሚዲያ፣ የይዘት ስትራቴጂ እና በAI የታገዘ ታሪክ አተራረክ።",
      },
      icon: "spark",
    },
  },

  /* ------------------------------ experience ------------------------------ */
  {
    kind: "experience",
    data: {
      role: { en: "Instant Network School (DIY) Coach", am: "የኢንስታንት ኔትወርክ ስኩል (DIY) አሰልጣኝ" },
      org: "Amref Health Africa",
      place: { en: "Debre Berhan, Ethiopia", am: "ደብረ ብርሃን፣ ኢትዮጵያ" },
      start: "{{START_YYYY-MM}}",
      end: "",
      summary: {
        en: "Run the youth digital centre at Atse Zereyakob Youth Center, coaching young people in digital skills and learning.",
        am: "በአፄ ዘርዓያዕቆብ ወጣቶች ማዕከል የወጣቶች ዲጂታል ማዕከልን በመምራት ወጣቶችን በዲጂታል ክህሎት እና በትምህርት አሰልጥናለሁ።",
      },
      bullets: {
        en: "Coach youth through the Instant Network School DIY programme\nManage day-to-day operation of the digital centre and its equipment\nTook part in youth sexual and reproductive health awareness activities with a nurse at the centre\n{{ADD_A_MEASURABLE_RESULT, e.g. number of youth trained}}",
        am: "ወጣቶችን በኢንስታንት ኔትወርክ ስኩል DIY ፕሮግራም አሰለጥናለሁ\nየዲጂታል ማዕከሉን እና መሳሪያዎቹን የዕለት ተዕለት ስራ እመራለሁ\nበማዕከሉ ከነርስ ጋር በወጣቶች የጾታ እና ተዋልዶ ጤና ግንዛቤ ስራዎች ተሳትፌያለሁ\n{{ሊለካ የሚችል ውጤት ያክሉ}}",
      },
    },
  },

  /* -------------------------------- projects ------------------------------- */
  {
    kind: "project",
    data: {
      title: { en: "Bilingual invitation site with built-in CMS", am: "አብሮ የተሰራ CMS ያለው ሁለት ቋንቋ የግብዣ ድረ ገጽ" },
      summary: {
        en: "A mobile-first Amharic and English invitation website for a family event. Family members edit schedule, photos and RSVPs from a phone through a custom /admin, with no redeploys.",
        am: "ለቤተሰብ ዝግጅት የተሰራ ለስልክ የተመቸ የአማርኛ እና እንግሊዝኛ የግብዣ ድረ ገጽ። የቤተሰብ አባላት መርሐ ግብሩን፣ ፎቶዎችን እና RSVP ከስልካቸው በራሱ /admin ያስተዳድራሉ።",
      },
      tags: ["Next.js", "TypeScript", "Postgres", "Drizzle", "Vercel Blob"],
      url: "",
      repo: "",
      image: "",
    },
  },
  {
    kind: "project",
    data: {
      title: { en: "Emaye's Tales: AI kids' stories", am: "የእማዬ ተረቶች፡ በAI የተሰሩ የህጻናት ታሪኮች" },
      summary: {
        en: "A YouTube Shorts channel concept of short animated stories for children set in an Ethiopian context, with lessons such as sharing, made with AI-assisted animation.",
        am: "እንደ መካፈል ያሉ ትምህርቶችን የሚያስተምሩ፣ በኢትዮጵያ አውድ የተቀመጡ እና በAI የታገዘ አኒሜሽን የተሰሩ አጫጭር የህጻናት ታሪኮች የYouTube Shorts ቻናል።",
      },
      tags: ["AI video", "Storytelling", "YouTube Shorts"],
      url: "{{YOUTUBE_CHANNEL_URL}}",
      repo: "",
      image: "",
    },
  },
  {
    kind: "project",
    data: {
      title: { en: "This portfolio and CMS", am: "ይህ ፖርትፎሊዮ እና CMS" },
      summary: {
        en: "The site you are on: content-driven, bilingual, with a password-protected admin, direct-to-storage uploads and database fallbacks so it never goes down with the database.",
        am: "አሁን ያሉበት ድረ ገጽ፡ በይዘት የሚመራ፣ ሁለት ቋንቋ፣ በይለፍ ቃል የተጠበቀ አድሚን፣ በቀጥታ ወደ ማከማቻ የሚሰቀል ፋይል እና ዳታቤዝ ቢቋረጥ እንኳ የማይሰበር ዲዛይን ያለው።",
      },
      tags: ["Next.js", "Tailwind", "Zod", "jose"],
      url: "",
      repo: "{{GITHUB_REPO_URL}}",
      image: "",
    },
  },

  /* --------------------------------- skills -------------------------------- */
  {
    kind: "skill",
    data: {
      group: { en: "Web & software", am: "ድረ ገጽ እና ሶፍትዌር" },
      items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "REST APIs", "Git & GitHub"],
    },
  },
  {
    kind: "skill",
    data: {
      group: { en: "AI & data", am: "AI እና ዳታ" },
      items: ["AI-assisted content", "Prompt design", "Data literacy", "Spreadsheets & reporting"],
    },
  },
  {
    kind: "skill",
    data: {
      group: { en: "IT systems", am: "የአይቲ ሲስተሞች" },
      items: ["Systems setup & support", "Networking basics", "Device & lab management"],
    },
  },
  {
    kind: "skill",
    data: {
      group: { en: "Digital marketing", am: "ዲጂታል ማርኬቲንግ" },
      items: ["Social media", "Content strategy", "Short-form video", "SEO basics"],
    },
  },
  {
    kind: "skill",
    data: {
      group: { en: "Coaching & leadership", am: "አሰልጣኝነት እና አመራር" },
      items: ["Youth mentoring", "Training facilitation", "Programme coordination", "Amharic & English"],
    },
  },

  /* ------------------------------- education ------------------------------- */
  {
    kind: "education",
    data: {
      degree: { en: "Master of Business Administration (MBA)", am: "የቢዝነስ አስተዳደር ማስተርስ (MBA)" },
      school: "CPU College",
      start: "",
      end: "{{YEAR}}",
      note: { en: "", am: "" },
    },
  },
  {
    kind: "education",
    data: {
      degree: { en: "BSc in Computer Science", am: "የኮምፒውተር ሳይንስ የመጀመሪያ ዲግሪ (BSc)" },
      school: "Wachemo University",
      start: "",
      end: "{{YEAR}}",
      note: { en: "", am: "" },
    },
  },

  /* ----------------------------- certifications ---------------------------- */
  {
    kind: "certification",
    data: {
      title: { en: "{{CERTIFICATE_TITLE}}", am: "{{የሰርተፊኬት ርዕስ}}" },
      issuer: "{{ISSUER}}",
      year: "{{YEAR}}",
      url: "",
    },
  },
];

export const defaultItems: Item[] = seeds.map((s, i) => ({
  id: `default-${i}`,
  kind: s.kind,
  visible: true,
  sortOrder: i,
  data: s.data,
}));

export const defaultContent: SiteContent = {
  profile: defaultProfile,
  flags: defaultFlags,
  theme: defaultTheme,
  items: defaultItems,
};

export const defaultSeeds = seeds;
