export default class Todo {
  constructor({ id, label, createdAt, updatedAt }) {
    if (!label || typeof label !== 'string') {
      throw new Error('Too lazy for proper validation');
    }

    this.id = id;
    this.label = label;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  toRow() {
    return {
      id: this.id,
      label: this.label,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  static fromRow({ id, label, created_at, updated_at }) {
    return new Todo({
      id, label,
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at)
    });
  }
};
