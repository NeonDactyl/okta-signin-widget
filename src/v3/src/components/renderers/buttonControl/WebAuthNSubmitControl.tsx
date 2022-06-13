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

import { CellProps } from '@jsonforms/core';
import { Box, Button, CircularLoadIndicator } from '@okta/odyssey-react';
import { IdxActionParams } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../../../contexts';
import { ClickHandler, MessageType } from '../../../types';

const WebAuthNSubmitControl: FunctionComponent<CellProps> = (props) => {
  const { uischema: { options } } = props;

  const { setMessages, setIdxTransaction } = useWidgetContext();
  const { t, i18n } = useTranslation();
  const [waiting, setWaiting] = useState<boolean>(false);

  const waitingIndicatorLabel = t('renderers.waiting.indicator.label');
  const waitingIndicatorStateLabel = t('renderers.waiting.indicator.state.label');

  const getErrorMessage = (error: Error): string => {
    const expectedErrorKey = `oie.browser.error.${error.name}`;
    if (i18n.exists(expectedErrorKey)) {
      return t(expectedErrorKey);
    }
    return error.message;
  };

  const executeNextStep = () => {
    if (options?.showLoadingIndicator) {
      setWaiting(true);
    }
    setMessages([]);

    options?.onClick()
      .then(async (params: IdxActionParams) => {
        const transaction = await options?.action(params);
        setIdxTransaction(transaction);
      })
      .catch((error: Error) => {
        const message = getErrorMessage(error);
        setMessages([{
          message,
          class: MessageType.ERROR,
          i18n: { key: message },
        }]);
      })
      .finally(() => setWaiting(false));
  };

  const handleClick: ClickHandler = (event) => {
    event?.preventDefault();
    executeNextStep();
  };

  // FIXME Change this to use hook instead
  // see: https://github.com/okta/siw-next/pull/67#discussion_r817894228
  useEffect(() => {
    if (options?.submitOnLoad) {
      executeNextStep();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // @ts-ignore OKTA-471233
    <Box
      marginBottom="m"
      display={waiting ? 'flex' : undefined}
      justifyContent={waiting ? 'center' : undefined}
    >
      {
        waiting
          ? (
            <CircularLoadIndicator
              aria-label={waitingIndicatorLabel}
              aria-valuetext={waitingIndicatorStateLabel}
            />
          )
          : (
            <Button
              data-testid="proceedBtn"
              size="l"
              onClick={handleClick}
              variant="primary"
              wide
            >
              { t(options?.label) }
            </Button>
          )
      }
    </Box>
  );
};

export default WebAuthNSubmitControl;
