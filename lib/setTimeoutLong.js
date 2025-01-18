
const INT32 = 0b01111111_11111111_11111111_11111111;

module.exports = (callback, ms, ...params) => {
  let long = ms > INT32;
  let time = long ? INT32 : ms;
  let timer = null;
  const timeout = () => {
    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      if (!long) return void callback(...params);
      time = ms - time;
      long = time > INT32;
      timeout();
    }, time);
  };
  timeout();
  return () => {
    clearTimeout(timer);
    timer = null;
  };
};
