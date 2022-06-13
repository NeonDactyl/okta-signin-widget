/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction, NextStep } from '@okta/okta-auth-js';
import { renderHook } from '@testing-library/preact-hooks';

import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('idxTransaction does not include polling step - returns undefined and no timer', () => {
    it('idxTransaction is undefined', () => {
      const { result } = renderHook(() => usePolling(undefined));
      expect(result.current).toBeUndefined();
      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('idxTransaction exists but does not includes polling step', () => {
      const idxTransaction = {
        nextStep: {
          name: 'fake-step',
        },
      } as IdxTransaction;
      const { result } = renderHook(() => usePolling(idxTransaction));
      expect(result.current).toBeUndefined();
      expect(setTimeout).not.toHaveBeenCalled();
    });
  });

  describe('idxTransaction includes polling step - returns transaction and setup polling timer', () => {
    it('polling step in nextStep', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
          action: jest.fn(),
        },
      });
      // @ts-ignore remove after adding refresh to nextStep in auth-js
      const idxTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
          action: mockAction,
        },
      } as IdxTransaction;
      const { result, waitForNextUpdate } = renderHook(() => usePolling(idxTransaction));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockAction).toHaveBeenCalled();

      // expect to return new polling transaction
      await waitForNextUpdate();
      expect(result.current).toMatchObject({
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
        },
      });
    });

    it('polling step in availableSteps', () => {
      const mockAction = jest.fn().mockResolvedValue({});
      // @ts-ignore Remove after auth-js OKTA-502378 fix
      const idxTransaction = {
        availableSteps: [{
          name: 'currentAuthenticatorEnrollment-poll',
          action: mockAction,
        } as NextStep],
        rawIdxState: {
          currentAuthenticatorEnrollment: {
            type: 'object',
            value: {
              poll: {
                refresh: 5000,
              },
            },
          },
        },
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('uses default timeout when no refresh is found from transaction', () => {
      const mockAction = jest.fn().mockResolvedValue({});
      const idxTransaction = {
        availableSteps: [{
          name: 'currentAuthenticatorEnrollment-poll',
          action: mockAction,
        } as NextStep],
        rawIdxState: {},
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);
    });
  });
});
