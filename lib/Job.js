"use strict";

const { number, date } = require("naughty-util");

class Job {
  constructor(callback, { time, params, tag, kind } = {}) {
    this.time = 0;
    if (time !== undefined) this.setDate(time);
    this.params = params ?? [];
    this.callback = callback;
    this.tag = tag;
    this.kind = kind;
  }

  setTime(time) {
    if (!number.positiveInt(time)) {
      throw new Error("Value has to be positive integer");
    }
    this.time = time;
    return this;
  }

  setDate(date) {
    const time = new Date(date).getTime();
    if (!number.positiveInt(time)) {
      throw new Error("Value has to be date constructor parameter");
    }
    this.time = time;
    return this;
  }

  verbalDate(value) {
    this.time = date.verbalEpoch(value);
    return this;
  }

  verbalTime(value) {
    this.time = date.verbal(value);
    return this;
  }
}

module.exports = Job;