import * as migration_20251215_083817 from './20251215_083817';

export const migrations = [
  {
    up: migration_20251215_083817.up,
    down: migration_20251215_083817.down,
    name: '20251215_083817'
  },
];
