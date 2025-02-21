"use strict";

const INT32 = 0x7fffffff;

const setTimeoutLong = (callback, ms, ...params) => {
  let long = ms > INT32;
  let time = long ? INT32 : ms;
  let timer = setTimeout(() => {
    if (!long) {
      clearTimeout(timer);
      timer = null;
      callback(...params);
      return;
    }
    time = ms - time;
    long = time > INT32;
    timer.refresh();
  }, time);
  return () => {
    clearTimeout(timer);
    timer = null;
  };
};

module.exports = setTimeoutLong;
