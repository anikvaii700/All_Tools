import { StoryMetadata } from '../golpoGhorData';
import { romanceStories } from './romance';
import { horrorStories } from './horror';
import { mysteryStories } from './mystery';
import { thrillerStories } from './thriller';
import { comedyStories } from './comedy';
import { familyStories } from './family';
import { inspirationalStories } from './inspirational';
import { childrenStories } from './children';
import { moralStories } from './moral';
import { classicStories } from './classic';
import { shortStoryStories } from './short-story';
import { novelSeriesStories } from './novel-series';

export const ALL_STORIES: StoryMetadata[] = [
  ...romanceStories,
  ...horrorStories,
  ...mysteryStories,
  ...thrillerStories,
  ...comedyStories,
  ...familyStories,
  ...inspirationalStories,
  ...childrenStories,
  ...moralStories,
  ...classicStories,
  ...shortStoryStories,
  ...novelSeriesStories
];
