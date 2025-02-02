"use strict";

const { EventEmitter } = require("node:events");
const setTimeoutLong = require("./setTimeoutLong.js");

const EVENTS = {
  fire: "fire",
  cancel: "cancel",
  cancelAll: "cancelAll",
  stop: "stop",
  add: "add",
};

const KINDS = {
  every: "every",
  once: "once",
};

Object.setPrototypeOf(KINDS, null);
Object.setPrototypeOf(EVENTS, null);
Object.freeze(KINDS);

class Scheduler {
  #emitter;
  #jobs;
  #timers;
  #tags;

  constructor() {
    this.#emitter = new EventEmitter();
    this.#jobs = new Set();
    this.#tags = new Map();
    this.#timers = new WeakMap();
  }

  add(job) {
    const kind = job.kind;
    if (!KINDS[kind]) return this;
    return this[kind](job);
  }

  once(job) {
    if (this.#jobs.has(job)) return this;
    const { time, params, callback, tag } = job;
    if (!callback) return this;
    job.kind = KINDS.once;
    const now = Date.now();
    const callDate = time - now;
    if (callDate < 0) {
      callback(...params);
      this.#emitter.emit(EVENTS.fire, job);
      return this;
    }
    if (tag) this.#tags.set(tag, job);
    const cancel = setTimeoutLong(() => {
      cancel();
      this.#timers.delete(job);
      this.#jobs.delete(job);
      this.#tags.delete(tag);
      callback(...params);
      this.#emitter.emit(EVENTS.fire, job);
    }, callDate);
    this.#jobs.add(job);
    this.#timers.set(job, cancel);
    this.#emitter.emit(EVENTS.add, job);
    return this;
  }

  every(job) {
    if (this.#jobs.has(job)) return this;
    const { time, params, callback, tag } = job;
    if (!callback) return this;
    job.kind = KINDS.every;
    if (tag) this.#tags.set(tag, job);
    const timeout = () => {
      const cancel = setTimeoutLong(() => {
        cancel();
        this.#timers.delete(job);
        this.#jobs.delete(job);
        this.#tags.delete(tag);
        callback(...params);
        this.#emitter.emit(EVENTS.fire, job);
        timeout();
      }, time);
      this.#jobs.add(job);
      this.#timers.set(job, cancel);
    };
    timeout();
    this.#emitter.emit(EVENTS.add, job);
    return this;
  }

  fire(job, terminate = false) {
    if (!this.#jobs.has(job)) return this;
    const { callback, params } = job;
    callback(...params);
    this.#emitter.emit(EVENTS.fire, job);
    if (terminate) this.cancel(job);
    return this;
  }

  cancel(job) {
    if (!this.#jobs.has(job)) return this;
    const cancel = this.#timers.get(job);
    cancel();
    this.#jobs.delete(job);
    this.#timers.delete(job);
    this.#tags.delete(job.tag);
    this.#emitter.emit(EVENTS.cancel, job);
    return this;
  }

  cancelAll() {
    for (const job of this.#jobs) this.cancel(job);
    this.#emitter.emit(EVENTS.cancelAll);
    return this;
  }

  reschedule(job, kind = job.kind) {
    if (!kind || !this.#jobs.has(job)) return this;
    this.cancel(job);
    if (!job.kind) job.kind = kind;
    this.add(job);
    return this;
  }

  stop() {
    const jobs = Array.from(this.#jobs);
    this.cancelAll();
    this.#emitter.emit(EVENTS.stop, jobs);
    return jobs;
  }

  on(name, cb) {
    if (!EVENTS[name]) return this;
    this.#emitter.on(name, cb);
    return this;
  }

  find(tag) {
    return this.#tags.get(tag);
  }

  pipe(jobs) {
    for (const job of jobs) this.add(job);
    return this;
  }

  [Symbol.iterator]() {
    const iterator = this.#jobs.values();
    return iterator;
  }

  static kinds = KINDS;
}

module.exports = Scheduler;
