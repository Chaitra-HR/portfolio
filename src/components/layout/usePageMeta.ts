import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router';
import { site } from '../../data/site';

export interface PageMeta {
  title: string;
  description: string;
  noindex: boolean;
}

/** The address the page arrived on, as its prerendered HTML states it. */
const initialUrl = typeof document === 'undefined' ? '' : (document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '');

/**
 * Set only by the build-time prerender (src/entry-server.tsx): the page records its tags here while it renders,
 * so the prerendered HTML ships each page's own title, description and canonical. Unused in the browser.
 */
export const PageMetaCollector = createContext<((meta: PageMeta) => void) | null>(null);

function setMeta(selector: string, content: string) {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps the page's SEO tags in step with the route: title, description, canonical URL, Open Graph and Twitter
 * cards, and robots. The prerender writes the same values into each page's HTML for crawlers that don't run scripts.
 */
export function usePageMeta(title: string, description: string, { noindex = false } = {}) {
  const { pathname } = useLocation();
  useContext(PageMetaCollector)?.({ title, description, noindex });
  useEffect(() => {
    const url = site.url + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setLink('canonical', url);
    // the prerendered page's own structured data describes the page it arrived on; drop it once the visitor moves on
    if (url !== initialUrl) document.head.querySelectorAll('script[data-page-ld]').forEach((el) => el.remove());
  }, [title, description, noindex, pathname]);
}
