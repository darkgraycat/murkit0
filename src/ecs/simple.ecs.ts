import { Imutable } from "../common/types";

export type ComponentList<T> = Record<string, Component<T>>;

/* EntityManager */
export class EntityManager<C extends ComponentList<any>> {
  private idx = 0;
  /** Create new Entity Manager
  * @param components components dictionary */
  constructor(private components: C) {}

  /** Add new entity with properties for components
  * @param components components entity have
  * @returns entity index */
  add<K extends keyof C>(components: Record<K, typeof this.components[K]["schema"]>): number {
    const entries = Object.entries(components);
    for (const [componentName, component] of entries){
      this.components[componentName].set(this.idx, component);
    }
    return this.idx++;
  }

  /** Assign new properties for components for entity
  * @param idx entity index
  * @param components new components values */
  set<K extends keyof C>(idx: number, components: { [P in K]: C[P]["schema"] }): void {
    const entries = Object.entries(this.components);
    for (const [componentName, component] of entries) {
      component.set(idx, components?.[componentName] || {})
    }
  }

  /** Build readonly object of all entity components
  * @param idx entity index
  * @returns readonly entity object */
  get<K extends keyof C>(idx: number): Imutable<{ [P in K]: C[P]["schema"] }> {
    const entries = Object.entries(this.components);
    const result = {} as { [P in K]: C[P]["schema"] };
    for (const [componentName, component] of entries){
      result[componentName] = component.get(idx);
    }
    return result;
  }

  /** Reset Entity Manager and remove all entities data */
  reset(): void {
    const components = Object.values(this.components);
    for (const component of components) component.reset();
    this.idx = 0;
  }
}

/* Component */
export type Storage<T> = { [K in keyof T]: T[K][] };
export class Component<T extends Object> {
  readonly schema: Imutable<T>;
  readonly storage: Imutable<Storage<T>>;
  /** Create new Component
  * @param schema Plain object with properties */
  constructor(schema: T) {
    this.schema = schema;
    this.storage = Object.keys(schema).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as Storage<T>,
    );
  }

  /** Build readonly object of Component element
  * @param idx entity index
  * @returns readonly Component object */
  get(idx: number): Imutable<T> {
    const { storage } = this;
    const element = {} as T;
    for (const prop in storage) element[prop] = storage[prop][idx];
    return element;
  }

  /** Assign new values for Component element
  * @param idx entity index
  * @param data new values
  * @returns entity index */
  set(idx: number, data: T): number {
    const { storage } = this;
    for (const prop in storage) storage[prop][idx] = data[prop] || this.schema[prop];
    return idx;
  }

  /** Reset Component storage */
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
  /** Create new System
  * @param components components to use in the System
  * @param handler callback with access to components */
  constructor(
    readonly components: T,
    private handler: SystemHandler<T>,
  ) {}

  /** Create callback to execute the System
  * @param entityGroups array of entity groups assigned to the System
  * @returns callback */
  setup(...entityGroups: number[][]): SystemCallback {
    return (dt) => this.handler(dt, this.components, ...entityGroups);
  }
}
