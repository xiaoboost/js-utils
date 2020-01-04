import { get } from 'utils/shared/array';

test('get array item', () => {
    expect(get([0, 1, 2, 3], 1)).toBe(1);
    expect(get([0, 1, 2, 3], -1)).toBe(3);

    expect(() => get([0, 1], 456)).toThrowError('(array) index out of bounds.');
});
