import * as migration_20260827_121507_initial from './20260827_121507_initial';
import * as migration_20260827_124416_about_block_fields from './20260827_124416_about_block_fields';
import * as migration_20260827_131518_drop_sliding_text_block from './20260827_131518_drop_sliding_text_block';
import * as migration_20260827_131539_hero_block_fields from './20260827_131539_hero_block_fields';
import * as migration_20260827_135139_marquee_block_fields from './20260827_135139_marquee_block_fields';
import * as migration_20260827_135911_numbers_block_fields from './20260827_135911_numbers_block_fields';
import * as migration_20260827_140834_four_way_test_block_fields from './20260827_140834_four_way_test_block_fields';
import * as migration_20260827_141547_presidents_message_block_fields from './20260827_141547_presidents_message_block_fields';

export const migrations = [
  {
    up: migration_20260827_121507_initial.up,
    down: migration_20260827_121507_initial.down,
    name: '20260827_121507_initial',
  },
  {
    up: migration_20260827_124416_about_block_fields.up,
    down: migration_20260827_124416_about_block_fields.down,
    name: '20260827_124416_about_block_fields',
  },
  {
    up: migration_20260827_131518_drop_sliding_text_block.up,
    down: migration_20260827_131518_drop_sliding_text_block.down,
    name: '20260827_131518_drop_sliding_text_block',
  },
  {
    up: migration_20260827_131539_hero_block_fields.up,
    down: migration_20260827_131539_hero_block_fields.down,
    name: '20260827_131539_hero_block_fields',
  },
  {
    up: migration_20260827_135139_marquee_block_fields.up,
    down: migration_20260827_135139_marquee_block_fields.down,
    name: '20260827_135139_marquee_block_fields',
  },
  {
    up: migration_20260827_135911_numbers_block_fields.up,
    down: migration_20260827_135911_numbers_block_fields.down,
    name: '20260827_135911_numbers_block_fields',
  },
  {
    up: migration_20260827_140834_four_way_test_block_fields.up,
    down: migration_20260827_140834_four_way_test_block_fields.down,
    name: '20260827_140834_four_way_test_block_fields',
  },
  {
    up: migration_20260827_141547_presidents_message_block_fields.up,
    down: migration_20260827_141547_presidents_message_block_fields.down,
    name: '20260827_141547_presidents_message_block_fields'
  },
];
