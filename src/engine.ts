import { IAdapter } from "./common/types";

export type EngineHandler = (dt: number, time: number) => void;

export class Engine {
  protected timestamp: number = 0;
  protected running: boolean = false;

  constructor(
    protected adapter: IAdapter,
    protected rate: number,
    protected update: EngineHandler,
    protected render: EngineHandler,
    readonly deltaCoef: number = 0.05,
  ) {}

  async tick() {
    while (this.running) {
      const now = this.adapter.now();
      const dt = (now - this.timestamp) * this.deltaCoef;
      const time = now * this.deltaCoef;
      this.timestamp = now;
      // calc next interval
      await this.adapter.sleep(this.rate);
      this.update(dt, time)
      this.render(dt, time)
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
  }
}

export class TimeoutEngine extends Engine {
  async tick() {
    if (!this.running) return;
    const now = this.adapter.now();
    const dt = (now - this.timestamp) * this.deltaCoef;
    const time = now * this.deltaCoef;
    this.timestamp = now;

    // calc next interval
    setTimeout(() => this.tick(), this.rate)
    this.update(dt, time);
    this.render(dt, time);
  }
}
