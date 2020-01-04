import { Subject, Watcher } from 'utils/shared/subject';

function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

test('subject observe', () => {
    const sub = new Subject<number>();
    const cb1 = jest.fn(() => void 0);
    const cb2 = jest.fn(() => void 0);
    const un1 = sub.observe(cb1);

    sub.notify(0, 1);

    const un2 = sub.observe(cb2);

    sub.notify(2, 3);

    un1();

    sub.notify(4, 5);

    un2();

    sub.notify(6, 7);

    expect(cb1.mock.calls[0]).toEqual([0, 1]);
    expect(cb1.mock.calls[1]).toEqual([2, 3]);

    expect(cb2.mock.calls[0]).toEqual([2, 3]);
    expect(cb2.mock.calls[1]).toEqual([4, 5]);
});

test('subject unObserve', () => {
    const sub = new Subject<number>();
    const cb1 = jest.fn(() => void 0);
    const cb2 = jest.fn(() => void 0);
    const cb3 = jest.fn(() => void 0);
    const cb4 = jest.fn(() => void 0);

    sub.observe(cb1);
    sub.observe(cb2);
    sub.observe(cb3);
    sub.observe(cb4);

    sub.notify(0, 1);
    sub.unObserve(cb3);
    sub.notify(2, 3);
    sub.unObserve();
    sub.notify(4, 5);

    expect(cb1.mock.calls.length).toBe(2);
    expect(cb2.mock.calls.length).toBe(2);
    expect(cb3.mock.calls.length).toBe(1);
    expect(cb4.mock.calls.length).toBe(2);
});

test('Watcher watch data', () => {
    const watcher = new Watcher(0);
    const cb = jest.fn(() => void 0);

    watcher.observe(cb);

    watcher.data = 2;
    watcher.data = 2;
    watcher.data = 10;
    watcher.data = 10;

    expect(watcher.data).toBe(10);
    expect(cb.mock.calls).toEqual([
        [2, 0],
        [10, 2],
    ]);
});

test('watch once Watcher', async () => {
    const watcher = new Watcher(123);
    const fn1 = jest.fn(() => void 0);
    const fn2 = jest.fn(() => void 0);
    const fn3 = jest.fn(() => void 0);

    watcher.once().then(fn1);
    watcher.once(568).then(fn2);
    watcher.once((val) => val * 2 === 888).then(fn3);

    setTimeout(() => watcher.data = 10, 100);

    await delay(120);

    expect(fn1).toBeCalledWith(10);
    expect(fn2).not.toBeCalled();
    expect(fn3).not.toBeCalled();

    setTimeout(() => watcher.data = 444, 100);

    await delay(120);

    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2).not.toBeCalled();
    expect(fn3).toBeCalledWith(444);

    setTimeout(() => watcher.data = 568, 100);

    await delay(120);

    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(1);
    expect(fn2).toBeCalledWith(568);
});

test('Watcher computed Watcher', () => {
    const watcher = new Watcher(0);
    const computed = watcher.computed((val) => val * 2);
    const cb = jest.fn(() => void 0);

    computed.observe(cb);

    watcher.data = 2;
    expect(computed.data).toBe(4);

    watcher.data = 3;
    expect(computed.data).toBe(6);

    watcher.data = 10;
    watcher.data = 10;
    expect(computed.data).toBe(20);

    expect(cb.mock.calls).toEqual([
        [4, 0],
        [6, 4],
        [20, 6],
    ]);
});

test('list Watchers computed Watchers', () => {
    const wa1 = new Watcher(1);
    const wa2 = new Watcher(2);
    const wa3 = new Watcher(3);

    const [com1, com2] = Watcher.computed([wa1, wa2, wa3] as const, (val1, val2, val3) => {
        return [val1 + val2, val2 + val3] as const;
    });

    expect(com1.data).toBe(3);
    expect(com2.data).toBe(5);

    const cb1 = jest.fn(() => void 0);
    const cb2 = jest.fn(() => void 0);

    com1.observe(cb1);
    com2.observe(cb2);

    wa1.data = 20;
    expect(com1.data).toBe(22);
    expect(com2.data).toBe(5);

    wa2.data = 78;
    expect(com1.data).toBe(98);
    expect(com2.data).toBe(81);

    wa3.data = 100;
    expect(com1.data).toBe(98);
    expect(com2.data).toBe(178);

    expect(cb1.mock.calls).toEqual([
        [22, 3],
        [98, 22],
    ]);

    expect(cb2.mock.calls).toEqual([
        [81, 5],
        [178, 81],
    ]);
});
