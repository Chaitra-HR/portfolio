/**
 * Presentation registry: which art and which case-study page each project
 * slug has. Metadata stays in src/data/projects.ts.
 */
import type { ComponentType } from 'react';
import type { CaseStudyProject } from '../data/projects';
import { ComplianceCover } from './compliance-trust/Cover';
import { FinScribeCover } from './finscribe/Cover';
import { GatherCover } from './gather/Cover';
import { ReframeCover } from './reframe/Cover';
import { ScreenEduCover } from './screenedu/Cover';
import type { ArtProps } from './types';
import { WebsiteCover } from './website-revamp/Cover';

interface WorkArt {
  /** Home tile and side-project art; also shown in miniature under More case studies. */
  Cover: ComponentType<ArtProps>;
}

export const workArt: Record<string, WorkArt> = {
  gather: { Cover: GatherCover },
  finscribe: { Cover: FinScribeCover },
  'compliance-trust': { Cover: ComplianceCover },
  'website-revamp': { Cover: WebsiteCover },
  screenedu: { Cover: ScreenEduCover },
  reframe: { Cover: ReframeCover },
};

interface CaseStudyProps {
  project: CaseStudyProject;
}

type CaseStudyModule = { default: ComponentType<CaseStudyProps> };

/**
 * Case-study pages, loaded on demand (one chunk per study). A project without
 * an entry here is listed on Home but has no page yet.
 */
export const caseStudyPages: Record<string, () => Promise<CaseStudyModule>> = {
  gather: () => import('./gather/GatherCaseStudy'),
  finscribe: () => import('./finscribe/FinScribeCaseStudy'),
  'compliance-trust': () => import('./compliance-trust/ComplianceCaseStudy'),
  'website-revamp': () => import('./website-revamp/WebsiteCaseStudy'),
};
