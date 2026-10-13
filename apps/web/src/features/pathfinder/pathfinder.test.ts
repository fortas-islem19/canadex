import { describe, expect, it } from 'vitest';
import { recommend } from './pathfinder';

describe('recommend', () => {
  it('sends francophone graduates who want to settle to permanent residence', () => {
    expect(recommend({ goal: 'settle', language: 'fr', education: 'master' })).toEqual({
      service: 'immigration',
      tips: ['french', 'degree'],
    });
  });

  it('suggests studying first to baccalaureate holders', () => {
    expect(recommend({ goal: 'study', language: 'none', education: 'bac' })).toEqual({
      service: 'study',
      tips: ['learning', 'bac'],
    });
  });

  it('skips diploma tips for visitors and families', () => {
    expect(recommend({ goal: 'visit', language: 'en', education: 'pro' })).toEqual({
      service: 'visit',
      tips: ['visit', 'english'],
    });
    expect(recommend({ goal: 'family', language: 'both' }).tips).toEqual(['family', 'french']);
  });
});
