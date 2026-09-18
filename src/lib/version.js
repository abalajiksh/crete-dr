// The current version has exactly one source: the newest entry in the release
// history. Bumping a release means adding to releases.js and nothing else —
// there is no second place that can fall out of step with it.
import { releases } from './releases.js';

export const version = releases[0].version;
