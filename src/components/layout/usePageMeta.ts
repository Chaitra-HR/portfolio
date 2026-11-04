import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { site } from '../../data/site';

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
 * cards, and robots. index.html ships the home values for crawlers that don't run scripts.
 */
export function usePageMeta(title: string, description: string, { noindex = false } = {}) {
  const { pathname } = useLocation();
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
  }, [title, description, noindex, pathname]);
}
