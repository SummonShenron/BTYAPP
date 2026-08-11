import { useEffect } from 'react';

const SITE_NAME = 'BTY Fitness';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.btyfitness.app').replace(/\/$/, '');
const DEFAULT_DESCRIPTION =
  'BTY Fitness by Madison Spear offers personalized strength coaching, biomechanics-focused training, and consultation sessions to help you build sustainable results.';

type SeoEntry = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

const SEO_BY_PATH: Record<string, SeoEntry> = {
  '/': {
    title: 'BTY Fitness | Madison Spear',
    description: 'Better Than Yesterday Fitness by Madison Spear. Explore coaching programs, consultations, and performance-focused training.',
    path: '/',
  },
  '/home': {
    title: 'Personal Training Programs | BTY Fitness',
    description: 'Discover BTY Fitness coaching programs built around biomechanics, strength progression, and sustainable performance.',
    path: '/home',
  },
  '/programs': {
    title: 'Coaching Programs | BTY Fitness',
    description: 'Compare BTY coaching options including private training, duo sessions, and online hybrid programs.',
    path: '/programs',
  },
  '/consultation': {
    title: 'Book a Consultation | BTY Fitness',
    description: 'Start with a personalized consultation to map your goals, movement needs, and custom coaching plan.',
    path: '/consultation',
  },
  '/book': {
    title: 'Book a Session | BTY Fitness',
    description: 'Schedule your BTY training session and get expert guidance tailored to your goals and experience level.',
    path: '/book',
  },
  '/about': {
    title: 'About Madison Spear | BTY Fitness',
    description: 'Learn about Madison Spear, BTY Fitness founder, and her coaching philosophy centered on long-term progress.',
    path: '/about',
  },
  '/qualifications': {
    title: 'Qualifications | BTY Fitness',
    description: 'Review coaching credentials, certifications, and training methodology behind BTY Fitness programs.',
    path: '/qualifications',
  },
  '/testimonials': {
    title: 'Client Testimonials | BTY Fitness',
    description: 'Read real client outcomes and experiences from BTY Fitness coaching and training programs.',
    path: '/testimonials',
  },
  '/merch': {
    title: 'Merchandise | BTY Fitness',
    description: 'Browse BTY apparel and gear designed for training comfort and everyday performance.',
    path: '/merch',
  },
  '/admin': {
    title: 'Coach Portal | BTY Fitness',
    description: 'Admin dashboard for BTY Fitness operations.',
    path: '/admin',
    noindex: true,
  },
};

function ensureMeta(selector: string, create: () => HTMLMetaElement): HTMLMetaElement {
  const existing = document.head.querySelector(selector);
  if (existing instanceof HTMLMetaElement) {
    return existing;
  }
  const node = create();
  document.head.appendChild(node);
  return node;
}

function ensureCanonical(): HTMLLinkElement {
  const existing = document.head.querySelector('link[rel="canonical"]');
  if (existing instanceof HTMLLinkElement) {
    return existing;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', 'canonical');
  document.head.appendChild(link);
  return link;
}

function ensureJsonLdScript(): HTMLScriptElement {
  const existing = document.getElementById('bty-localbusiness-jsonld');
  if (existing instanceof HTMLScriptElement) {
    return existing;
  }
  const script = document.createElement('script');
  script.id = 'bty-localbusiness-jsonld';
  script.type = 'application/ld+json';
  document.head.appendChild(script);
  return script;
}

function buildCanonical(path: string): string {
  if (path === '/' || path === '') {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}${path}`;
}

function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Better Than Yesterday Fitness',
    alternateName: 'BTY Fitness',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo192.png`,
    description: DEFAULT_DESCRIPTION,
    areaServed: 'United States',
    founder: {
      '@type': 'Person',
      name: 'Madison Spear',
    },
    knowsAbout: [
      'Strength Training',
      'Biomechanics',
      'Personal Training',
      'Online Coaching',
    ],
  };
}

export default function SeoManager({ pathname }: { pathname: string }) {
  useEffect(() => {
    const entry = SEO_BY_PATH[pathname] || {
      title: 'BTY Fitness | Madison Spear',
      description: DEFAULT_DESCRIPTION,
      path: pathname || '/',
    };

    const fullTitle = entry.title.includes(SITE_NAME) ? entry.title : `${entry.title} | ${SITE_NAME}`;
    const canonicalUrl = buildCanonical(entry.path);

    document.title = fullTitle;

    const descriptionMeta = ensureMeta('meta[name="description"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      return meta;
    });
    descriptionMeta.setAttribute('content', entry.description);

    const robotsMeta = ensureMeta('meta[name="robots"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      return meta;
    });
    robotsMeta.setAttribute('content', entry.noindex ? 'noindex, nofollow' : 'index, follow');

    const ogTitle = ensureMeta('meta[property="og:title"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    });
    ogTitle.setAttribute('content', fullTitle);

    const ogDescription = ensureMeta('meta[property="og:description"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    });
    ogDescription.setAttribute('content', entry.description);

    const ogType = ensureMeta('meta[property="og:type"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      return meta;
    });
    ogType.setAttribute('content', 'website');

    const ogUrl = ensureMeta('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    });
    ogUrl.setAttribute('content', canonicalUrl);

    const twitterCard = ensureMeta('meta[name="twitter:card"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'twitter:card');
      return meta;
    });
    twitterCard.setAttribute('content', 'summary_large_image');

    const canonical = ensureCanonical();
    canonical.setAttribute('href', canonicalUrl);

    const jsonLd = ensureJsonLdScript();
    jsonLd.text = JSON.stringify(buildLocalBusinessSchema());
  }, [pathname]);

  return null;
}
