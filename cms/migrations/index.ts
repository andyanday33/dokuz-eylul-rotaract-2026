import * as migration_20260827_112602_initial from './20260827_112602_initial';

export const migrations = [
  {
    up: migration_20260827_112602_initial.up,
    down: migration_20260827_112602_initial.down,
    name: '20260827_112602_initial'
  },
];
