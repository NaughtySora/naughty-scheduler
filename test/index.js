"use strict";

const { array } = require("naughty-util");
const { Job, Scheduler } = require("../main");
const assert = require("node:assert/strict");
const { describe, it } = require('node:test');

const noop = () => { };

describe('Job', () => {
  assert.deepEqual(new Job(noop, { params: [9999999] }).params, [9999999]);
  assert.equal(new Job(noop).callback, noop);
  assert.ok(new Job(noop, { time: 5000 }).time > 0);
  assert.equal(new Job(noop, { time: "2025-02-02" }).time, new Date('2025-02-02').getTime());
  const date = new Date();
  assert.equal(new Job(noop, { time: date.toISOString() }).time, new Date(date.toISOString()).getTime());
  assert.equal(new Job(noop, { time: date }).time, date.getTime());
  assert.equal(new Job(noop, { time: date }).time, date.getTime());
  assert.ok(new Job(noop).verbalTime("0h 0d 0s").time === 0);
  assert.ok(new Job(noop).verbalTime("2h 2d 2s").time > 0);
  assert.ok(new Job(noop).verbalDate("0h 0d 0s").time > 0);
  assert.ok(new Job(noop).verbalDate("2h 2d 2s").time > 0);
  assert.equal(new Job(noop, { tag: "tag" }).tag, "tag");
  const tag = Symbol('tag');
  const job = new Job(noop, { kind: "once", tag }).setDate(Date.now() + 5000);
  assert.equal(job.tag, tag);
  assert.equal(job.kind, "once");
  assert.ok(job.time > 0);
  assert.ok(new Job(noop).setTime(Date.now()).time > 0);

  assert.throws(() => {
    new Job(noop).setTime(-1);
  }, { message: "Value has to be positive integer" });

  assert.throws(() => {
    new Job(noop).setDate('Strange date');
  }, { message: "Value has to be date constructor parameter" });
});

describe('Scheduler', () => {
  it('every', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const jobs = [
      new Job(fn, { time: 2500, params: ["2500"] }),
      new Job(fn, { time: 1000, params: ["1000"] }),
    ];
    jobs.forEach(j => scheduler.every(j));
    setTimeout(() => {
      scheduler.cancelAll();
      assert.deepEqual(log, ['1000', '1000', '2500']);
    }, 2500);
  });

  it('once', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const jobs = [
      new Job(fn, { time: Date.now() + 100, params: ["100"] }),
      new Job(fn, { time: Date.now() + 2500, params: ["2500"] }),
    ];
    jobs.forEach(j => scheduler.once(j));
    setTimeout(() => {
      scheduler.cancelAll();
      assert.deepEqual(log, ['100']);
    }, 2000);
  });

  it('fire', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const once = [
      new Job(fn, { time: Date.now() + 100, params: ["100"] }),
      new Job(fn, { time: Date.now() + 500, params: ["500"] }),
    ];
    const every = [
      new Job(fn, { time: 550, params: ["550"] }),
      new Job(fn, { time: 650, params: ["650"] }),
    ];
    once.forEach(j => scheduler.once(j));
    every.forEach(j => scheduler.every(j));
    scheduler.fire(once[1]);
    scheduler.fire(every[0], true);

    setTimeout(() => {
      scheduler.cancelAll();
      assert.deepEqual(log, ['500', '550', '100', '500', '650',]);
    }, 1000);
  });

  it('reschedule', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const jobs = [
      new Job(fn, { time: Date.now() + 100, params: ["once"] }),
      new Job(fn, { time: 1000, params: ["every"] }),
    ];
    scheduler.once(jobs[0]);
    scheduler.every(jobs[1]);
    scheduler.reschedule(jobs[1].verbalTime("1s"));
    scheduler.reschedule(jobs[0].verbalDate("2s"));
    setTimeout(() => {
      scheduler.cancelAll();
      assert.deepEqual(log, ['every']);
    }, 1000);
  });

  it('events', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);

    const jobs = [
      new Job(fn, { time: Date.now() + 250, params: ["250"] }),
      new Job(fn, { time: Date.now() + 275, params: ["275"] }),
      new Job(fn, { time: 333, params: ["333"] }),
      new Job(fn, { time: 400, params: ["400"] }),
    ];

    scheduler
      .on("add", (j) => log.push('add'))
      .on("cancel", (j) => log.push('cancel'))
      .on("cancelAll", () => log.push('cancelAll'))
      .on("fire", (j) => log.push('fire'))
      .on("stop", (j) => log.push('stop'));

    scheduler.once(jobs[0]);
    scheduler.once(jobs[1]);
    scheduler.once(jobs[2]);
    scheduler.once(jobs[3]);
    scheduler.cancel(jobs[1]);
    scheduler.fire(jobs[0]);

    setTimeout(() => {
      scheduler.cancelAll();
      assert.deepEqual(log, [
        'add', 'add',
        '333', 'fire',
        '400', 'fire',
        'cancel', '250',
        'fire', '250',
        'fire', 'cancelAll'
      ]);
    }, 1000);
  });

  it('find', () => {
    const scheduler = new Scheduler();
    const jobs = array.accessor([
      new Job(noop, { time: 5000, tag: "tag" }),
      new Job(noop, { time: 5000, tag: [1, "hello"] }),
      new Job(noop, { time: 5000, tag: Symbol("test") })
    ], { tag: 0, array: 1, symbol: 2 });
    scheduler.every(jobs.tag);
    scheduler.every(jobs.array);
    scheduler.every(jobs.symbol);
    assert.deepEqual(scheduler.find(jobs.tag.tag), jobs.tag);
    assert.deepEqual(scheduler.find(jobs.array.tag), jobs.array);
    assert.deepEqual(scheduler.find(jobs.symbol.tag), jobs.symbol);
    scheduler.cancelAll();
  });

  it('cancel', () => {
    const log = [];
    const canceled = [];
    const scheduler = new Scheduler();
    const fn = (text) => log.push(text);
    const jobs = [
      new Job(fn, { time: Date.now() + 700, params: ["700"] }),
      new Job(fn, { time: Date.now() + 500, params: ["500"] }),
    ];
    scheduler.on("cancel", (j) => canceled.push(j));
    jobs.forEach(j => scheduler.once(j));
    jobs.forEach(j => scheduler.cancel(j));
    assert.deepEqual(canceled, jobs);
    assert.deepEqual(log, []);
  });

  it('cancelAll', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const jobs = [
      new Job(fn, { time: Date.now() + 700, params: ["700"] }),
      new Job(fn, { time: Date.now() + 500, params: ["500"] }),
    ];
    jobs.forEach(j => scheduler.once(j));
    jobs.forEach(j => scheduler.cancel(j));
    scheduler.cancelAll();
    assert.deepEqual(log, []);
  });

  it('stop', () => {
    const log = [];
    const scheduler = new Scheduler();
    const fn = text => log.push(text);
    const jobs = [
      new Job(fn, { time: Date.now() + 500, params: ["500"] }),
      new Job(fn, { time: Date.now() + 600, params: ["600"] }),
    ];
    jobs.forEach(j => scheduler.once(j));
    setTimeout(() => {
      scheduler.stop();
      assert.deepEqual(log, []);
    }, 250);
  });

  it('iterator', () => {
    const copy = [];
    const scheduler = new Scheduler();
    const jobs = [
      new Job(noop, { time: Date.now() + 1500, params: ["- 1500"] }),
      new Job(noop, { time: Date.now() + 2500, params: ["- 2500"] }),
      new Job(noop, { time: 5500, params: ["- 5500"] }),
      new Job(noop, { time: 6500, params: ["- 6500"] }),
    ];
    scheduler.once(jobs[0]);
    scheduler.once(jobs[1]);
    scheduler.every(jobs[2]);
    scheduler.every(jobs[3]);
    for (const job of scheduler) copy.push(job);
    scheduler.cancelAll();
    assert.deepEqual(copy, jobs);
  });

  it('pipe', () => {
    const copy = [];
    const scheduler = new Scheduler();
    const jobs = [
      new Job(noop, { time: 1000, kind: "every", params: ["every"] }),
      new Job(noop, { time: 1000, params: ["never"] }),
      new Job(noop, { time: Date.now() + 2500, kind: "once", params: ["once"] })
    ];
    scheduler.pipe(jobs);
    for (const j of scheduler) copy.push(j);
    scheduler.cancelAll();
    assert.deepEqual(copy, [jobs[0], jobs[2]]);
  });

  it('no callback', () => {
    const copy = [];
    const job = new Job();
    const scheduler = new Scheduler();
    scheduler.once(job);
    scheduler.every(job);
    for (const j of scheduler) copy.push(j);
    assert.deepEqual(copy, []);
  });

  it('same job', () => {
    const copy = [];
    const job = new Job(noop, { time: Date.now() + 1000, tag: "123" });
    const scheduler = new Scheduler();
    scheduler.once(job);
    scheduler.once(job);
    scheduler.every(job);
    scheduler.every(job);
    for (const j of scheduler) copy.push(j);
    assert.deepEqual(copy, [job]);
    scheduler.cancelAll();
  });

  it('fire evicted job', () => {
    const copy = [];
    const job = new Job(noop, { time: 0, tag: "123" });
    const scheduler = new Scheduler();
    scheduler.once(job);
    scheduler.fire(job);
    for (const j of scheduler) copy.push(j);
    assert.deepEqual(copy, []);
  });

  it('cancel evicted job', () => {
    const copy = [];
    const job = new Job(noop, { time: 0, tag: "123" });
    const scheduler = new Scheduler();
    scheduler.once(job);
    scheduler.cancel(job);
    for (const j of scheduler) copy.push(j);
    assert.deepEqual(copy, []);
  });

  it('reschedule evicted job, job without kind', () => {
    const copy = [];
    const job = new Job(noop, { time: 0, tag: "123" });
    const scheduler = new Scheduler();
    scheduler.once(job);
    scheduler.reschedule(job, "once");
    scheduler.reschedule(job);
    for (const j of scheduler) copy.push(j);
    assert.deepEqual(copy, []);
  });

  it('subscribe event doesn\'t exists', () => {
    const scheduler = new Scheduler();
    scheduler.on('smth', () => { });
  });
});


