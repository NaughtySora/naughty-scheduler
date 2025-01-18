"use strict";

const { array, misc } = require("naughty-util");
const { Job, Scheduler } = require("../main");
const assert = require("node:assert");

const print = misc.partial(console.log, "Test Output");

const job = () => {
  const scheduler = new Scheduler();

  const callbackOnly_params = new Job(print, { params: [9999999] });
  const callbackOnly = new Job(print);

  const time_n = new Job(print, { time: 5000 });
  const time_s = new Job(print, { time: "2025-02-02" });
  const time_iso = new Job(print, { time: new Date().toISOString() });
  const time_date = new Job(print, { time: new Date() });

  const time_n_p = new Job(print, { time: 5000, params: ["param-1", "param-hello"] });
  const time_s_p = new Job(print, { time: "2025-02-02", params: ["param-1", "param-hello"] });
  const time_iso_p = new Job(print, { time: new Date().toISOString(), params: ["param-1", "param-hello"] });
  const time_date_p = new Job(print, { time: new Date(), params: ["param-1", "param-hello"] });

  const no_time_verbal = new Job(print).verbalTime("0h 0d 0s");
  const ime_verbal = new Job(print, { time: 11111 }).verbalTime("2h 2d 2s");
  const ime_verbal_p = new Job(print, { time: 11111, params: ["param-1", "param-hello"] }).verbalTime("2h 2d 2s");

  const no_time_verbal_date = new Job(print).verbalDate("0h 0d 0s");
  const ime_verbal_date = new Job(print, { time: 11111 }).verbalDate("1h 23d 0s");
  const ime_verbal_date_p = new Job(print, { time: 11111, params: ["param-1", "param-hello"] }).verbalDate("1h 23d 0s");

  const tag_s = new Job(print, { tag: "tag" });
  const tag_n = new Job(print, { tag: 2 });
  const tag_o = new Job(print, { tag: {} });
  const tag_array = new Job(print, { tag: [1, "hello"] });

  const kind_tag_date = new Job(print, { kind: "once", tag: "me" }).setDate(Date.now() + 5000);
  const kind_tag_verbal = new Job(print, { kind: "once", tag: "#" }).verbalDate("2d 10h");
  const kind_time = new Job(print, { time: 1000, kind: "every", });
  const kind_time_once = new Job(print, { time: "2025-02-02", kind: "once" });

  const every = [time_n, time_n_p, ime_verbal, ime_verbal_p,];
  const once = [
    callbackOnly_params,
    time_s,
    ime_verbal_date_p,
    callbackOnly,
    time_iso, time_date,
    time_s_p, time_iso_p, time_date_p, no_time_verbal, no_time_verbal_date, ime_verbal_date,
    tag_s, tag_n, tag_o, tag_array
  ];
  const add = [kind_tag_date, kind_tag_verbal, kind_time, kind_time_once];

  scheduler.pipe(add);
  for (const job of every) scheduler.every(job);
  for (const job of once) scheduler.once(job);
};

const every = () => {
  const scheduler = new Scheduler();
  const jobs = [
    new Job(print, { time: 2500, params: ["- 2500"] }),
    new Job(print, { time: 1000, params: ["- 1000"] }),
  ];

  scheduler.every(jobs[0]);
  scheduler.every(jobs[1]);

  setTimeout(() => {
    scheduler.cancelAll();
  }, 10000);
};

const once = () => {
  const scheduler = new Scheduler();
  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);

  setTimeout(() => {
    scheduler.cancelAll();
  }, 2000);
};

const fire = () => {
  const scheduler = new Scheduler();
  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);

  scheduler.fire(jobs[2], true);
  scheduler.fire(jobs[1]);
};

const reschedule = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.reschedule(jobs[0].verbalDate("3.5s"));
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.reschedule(jobs[2].verbalTime("10s"));
  scheduler.every(jobs[3]);
};

const on = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler
    .on("add", misc.partial(console.log, "add"))
    .on("cancel", misc.partial(console.log, "cancel"),)
    .on("cancelAll", misc.partial(console.log, "cancelAll"),)
    .on("fire", misc.partial(console.log, "fire"),)
    .on("stop", misc.partial(console.log, "stop"),);

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);
  scheduler.cancel(jobs[1]);
  scheduler.fire(jobs[0]);

  setTimeout(() => {
    scheduler.stop();
  }, 4500);

};

const find = () => {
  const scheduler = new Scheduler();
  const jobs = array.accessor([
    new Job(print, { time: 5000, tag: "tag" }),
    new Job(print, { time: 5000, tag: [1, "hello"] }),
    new Job(print, { time: 5000, tag: Symbol("test") })
  ], { tag: 0, array: 1, symbol: 2 });

  scheduler.every(jobs.tag);
  scheduler.every(jobs.array);
  scheduler.every(jobs.symbol);

  const find_s = scheduler.find(jobs.tag.tag);
  const find_array = scheduler.find(jobs.array.tag);
  const find_symbol = scheduler.find(jobs.symbol.tag);

  assert.deepEqual(find_s, jobs.tag);
  assert.deepEqual(find_array, jobs.array);
  assert.deepEqual(find_symbol, jobs.symbol);

  scheduler.cancelAll();
};

const cancel = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.on("cancel", misc.partial(console.log, "cancel"),)

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);
  scheduler.cancel(jobs[1]);
  scheduler.cancel(jobs[0]);
  scheduler.cancel(jobs[2]);
};

const cancelAll = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);

  // if u do setTimeout(scheduler.cancelAll, 2000), scheduler goes into Timer class where u can't use private fields
  // WORKS setTimeout(scheduler.cancelAll.bind(scheduler), 2000);
  setTimeout(() => scheduler.cancelAll(), 2000);
};

const stop = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);

  setTimeout(() => {
    const jobs = scheduler.stop();
    console.log(jobs);
  }, 2000);
};

const iterator = () => {
  const scheduler = new Scheduler();

  const jobs = [
    new Job(print, { time: Date.now() + 1500, params: ["- 1500"] }),
    new Job(print, { time: Date.now() + 2500, params: ["- 2500"] }),
    new Job(print, { time: 5500, params: ["- 5500"] }),
    new Job(print, { time: 6500, params: ["- 6500"] }),
  ];

  scheduler.once(jobs[0]);
  scheduler.once(jobs[1]);
  scheduler.every(jobs[2]);
  scheduler.every(jobs[3]);

  for (const job of scheduler) {
    console.log(job);
  }
};

const pipe = () => {
  const scheduler = new Scheduler();
  const jobs = [
    new Job(print, { time: 1000, kind: "every", params: ["every-1000"] }),
    new Job(print, { time: 1000, params: ["never"] }), // will be omitted
    new Job(print, { time: Date.now() + 2500, kind: "once", params: ["once-2500"] })
  ];

  scheduler.pipe(jobs);
};

const fns = [job, every, once, fire, reschedule, on, find, cancel, cancelAll, stop, iterator, pipe];

for(const fn of fns) fn();