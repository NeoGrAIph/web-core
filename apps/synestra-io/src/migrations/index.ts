import * as migration_20251225_132621 from './20251225_132621';
import * as migration_20251226_065403 from './20251226_065403';

export const migrations = [
  {
    up: migration_20251225_132621.up,
    down: migration_20251225_132621.down,
    name: '20251225_132621',
  },
  {
    up: migration_20251226_065403.up,
    down: migration_20251226_065403.down,
    name: '20251226_065403'
  },
];
