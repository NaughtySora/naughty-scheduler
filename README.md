# Naughty Scheduler
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/NaughtySora/naughty-scheduler/blob/master/LICENSE)
[![snyk](https://snyk.io/test/github/NaughtySora/naughty-scheduler/badge.svg)](https://snyk.io/test/github/NaughtySora/naughty-scheduler)
[![npm version](https://badge.fury.io/js/naughty-scheduler.svg)](https://badge.fury.io/js/naughty-scheduler)
[![NPM Downloads](https://img.shields.io/npm/dm/naughty-scheduler)](https://www.npmjs.com/package/naughty-scheduler)
[![NPM Downloads](https://img.shields.io/npm/dt/naughty-scheduler)](https://www.npmjs.com/package/naughty-scheduler)

## Usage
- Install: `npm install naughty-scheduler`
- Require: `const utils = require('naughty-scheduler')`

## Job

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
const print = console.log.bind(null, "Hello");
const scheduler = new Scheduler();

const job_kind = new Job(print, {time: 1000, kind: "every"});
scheduler.add(job_kind);
// kind has been already set to "every", so scheduler is gonna fire callback every 1s.

const job_world = new Job(print, {time: "2025-10-11", params: [" World!"]});
scheduler.once(job_world);
// scheduler will fire callback in 2025 10 11 in 00:00 once.

const job_you = new Job(print, {time: 1000, params: [" You O:"]});
job_you.verbalTime("1d");
scheduler.every(job_you);
// scheduler will fire callback every 1day from now.

scheduler.fire(job_you);
// callback will fire callback immediately and and keep job waiting it time.
 
scheduler.fire(job_you, true);
// callback will fire callback immediately and remove job form the queue.

job_hello.setDate("2026-01-17T21:00:00.000Z");
scheduler.reschedule(job_hello, "once");
// To reschedule we change the time in job and reassign it with "once".
// Basically works like this:
// 1. We changed time in job and call scheduler.reschedule.
// 2. scheduler will remove callback from queue and job from dataset.
// 3. scheduler will add job and callback back with updated information.

job_hello.setDate("2026-01-17T00:00:00.000Z");
scheduler.reschedule(job_hello);
// Here we changed time again and reschedule job "job_hello" again.
// We didn't provide second param "kind" so the kind of the job will be as previous (once).

scheduler.cancel(job_world);
// scheduler will cancel provided job.

scheduler.cancelAll();
// scheduler cancels all the jobs.

const array_of_jobs = scheduler.stop();
// scheduler cancels all the jobs and returns array of all jobs weren't called.

const me = scheduler.find("me");
// finds job by it tag.

for(const job of scheduler){
  console.log(job);
}
// scheduler iterates jobs collection.

scheduler.pipe([
  new Job(print, {time: 2000, kind: "every"}),
  new Job(print, {time: "2025-12-12", kind: "once"}),
]); 
// scheduler will add all the jobs from iterable with provided "kind" field.

scheduler.on("fire", console.log)
// subscribe to scheduler events
// event list: "fire", "cancel", "cancelAll", "add", "stop"
// Also you can find all the event by using static field "Scheduler.kinds"
```

## Part of naughty stack
