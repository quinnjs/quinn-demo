import { mapKeys, snakeCase, isEmpty, pick } from 'lodash';

import db from '../db';

function toDbSelector(property) {
  const column = snakeCase(property);
  if (column === property) return property;
  return `${column} as ${property}`;
}

function toRow(obj) {
  return mapKeys(obj, (v, k) => snakeCase(k));
}

export default class Store {
  constructor(tableName, Model) {
    this.tableName = tableName;
    this.Model = Model;
    this.columns = Model.getPropertyNames().map(toDbSelector);
  }

  table() {
    return db(this.tableName);
  }

  query() {
    return this.table().column(this.columns);
  }

  async create(props) {
    const model = new this.Model(props);
    const [ insertId ] = await this.table().insert(toRow(model));

    return this.show(insertId);
  }

  async list() {
    const rows = await this.query().select();
    return rows.map(row => new this.Model(row));
  }

  async show(id) {
    const row = await this.query().first().where({ id });
    return row && new this.Model(row);
  }

  async update(id, rawChanges) {
    const changes = toRow(pick(rawChanges, prop => prop !== undefined));

    if (!isEmpty(changes)) {
      changes.updated_at = new Date();

      const changedRows = await this.table().where({ id }).update(changes);
      if (changedRows === 0) return;
    }

    return this.show(id);
  }
}
