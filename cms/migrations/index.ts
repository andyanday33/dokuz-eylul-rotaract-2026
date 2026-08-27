import * as migration_20260827_121507_initial from './20260827_121507_initial';

export const migrations = [
  {
    up: migration_20260827_121507_initial.up,
    down: migration_20260827_121507_initial.down,
    name: '20260827_121507_initial'
  },
];
