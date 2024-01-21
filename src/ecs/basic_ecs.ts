import { Imutable } from '../common/types';

/* Component */
export type Schema = Object; // TODO: restrict type
export type Storage<T> = { [K in keyof T]: T[K][] };
export class Component<T extends Schema> {
  readonly schema: Imutable<Schema>;
  readonly storage: Imutable<Storage<T>>;
  private nextIndex: number = 0;
  constructor(schema: T) {
    this.schema = schema;
    this.storage = Object
      .keys(schema)
      .reduce((acc, key) => ({ ...acc, [key]: [] }), {} as Storage<T>);
  }
  add(data: T): number {
    const { storage, nextIndex: idx } = this;
    for (const key in storage) storage[key][idx] = data[key];
    this.nextIndex++;
    return idx;
  }
  delete(idx: number): number {
    const { storage } = this;
    for (const key in storage) delete storage[key][idx];
    return idx;
  }
  get(idx: number): T {
    const { storage } = this;
    const element: any = {};
    for (const key in storage) element[key] = storage[key][idx];
    return element;
  }
  set(idx: number, data: T): number {
    const { storage } = this;
    for (const key in storage) storage[key][idx] = data[key];
    return idx;
  }
}

/* System */
export type SystemHandler<T> = (components: T, entities: number[]) => void;
export class System<T extends Record<string, Component<any>>> {
  constructor(
    readonly components: T,
    private handler: SystemHandler<T>,
    private entities: number[] = [],
  ) { }
  exec() {
    return this.handler(this.components, this.entities);
  }
  update(world: any) {
    // logic to fetch new entities
    // just for time sake i will create another method to force adding entities
    // and this is a question where this logic should be: here or in the world:
    // the main point is a best way to: "how query entities by archetype"
    // another solution is no use event-driven approach:
    //    on delete, or components update - notify systems
  }
  add(...entities: number[]) {
    this.entities.push(...entities);
  }
  set(...entities: number[]) {
    this.entities = entities;
  }
  remove(...entities: number[]) {
    this.entities = this.entities.filter(e => !entities.includes(e));
  }
}
