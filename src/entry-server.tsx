/**
 * Build-time prerender entry (not part of the browser bundle). scripts/prerender.mjs builds this with
 * `vite build --ssr` and calls render() for every public page, so crawlers and non-JS tools get each page's
 * real headings, copy and links in the HTML. In the browser, src/main.tsx renders the app afresh exactly as before.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routes } from './app/routes';
import { PageMetaCollector, type PageMeta } from './components/layout/usePageMeta';
import { caseStudies, caseStudyPath, sideProjects } from './data/projects';
import { site } from './data/site';
import { caseStudyPages } from './work';

export { caseStudies, caseStudyPath, sideProjects, site };

/** Every public, indexable page. */
export const pages = ['/', '/about', ...caseStudies.filter((p) => caseStudyPages[p.slug]).map((p) => caseStudyPath(p.slug))];

export interface Rendered {
  html: string;
  meta: PageMeta | null;
  status: number;
}

export async function render(pathname: string): Promise<Rendered> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(site.url + pathname));
  if (context instanceof Response) throw new Error(`${pathname} redirected (${context.status}); only prerender final URLs`);
  const router = createStaticRouter(handler.dataRoutes, context);
  let meta: PageMeta | null = null;
  const html = renderToString(
    <StrictMode>
      <PageMetaCollector.Provider value={(m) => (meta = m)}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </PageMetaCollector.Provider>
    </StrictMode>,
  );
  return { html, meta, status: context.statusCode };
}
