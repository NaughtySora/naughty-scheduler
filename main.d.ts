
type Kind = "once" | "every";
type Events = "fire" | "cancel" | "cancelAll" | "stop" | "add";
type Callback = (...args: any[]) => any;

export class Job<T extends Callback> {
  constructor(callback: T, params: { time?: DateConstructor, params: Parameters<T>, tag?: any });
  setTime(time: number): this;
  setDate(time: DateConstructor): this;
  verbalTime(time: string): this;
  verbalDate(time: string): this;
}

export class Scheduler {
  constructor();
  once(job: Job<any>): this;
  every(job: Job<any>): this;
  fire(job: Job<any>, terminate?: boolean): this;
  cancel(job: Job<any>): this;
  cancelAll(): this;
  reschedule(job: Job<any>, kind: any): this;
  stop(): Array<Job<any>>;
  on(name: Events, cb: (job: Job<any>) => any): this;
  find(tag: any): Job<any> | undefined;
  static kinds: Readonly<Record<Kind, string>>;
}
