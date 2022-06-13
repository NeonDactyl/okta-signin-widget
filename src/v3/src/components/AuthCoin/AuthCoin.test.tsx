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

import { render } from '@testing-library/preact';
import { h } from 'preact';
import { AuthCoinProps } from 'src/types';

import AuthCoin from './AuthCoin';

describe('AuthCoin tests', () => {
  let props: AuthCoinProps;

  beforeEach(() => {
    props = {
      authenticatorKey: 'custom_otp',
    };
  });

  it('should display Branded AuthCoin and disallow style customization', async () => {
    props = {
      authenticatorKey: 'duo',
    };

    const { findByText } = render(<AuthCoin {...props} />);

    expect(await findByText('', { selector: 'MockSVGIcon' })).toBeDefined();
  });

  it('should display standard theme Non-Branded AuthCoin without style customization', async () => {
    const { findByText } = render(<AuthCoin {...props} />);

    expect(await findByText('', { selector: 'MockSVGIcon' })).toBeDefined();
  });

  it('should display Non-Branded AuthCoin with style customizations', async () => {
    const { findByText } = render(<AuthCoin {...props} />);

    expect(await findByText('', { selector: 'MockSVGIcon' })).toBeDefined();
  });

  it('should display custom image in place of standard Non-Branded '
    + 'AuthCoin when image URL is provided', async () => {
    props = {
      ...props,
      url: '/img/socialButtonIcons/okta.svg',
    };

    const { findByAltText } = render(<AuthCoin {...props} />);

    expect(await findByAltText('Custom OTP')).toBeDefined();
  });

  it('should display branded AuthCoin when image URL is provided and '
    + 'AuthenticatorKey requires a branded Type', async () => {
    props = {
      authenticatorKey: 'duo',
      url: '/img/socialButtonIcons/okta.svg',
    };

    const { findByText } = render(<AuthCoin {...props} />);

    expect(await findByText('', { selector: 'MockSVGIcon' })).toBeDefined();
  });

  it('should not render the component when invalid authenticator key is provided', async () => {
    props = {
      authenticatorKey: 'blah',
    };

    const { findByText, container } = render(<AuthCoin {...props} />);

    expect(container.childElementCount).toBe(0);
    expect(await findByText('', { selector: 'div' })).toBeDefined();
  });
});
