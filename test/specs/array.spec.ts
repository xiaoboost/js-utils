import { get } from 'utils/shared';

test('get Array item', () => {
    expect(get([0, 1], 1)).toBe(1);
});
