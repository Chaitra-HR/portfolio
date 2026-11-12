import { createBrowserRouter } from 'react-router';
import { introDone } from '../lib/intro';
import { loadAbout, loadCaseStudy, routes } from './routes';

export const router = createBrowserRouter(routes);

// Once the page is up, fetch the other pages in quiet moments, so moving between them is instant.
void introDone.then(() => {
  const idle = (fn: () => void) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 5000 }) : window.setTimeout(fn, 2500));
  idle(() => {
    void loadAbout();
    idle(() => void loadCaseStudy());
  });
});
