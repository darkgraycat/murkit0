import { IAdapter } from "./common/types";

export type EngineHandler = (dt: number) => void;

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
      const time = this.adapter.now();
      const dt = (time - this.timestamp) * this.deltaCoef;
      this.timestamp = this.adapter.now();
      // calc next interval
      await this.adapter.sleep(this.rate);
      this.update(dt)
      this.render(dt)
    }
  }

  async tickTimeout() {
    if (!this.running) return;

    const time = this.adapter.now();
    const dt = (time - this.timestamp) * this.deltaCoef;
    this.timestamp = this.adapter.now();

    this.update(dt)
    this.render(dt)
    
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
