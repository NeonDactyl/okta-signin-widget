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
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformEmailVerification } from '.';

describe('Email Verification Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/methodType',
            options: {
              choices: [{ key: 'email' }],
            },
          } as ControlElement,
        ],
      },
    };
  });

  it('should update methodType element and add appropriate UI elements to schema'
    + ' when redacted email does not exist in Idx response', () => {
    const updatedFormBag = transformEmailVerification(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('next.email.verify.subtitleWithoutEmailAddress');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/methodType');
    expect(updatedFormBag.uischema.elements[2].options?.type).toBe('hidden');
    expect(formBag.data?.methodType).toBe('email');
    expect(updatedFormBag.uischema.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('oie.email.verify.primaryButton');
  });

  it('should update methodType element and add appropriate UI elements to schema'
    + ' when redacted email exists in Idx response', () => {
    transaction.nextStep = {
      canResend: true,
      authenticator: {
        // @ts-ignore OKTA-483184 (profile missing from authenticator interface)
        profile: {
          email: 'some.xxxx@xxxx.com',
        },
      },
    };

    const updatedFormBag = transformEmailVerification(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('next.email.verify.subtitleWithEmailAddress');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/methodType');
    expect(updatedFormBag.uischema.elements[2].options?.type).toBe('hidden');
    expect(formBag.data?.methodType).toBe('email');
    expect(updatedFormBag.uischema.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('oie.email.verify.primaryButton');
  });
});
