/**
 * @jest-environment jsdom
 */

import { getQueryParams } from '../src/query-params';
import * as GlobalScopeModule from '../src/global-scope';

describe('query-params', () => {
  describe('getQueryParams', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          writable: true,
        },
      });
    });

    afterAll(() => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          writable: false,
        },
      });
    });

    test('should parse query params', () => {
      window.location.search = '?a=1&b=2%20test&&c%24=hello&d';
      const params = getQueryParams();
      expect(params).toEqual({
        a: '1',
        b: '2 test',
        c$: 'hello',
      });
    });

    test('should decode form-encoded plus signs and preserve equals signs in values', () => {
      window.location.search = '?utm_source=news+letter&utm_term=running+shoes&utm_content=a%3Db=c&gclid=abc==';
      const params = getQueryParams();
      expect(params).toEqual({
        utm_source: 'news letter',
        utm_term: 'running shoes',
        utm_content: 'a=b=c',
        gclid: 'abc==',
      });
    });

    test('should decode plus signs in keys while ignoring missing and empty values', () => {
      window.location.search = '?a+b=c+d=e&missing&empty=&encoded=%2B+%3D';
      const params = getQueryParams();
      expect(params).toEqual({
        'a b': 'c d=e',
        encoded: '+ =',
      });
    });

    test('should parse malformed uri', () => {
      window.location.search = '?fb=X+%EF%BF%BD%93+C';
      const params = getQueryParams();
      expect(params).toEqual({});
    });

    test('should handle undefined global scope', () => {
      jest.spyOn(GlobalScopeModule, 'getGlobalScope').mockReturnValueOnce(undefined);
      const params = getQueryParams();
      expect(params).toEqual({});
    });
  });
});
