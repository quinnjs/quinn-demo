export default class Todo {
  static getPropertyNames() {
    return [
      'id', 'label', 'done', 'createdAt', 'updatedAt'
    ];
  }

  constructor({ id, label, done, createdAt, updatedAt }) {
    if (!label || typeof label !== 'string') {
      throw new Error('Too lazy for proper validation');
    }

    this.id = id;
    this.label = label;
    this.done = !!done;
    this.createdAt = (createdAt && new Date(createdAt)) || new Date();
    this.updatedAt = (updatedAt && new Date(updatedAt)) || new Date();
  }
};
