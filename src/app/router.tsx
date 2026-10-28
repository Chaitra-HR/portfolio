import { createBrowserRouter } from 'react-router';
import HomePage from '../pages/Home/HomePage';
import { NotFound } from '../pages/NotFound/NotFound';
import { introDone } from '../lib/intro';
import { RootLayout } from './RootLayout';

const loadAbout = () => import('../pages/About/AboutPage');
const loadCaseStudy = () => import('../pages/CaseStudy/route');

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: () => null,
    children: [
      // Home is the landing page, so it ships in the main bundle.
      { index: true, element: <HomePage /> },
      { path: 'about', lazy: async () => ({ Component: (await loadAbout()).default }) },
      { path: 'work/:slug', lazy: loadCaseStudy },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// Once the page is up, fetch the other pages in quiet moments, so moving between them is instant.
void introDone.then(() => {
  const idle = (fn: () => void) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 5000 }) : window.setTimeout(fn, 2500));
  idle(() => {
    void loadAbout();
    idle(() => void loadCaseStudy());
  });
});
