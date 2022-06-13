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

import { ControlElement } from '@jsonforms/core';
import { IdxAuthenticator } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformSecurityQuestionVerify } from '.';

describe('SecurityQuestionVerify Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          scope: '#/properties/credentials/properties/answer',
          // Set by generic transformer before reaching this
          options: { secret: true },
        } as ControlElement],
      },
    };
  });

  it('should create security question verify UI elements', () => {
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            question: 'What is love?',
            questionKey: 'eternal',
          },
          id: '',
          displayName: '',
          key: '',
          type: '',
          methods: [],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionVerify(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');

    // answer element
    expect(updatedFormBag.uischema.elements[1].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[1].options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[1] as ControlElement).label).toBe('What is love?');

    // submit button
    expect(updatedFormBag.uischema.elements[2].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[2].options?.type).toBe(ButtonOptionType.SUBMIT);
  });

  it('should create security question verify UI elements for custom question', () => {
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            question: 'What is love?',
            questionKey: 'custom',
          },
          id: '',
          displayName: '',
          key: '',
          type: '',
          methods: [],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionVerify(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');

    // answer element
    expect(updatedFormBag.uischema.elements[1].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[1].options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[1] as ControlElement).label).toBe('What is love?');

    // submit button
    expect(updatedFormBag.uischema.elements[2].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[2].options?.type).toBe(ButtonOptionType.SUBMIT);
  });
});
