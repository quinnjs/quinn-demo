import connectDatabase from 'knex';

import dbSettings from '../knexfile';

const db = connectDatabase(dbSettings.development);

export default db;
