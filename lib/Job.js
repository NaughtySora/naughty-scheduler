"use strict";

const { number, date } = require("naughty-util");

const ERRORS = {
  verbal: new Error("Wrong verbal format"),
  time: new Error("Value has to be positive integer"),
  date: new Error("Value has to be date constructor parameter"),
};

Object.setPrototypeOf(ERRORS, null);

class Job {
  constructor(callback, { time, params, tag, kind } = {}) {
    this.time = 0;
    time && this.setDate(time);
    this.params = params ?? [];
    this.callback = callback;
    this.tag = tag;
    this.kind = kind;
  }

  setTime(time) {
    if (!number.positiveInt(time)) throw ERRORS.time;
    this.time = time;
    return this;
  }

  setDate(date) {
    const time = new Date(date).getTime();
    if (!number.positiveInt(time)) throw ERRORS.date;
    this.time = time;
    return this;
  }

  verbalDate(value) {
    const time = date.verbalEpoch(value);
    if (!number.positiveInt(time)) throw ERRORS.verbal;
    this.time = time;
    return this;
  }

  verbalTime(value) {
    const time = date.verbal(value);
    if (!number.positiveInt(time)) throw ERRORS.verbal;
    this.time = time;
    return this;
  }
}

module.exports = Job;