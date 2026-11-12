import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import './styles/tokens.css';
import './styles/global.css';
import './styles/animations.css';

const root = document.getElementById('root')!;
// Each page's HTML carries a prerendered copy of the page for crawlers and non-JS tools (scripts/prerender.mjs),
// held invisible by index.html. The app renders afresh in its place, exactly as it always has.
if (root.hasAttribute('data-prerendered')) {
  root.replaceChildren();
  root.removeAttribute('data-prerendered');
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
