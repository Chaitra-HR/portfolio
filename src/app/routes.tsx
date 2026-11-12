import type { RouteObject } from 'react-router';
import HomePage from '../pages/Home/HomePage';
import { NotFound } from '../pages/NotFound/NotFound';
import { RootLayout } from './RootLayout';

export const loadAbout = () => import('../pages/About/AboutPage');
export const loadCaseStudy = () => import('../pages/CaseStudy/route');

/** The site's routes, shared by the browser router and the build-time prerender (src/entry-server.tsx). */
export const routes: RouteObject[] = [
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
];
