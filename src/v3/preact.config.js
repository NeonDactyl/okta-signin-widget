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

/* eslint-disable import/no-extraneous-dependencies */
import buffer from 'buffer';
import { resolve } from 'path';
import { existsSync, copyFileSync } from 'fs';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import envVars from 'preact-cli-plugin-env-vars';
import { DefinePlugin } from 'webpack';

const PROJECT_ROOT = resolve(__dirname, '../../');
const TARGET = resolve(PROJECT_ROOT, 'target');
const PLAYGROUND = resolve(PROJECT_ROOT, 'playground');
const DEV_SERVER_PORT = 3000;
const MOCK_SERVER_PORT = 3030;
const WIDGET_RC_JS = resolve(PROJECT_ROOT, '.widgetrc.js');
const WIDGET_RC = resolve(PROJECT_ROOT, '.widgetrc');

// run `OKTA_SIW_HOST=0.0.0.0 yarn start --watch` to override the host
const HOST = process.env.OKTA_SIW_HOST || 'localhost';

if (!existsSync(WIDGET_RC_JS) && existsSync(WIDGET_RC)) {
  console.error('============================================');
  console.error(`Please migrate the ${WIDGET_RC} to ${WIDGET_RC_JS}.`);
  /* eslint-disable-next-line @okta/okta/no-exclusive-language */
  console.error('For more information, please see https://github.com/okta/okta-signin-widget/blob/master/MIGRATING.md');
  console.error('============================================');
  process.exit(1);
}

if (!existsSync(WIDGET_RC_JS)) {
  // create default WIDGET_RC if it doesn't exist to simplifed the build process
  copyFileSync('.widgetrc.sample.js', WIDGET_RC_JS);
}

export default {
  webpack(config, env, helpers) {
    /* eslint-disable no-param-reassign */
    config.output.libraryTarget = 'umd';
    config.output.filename = ({ chunk }) => (
      chunk.name === 'bundle'
        ? 'okta-sign-in.next.js'
        : '[name].next.js'
    );
    config.plugins = config.plugins.filter(
      (plugin) => !(plugin instanceof MiniCssExtractPlugin),
    );

    config.module.rules = config.module.rules.map((rule) => {
      // Excludes SVG from file loader rule
      if (rule.test && rule.test.test('.svg')) {
        rule.exclude = /\.svg$/;
      }
      if (rule.loader === 'babel-loader') {
        const use = [
          {
            loader: 'babel-loader',
            options: rule.options,
          },
          {
            loader: 'ts-loader',
          },
        ];
        return {
          ...rule,
          loader: undefined,
          options: undefined,
          use,
        };
      }
      // exclude svg from url-loader
      // preact-svg-loader is used for svg
      if (rule.loader && rule.loader.includes('url-loader')) {
        rule.test = /\\.(woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\\?.*)?$/i;
      }
      if (rule.use) {
        return {
          ...rule,
          use: rule.use.reduce((acc, loader) => {
            acc.push(
              loader !== MiniCssExtractPlugin.loader ? loader : 'style-loader',
            );
            return acc;
          }, []),
        };
      }

      return rule;
    });

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      use: [
        {
          loader: 'preact-svg-loader',
          options: {
            mangleIds: false,
          },
        },
      ],
    });

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = resolve(
      process.cwd(),
      'src',
      'index',
    );
    config.resolve.alias['@okta/okta-auth-js'] = resolve(
      process.cwd(),
      'node_modules/@okta/okta-auth-js/dist/okta-auth-js.umd.js',
    );

    if (env.production) {
      config.output.libraryTarget = 'umd';
    }

    // polyfills for jsonforms
    config.plugins.push(
      new DefinePlugin({
        // https://github.com/APIDevTools/json-schema-ref-parser#browser-support
        process: {
          browser: true,
        },
        Buffer: buffer,
      }),
    );

    config.devServer = {
      host: HOST,
      static: [PLAYGROUND, TARGET, {
        staticOptions: {
          watchContentBase: true
        }
      }],
      historyApiFallback: true,
      // FIXME CSP prevents scripts from loading in dev mode
      // headers: { 'Content-Security-Policy': `script-src http://${HOST}:${DEV_SERVER_PORT}` },
      compress: true,
      port: DEV_SERVER_PORT,
      proxy: [{
        context: [
          '/oauth2/',
          '/api/v1/',
          '/idp/idx/',
          '/login/getimage',
          '/sso/idps/',
          '/app/UserHome',
          '/oauth2/v1/authorize',
          '/auth/services/',
          '/.well-known/webfinger'
        ],
        target: `http://${HOST}:${MOCK_SERVER_PORT}`
      }],
    },

    // preact-cli-plugin-env-vars
    envVars(config, env, helpers);
    /* eslint-enable no-param-reassign */
  },
};
