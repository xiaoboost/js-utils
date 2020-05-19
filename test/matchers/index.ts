import { toEqualMatrix } from './toEqualMatrix';

const jestExpect = (global as any).expect as jest.Expect;

if (jestExpect) {
    jestExpect.extend({
        toEqualMatrix,
    });
}
else {
    console.error('Unable to find Jest\'s global expect.' + '\nPlease check you have added jest-extended correctly to your jest configuration.' + '\nSee https://github.com/jest-community/jest-extended#setup for help.');
}
