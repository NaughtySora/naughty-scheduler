
type Kind = "once" | "every";
type Events = "fire" | "cancel" | "cancelAll" | "stop" | "add";
type Callback = (...args: any[]) => any;
type JobAny = Job<any>;

export class Job<T extends Callback> {
  constructor(callback: T, params?: { time?: ConstructorParameters<DateConstructor>[0], params?: Parameters<T>, tag?: any });
  setTime(time: number): this;
  setDate(time: DateConstructor): this;
  verbalTime(time: string): this;
  verbalDate(time: string): this;
}

export class Scheduler {
  constructor();
  add(job: JobAny): this;
  once(job: JobAny): this;
  every(job: JobAny): this;
  fire(job: JobAny, terminate?: boolean): this;
  cancel(job: JobAny): this;
  cancelAll(): this;
  reschedule(job: JobAny, kind?: Kind): this;
  stop(): Array<JobAny>;
  on(name: Events, cb: (job?: JobAny) => any): this;
  find(tag: any): JobAny | undefined;
  pipe(commands: Array<JobAny>): this;
  [Symbol.iterator]: Iterable<JobAny>;
  static kinds: Readonly<Record<Kind, string>>;
}
