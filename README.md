# Naughty Scheduler
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/NaughtySora/naughty-scheduler/blob/master/LICENSE)
[![snyk](https://snyk.io/test/github/NaughtySora/naughty-scheduler/badge.svg)](https://snyk.io/test/github/NaughtySora/naughty-scheduler)

## Usage
- Install: `npm install naughty-scheduler`
- Require: `const utils = require('naughty-scheduler')`

## Job

Job serves for holding, time when job is firing, callback will be fired, parameters and some help information like tag, kind

```js
  const print = console.log.bind(null, "Hello");
  const job_world = new Job(print, {time: "2025-10-11", params: [" World!"]});
  const job_me = new Job(print, {time: Date.now(), params: [" new ME!"], tag: "me"});
  const job_hello = new Job(print); // time 0;
  job.verbalDate("10m"); // Date.now() + 10 * 60 * 1000
  const job_you = new Job(print, {time: 1000, params: [" You O:"]});
  job_you.verbalTime("1d"); // 24 * 60 * 60 * 1000;
  const job_kind = new Job(print, {time: 1000, params: [" You O:"], kind: "every"});
```

## Scheduler

```js
const scheduler = new Scheduler();

scheduler.add(job_kind);
// kind already set, so job is gonna be "every" means interval, by time(1000);

scheduler.once(job_world);
// will fire in 2025 10 11 in 00:00.

scheduler.every(job_you);
// will fire every 1day from time you assigned it.

scheduler.fire(job_you);
// will fire callback immediately and job stays.
 
scheduler.fire(job_you, true);
// will fire callback immediately and job cancels.

job_hello.setDate(new Date("2026-01-17T21:00:00.000Z"));
scheduler.reschedule(job_hello, "once");
// reschedule and change kind to "once"

job_hello.setDate(new Date("2026-01-17T00:00:00.000Z"));
scheduler.reschedule(job_hello);
// reschedule and kind wasn't provided, so it stays "once"

scheduler.cancel(job_world);
// cancel job

scheduler.cancelAll();
// cancelAll job

const array_of_jobs = scheduler.stop();
// cancel and get all jobs which weren't called.

const me = scheduler.find("me");
// get job by tag

for(const job of scheduler){ //iterable
  console.log(job);
}

scheduler.pipe([
  new Job(print, {time: 2000, kind: "every"}),
  new Job(print, {time: "2025-12-12", kind: "once"}),
]); // bulk add but has to be kind, jobs with no kind will be omitted.

scheduler.on("fire", console.log).on("cancelAll", () => {
  //code
});
// subscribe to scheduler events
```

## Part of naughty stack
