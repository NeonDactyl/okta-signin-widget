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

import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformGoogleAuthenticatorVerify } from '.';

describe('Google Authenticator Verify Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;

  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
    };
  });

  it('should add UI elements', () => {
    const updatedFormBag = transformGoogleAuthenticatorVerify(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2]?.options?.type).toBe(ButtonOptionType.SUBMIT);
  });
});
