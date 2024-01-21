export class ContinualList<T> {
  constructor(
    readonly schema: T,
    readonly data: T[] = [],
    private next = [0],
  ) { }

  push(...es: T[]): number[] {
    const inserted: number[] = [];
    for (const e of es) {
      const i = this.next.pop() || this.data.length;
      this.data[i] = e || this.schema;
      inserted.push(i);
      // TODO: rewrite to efficient fast and elegant
      // we can use capacity to allocate memory at init
      if (this.next.length == 0) this.next.push(this.data.length);
    }
    return inserted;
  }

  delete(...is: number[]): number[] {
    for (const i of is) {
      // because we cant store nulls
      this.data[i] = this.schema;
      this.next.push(i);
    }
    return is;
  }

  // set data(e: T) {
  //   this
  // }
  //
  get length(): number {
    return this.data.length - this.vacant.length + 1;
  }

  get vacant(): number[] {
    return this.next;
  }
}

// or maybe we can do this?
export class ContinualArray extends Array {

}
