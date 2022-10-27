import test from 'ava';
import sinon from 'sinon';

import { ChannelData, Subscriber, Watcher, delay } from 'src';

test('channel data normal', ({ is }) => {
  const data = new ChannelData<number>();

  data.push('a', 1);
  data.push('b', 2);
  data.push('a', 3);
  data.push('b', 4);

  is(data.pop('c'), undefined);

  is(data.pop('a'), 3);
  is(data.pop('a'), 1);
  is(data.pop('b'), 4);
  is(data.pop('b'), 2);
  is(data.pop('a'), undefined);
  is(data.pop('b'), undefined);
});

test('channel data clear', ({ is }) => {
  const data = new ChannelData<number>();

  data.push('a', 1);
  data.push('b', 2);
  data.push('a', 3);
  data.push('b', 4);
  data.clear();

  is(data.pop('a'), undefined);
});

test('channel data remove', ({ is }) => {
  const data = new ChannelData<number>();

  data.push('a', 1);
  data.push('b', 2);
  data.push('a', 3);
  data.push('b', 4);
  data.push('a', 5);
  data.push('b', 6);

  data.remove(5);
  data.remove('b');

  is(data.pop('b'), undefined);
  is(data.pop('a'), 3);
});

test('Subscriber observe', ({ deepEqual }) => {
  const sub = new Subscriber<number>();
  const cb1 = sinon.spy(() => void 0);
  const cb2 = sinon.spy(() => void 0);
  const un1 = sub.observe(cb1);

  sub.notify(0, 1);

  const un2 = sub.observe(cb2);

  sub.notify(2, 3);

  un1();

  sub.notify(4, 5);

  un2();

  sub.notify(6, 7);

  deepEqual(cb1.args, [
    [0, 1],
    [2, 3],
  ]);
  deepEqual(cb2.args, [
    [2, 3],
    [4, 5],
  ]);
});

test('Subscriber unObserve', ({ is }) => {
  const sub = new Subscriber<number>();
  const cb1 = sinon.spy(() => void 0);
  const cb2 = sinon.spy(() => void 0);
  const cb3 = sinon.spy(() => void 0);
  const cb4 = sinon.spy(() => void 0);

  sub.observe(cb1);
  sub.observe(cb2);
  sub.observe(cb3);
  sub.observe(cb4);

  sub.notify(0, 1);
  sub.unObserve(cb3);
  sub.notify(2, 3);
  sub.unObserve();
  sub.notify(4, 5);

  is(cb1.callCount, 2);
  is(cb2.callCount, 2);
  is(cb3.callCount, 1);
  is(cb4.callCount, 2);
});

test('Watcher watch data', ({ is, deepEqual }) => {
  const watcher = new Watcher(0);
  const cb = sinon.spy(() => void 0);

  watcher.observe(cb);

  watcher.setData(2);
  watcher.setData(2);
  watcher.setData(10);
  watcher.setData(10);

  is(watcher.data, 10);
  deepEqual(cb.args, [
    [2, 0],
    [10, 2],
  ]);
});

test('Watcher observe immediately', async ({ is }) => {
  const watcher = new Watcher(123);
  const fn1 = sinon.spy(() => void 0);
  const fn2 = sinon.spy(() => void 0);

  watcher.observe(fn1);
  watcher.observe(fn2, true);

  is(fn1.callCount, 0);
  is(fn2.callCount, 1);
});

test('watch once Watcher', async ({ deepEqual, true: isTrue }) => {
  const watcher = new Watcher(123);
  const fn1 = sinon.spy(() => void 0);
  const fn2 = sinon.spy(() => void 0);
  const fn3 = sinon.spy(() => void 0);

  watcher.once().then(fn1);
  watcher.once(568).then(fn2);
  watcher.once((val) => val * 2 === 888).then(fn3);

  setTimeout(() => void watcher.setData(10), 50);

  await delay(80);

  deepEqual(fn1.args, [[10]]);
  isTrue(fn2.notCalled);
  isTrue(fn3.notCalled);

  setTimeout(() => void watcher.setData(444), 50);

  await delay(80);

  deepEqual(fn1.args, [[10]]);
  isTrue(fn2.notCalled);
  deepEqual(fn3.args, [[444]]);

  setTimeout(() => void watcher.setData(568), 50);

  await delay(80);

  deepEqual(fn1.args, [[10]]);
  deepEqual(fn2.args, [[568]]);
  deepEqual(fn3.args, [[444]]);
});

test('Watcher computed Watcher', ({ is, deepEqual }) => {
  const watcher = new Watcher(0);
  const computed = watcher.computed((val) => val * 2);
  const cb = sinon.spy(() => void 0);

  computed.observe(cb);

  watcher.setData(2);
  is(computed.data, 4);

  watcher.setData(3);
  is(computed.data, 6);

  watcher.setData(10);
  watcher.setData(10);
  is(computed.data, 20);

  deepEqual(cb.args, [
    [4, 0],
    [6, 4],
    [20, 6],
  ]);
});

test('list Watchers computed Watchers', ({ is, deepEqual }) => {
  const wa1 = new Watcher(1);
  const wa2 = new Watcher(2);
  const wa3 = new Watcher(3);

  const [com1, com2] = Watcher.computed([wa1, wa2, wa3] as const, (val1, val2, val3) => {
    return [val1 + val2, val2 + val3] as const;
  });

  is(com1.data, 3);
  is(com2.data, 5);

  const cb1 = sinon.spy(() => void 0);
  const cb2 = sinon.spy(() => void 0);

  com1.observe(cb1);
  com2.observe(cb2);

  wa1.setData(20);
  is(com1.data, 22);
  is(com2.data, 5);

  wa2.setData(78);
  is(com1.data, 98);
  is(com2.data, 81);

  wa3.setData(100);
  is(com1.data, 98);
  is(com2.data, 178);

  deepEqual(cb1.args, [
    [22, 3],
    [98, 22],
  ]);

  deepEqual(cb2.args, [
    [81, 5],
    [178, 81],
  ]);
});
