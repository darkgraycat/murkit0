import { IAdapter } from "./common/types";

export type EngineHandler = (dt: number, time: number) => void;

export class Engine {
  private timestamp: number = 0;
  private running: boolean = false;

  constructor(
    private adapter: IAdapter,
    private rate: number,
    private update: EngineHandler,
    private render: EngineHandler,
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

  async tickTimeout() {
    if (!this.running) return;

    const time = this.adapter.now();
    const dt = (time - this.timestamp) * this.deltaCoef;
    this.timestamp = time;

    this.update(dt, time);
    this.render(dt, time);
   
    setTimeout(() => this.tick(), this.rate)
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
    //this.tickTimeout();
  }

  stop() {
    this.running = false;
  }
}
