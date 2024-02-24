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



export const benchmark = (name = "default", calcMiddleRate = 10, fixedDigit = 4) => {
  let minimumtime = Infinity;
  let maximumtime = 0;
  let lasttime = 0;
  let calcMiddleIter = calcMiddleRate;

  const history = [];
  const middles = [];

  const A = () => lasttime = performance.now();

  const B = () => {
    const dt = performance.now() - lasttime;
    if (dt <= 0 && dt >= Infinity) {
      console.log("lol", dt);
      return;
    }
    calcMiddleIter--;
    history.push(dt);
    if (minimumtime > dt) minimumtime = dt;
    if (maximumtime < dt) maximumtime = dt;
    if (calcMiddleIter > 0) return;
    calcMiddleIter = calcMiddleRate;
    middles.push(middle(history));
    clear();
  }
  const fps = (time: number) => 1 / (time * 0.001);
  const clear = () => history.length = 0;
  const middle = (arr: number[]) => arr.reduce((acc, v) => acc += v, 0) / arr.length;
  const fixed = (num: number) => +num.toFixed(fixedDigit);
  const filter = (num: number) => num > 0 && num < Infinity;

  const resultsTime = () => ({
    name,
    min: fixed(minimumtime),
    max: fixed(maximumtime),
    middles: middles.filter(filter).map(fixed),
  });

  const resultsFps = () => ({
    name,
    maxFps: fixed(fps(minimumtime)),
    minFps: fixed(fps(maximumtime)),
    fps: fixed(fps(middle(middles))),
    middlesFps: middles.filter(filter).map(fps).map(fixed),
  })

  return { A, B, resultsTime, resultsFps };
}

