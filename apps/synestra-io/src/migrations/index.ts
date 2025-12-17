import * as migration_20251215_083817 from './20251215_083817';
import * as migration_20251217_224500 from './20251217_224500';

export const migrations = [
  {
    up: migration_20251215_083817.up,
    down: migration_20251215_083817.down,
    name: '20251215_083817'
  },
  {
    up: migration_20251217_224500.up,
    down: migration_20251217_224500.down,
    name: '20251217_224500'
  },
];
