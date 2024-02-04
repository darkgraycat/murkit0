import { Imutable } from "../common/types";

/* EntityManager */
export class EntityManager<T extends Record<string, Component<any>>> {
  private idx = 0;
  constructor(
    private components: T,
  ) {}

  add<K extends keyof T>(components: Record<K, typeof this.components[K]["schema"]>): number {
    const entries = Object.entries(components);
    for (const [componentName, componentData] of entries){
      this.components[componentName].set(this.idx, componentData);
    }
    return this.idx++;
  }

  set<K extends keyof T>(entity: number, components: Record<K, typeof this.components[K]["schema"]>): void {
    const entries = Object.entries(this.components);
    for (const [componentName, component] of entries) {
      component.set(entity, components?.[componentName])
    }
  }

  get(entity: number) {
    const entries = Object.entries(this.components);
    const result: any = {};
    for (const [componentName, component] of entries){
      result[componentName] = component.get(entity);
    }
    return result;
  }

  reset(): void {
    const components = Object.values(this.components);
    for (const component of components) component.reset();
    this.idx = 0;
  }
}

/* Component */
export type Storage<T> = { [K in keyof T]: T[K][] };
export class Component<T> {
  readonly schema: Imutable<T>;
  readonly storage: Imutable<Storage<T>>;
  constructor(schema: T) {
    this.schema = schema;
    this.storage = Object.keys(schema).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as Storage<T>,
    );
  }

  get(idx: number): T {
    const { storage } = this;
    const element: any = {};
    for (const prop in storage) element[prop] = storage[prop][idx];
    return element;
  }

  set(idx: number, data: T): number {
    const { storage } = this;
    for (const prop in storage) storage[prop][idx] = data?.[prop];
    return idx;
  }

  reset(): void {
    const { storage } = this;
    for (const prop in storage) storage[prop].length = 0;
  }
}

/* System */
export type SystemHandler<T> = (
  dt: number,
  components: T,
  ...entities: number[][]
) => void;

export type SystemCallback = (dt?: number) => void;

export class System<T extends Record<string, Component<any>>> {
  constructor(
    readonly components: T,
    private handler: SystemHandler<T>,
  ) {}

  setup(...entities: number[][]): SystemCallback {
    return (dt) => this.handler(dt, this.components, ...entities);
  }
}
