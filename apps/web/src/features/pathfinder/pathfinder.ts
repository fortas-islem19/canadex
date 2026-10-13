import type { ServiceId } from '@canadex/shared';

export const QUESTIONS = {
  goal: ['study', 'work', 'settle', 'visit', 'family'],
  language: ['fr', 'en', 'both', 'none'],
  education: ['bac', 'licence', 'master', 'pro'],
} as const;

export type QuestionId = keyof typeof QUESTIONS;
export const QUESTION_ORDER: QuestionId[] = ['goal', 'language', 'education'];

export type Answers = { [Q in QuestionId]?: (typeof QUESTIONS)[Q][number] };
export type TipId =
  'french' | 'english' | 'learning' | 'degree' | 'bac' | 'trade' | 'visit' | 'family';

const SERVICE_FOR_GOAL: Record<(typeof QUESTIONS)['goal'][number], ServiceId> = {
  study: 'study',
  work: 'work',
  settle: 'immigration',
  visit: 'visit',
  family: 'family',
};

/** Maps quiz answers to a consultation and the tips worth showing. Pure, so it is easy to test. */
export function recommend(answers: Answers): { service: ServiceId; tips: TipId[] } {
  const goal = answers.goal ?? 'study';
  const tips: TipId[] = [];

  if (goal === 'visit' || goal === 'family') tips.push(goal);

  if (answers.language === 'fr' || answers.language === 'both') tips.push('french');
  else if (answers.language === 'en') tips.push('english');
  else tips.push('learning');

  if (goal !== 'visit' && goal !== 'family') {
    if (answers.education === 'bac') tips.push('bac');
    else if (answers.education === 'pro') tips.push('trade');
    else tips.push('degree');
  }

  return { service: SERVICE_FOR_GOAL[goal], tips };
}
