import test from 'ava';

import { useFollow } from 'src/use';
import { act, renderHook } from '@testing-library/react-hooks';

const setUp = (init: number) => {
  return renderHook((props?: number) => useFollow(props ?? init));
};

test('use-follow', async ({ is }) => {
  const follow = setUp(0);
  const getCurrent = () => {
    let val: number;

    act(() => {
      [val] = follow.result.current;
    });

    return val!;
  };

  is(getCurrent(), 0);

  act(() => {
    follow.result.current[1](5);
  });

  is(getCurrent(), 5);

  act(() => {
    follow.rerender(20);
  });

  is(follow.result.current[0], 20);
});
