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

import { IdxTransaction } from '@okta/okta-auth-js';
import { flow } from 'lodash';
import { FormBag } from 'src/types';

import { transformAvailableSteps } from './availableSteps';
import { transformField } from './field';
import { transformLayout } from './formLayouts';
import { transformSubmit } from './submit';

// use this function after each transformation step to log the formbag output
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = (formbag: FormBag) => {
  console.log(formbag);
  return formbag;
};

export const transformIdxTransaction = (transaction: IdxTransaction): FormBag => {
  const transformFn = flow([
    // Transform form fields from idxTransaction.nextStep
    transformField(transaction),
    // Transform submit button
    transformSubmit(transaction),
    // Transform action buttons from idxTransaction.availableSteps
    transformAvailableSteps(transaction),
    // Last step: pick ui elements based on custom layout
    transformLayout(transaction),
  ]);

  return transformFn({
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
    uischema: {
      type: 'VerticalLayout',
      elements: [],
    },
  });
};
