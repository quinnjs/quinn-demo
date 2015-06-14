import { mapKeys, snakeCase, isEmpty, pick } from 'lodash';
import { Inject } from 'nilo';

import Todo from './model';

function toDbSelector(property) {
  const column = snakeCase(property);
  if (column === property) return property;
  return `${column} as ${property}`;
}

function toRow(obj) {
  return mapKeys(obj, (v, k) => snakeCase(k));
}

@Inject('db')
export default class TodoStore {
  constructor(db) {
    this.db = db;
    this.columns = Todo.getPropertyNames().map(toDbSelector);
  }

  table() {
    return this.db('todos');
  }

  query() {
    return this.table().column(this.columns);
  }

  async create(props) {
    const model = new Todo(props);
    const [ insertId ] = await this.table().insert(toRow(model));

    return this.show(insertId);
  }

  async list() {
    const rows = await this.query().select();
    return rows.map(row => new Todo(row));
  }

  async show(id) {
    const row = await this.query().first().where({ id });
    return row && new Todo(row);
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
