import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router';

export type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Route paths ("/about") without a file extension go through the router. */
const isRoute = (href: string) => href.startsWith('/') && !/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0]);

/**
 * One link component for the whole site: client-side routing for internal
 * paths, a new tab for http(s) links, a plain anchor for everything else.
 */
export function SmartLink({ href, ...rest }: SmartLinkProps) {
  if (isRoute(href)) return <Link to={href} {...rest} />;
  const external = /^https?:\/\//.test(href);
  return <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)} {...rest} />;
}
