import * as migration_20261119_171646_initial from './20261119_171646_initial';
import * as migration_20261119_174518_single_site from './20261119_174518_single_site';
import * as migration_20261119_182329_users_auth_defaults from './20261119_182329_users_auth_defaults';

export const migrations = [
  {
    up: migration_20261119_171646_initial.up,
    down: migration_20261119_171646_initial.down,
    name: '20261119_171646_initial',
  },
  {
    up: migration_20261119_174518_single_site.up,
    down: migration_20261119_174518_single_site.down,
    name: '20261119_174518_single_site',
  },
  {
    up: migration_20261119_182329_users_auth_defaults.up,
    down: migration_20261119_182329_users_auth_defaults.down,
    name: '20261119_182329_users_auth_defaults'
  },
];
