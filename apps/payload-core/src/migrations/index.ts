import * as migration_20251221_225940 from './20251221_225940';
import * as migration_20251225_014610 from './20251225_014610';

export const migrations = [
  {
    up: migration_20251221_225940.up,
    down: migration_20251221_225940.down,
    name: '20251221_225940',
  },
  {
    up: migration_20251225_014610.up,
    down: migration_20251225_014610.down,
    name: '20251225_014610'
  },
];
