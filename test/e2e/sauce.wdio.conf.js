/* eslint-disable */
const path = require('path');
require('@okta/env').config();
require('@babel/register'); // Allows use of import module syntax
require('regenerator-runtime'); // Allows use of async/await
const wdioConfig = require('./wdio.conf');
// ensures 'capabilities', 'services' and 'reporters' will need to be defined in this conf file
const { capabilities, services, reporters, ...conf } = wdioConfig;

const DEBUG = process.env.DEBUG;
const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;

exports.config = {
  ...conf,
  jasmineNodeOpts: {
    defaultTimeoutInterval,
    stopSpecOnExpectationFailure: true
  },
  runner: 'local',
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  maxInstances: 1,
  waitforTimeout: 90000,
  capabilities: [
    {
      maxInstances: 1, // all tests use the same user and local storage. they must run in series
      browserName: 'MicrosoftEdge',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      "ms:edgeOptions": {} // don't delete this line, edge tests won't run
    },
    {
      maxInstances: 1, // all tests use the same user and local storage. they must run in series
      browserName: 'internet explorer',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      "se:ieOptions": {
          acceptUntrustedCertificates: true,
          "ie.ensureCleanSession": true
      },
      exclude:[
          path.resolve(__dirname, './specs/basic-dev.e2e.js'),
          path.resolve(__dirname, './specs/interactionCode.e2e.js'),
          path.resolve(__dirname, './specs/oidc.e2e.js'),
          path.resolve(__dirname, './specs/csp.e2e.js')
      ],
      timeouts: { "implicit": 20_000 }
    }
  ],
  services: [
    ['sauce', {
      sauceConnect: true,
      sauceConnectOpts: {
        tunnelIdentifier: 'SIW-e2e-tunnel',
        public: 'share'
      }
    }],
    ['iedriver']
  ],
  reporters: [
    'spec',
    ['junit', {
      outputDir: 'build2/reports/e2e-wdio-saucelabs',
      outputFileFormat: function() { // optional
        return 'e2e-wdio-saucelabs-results.xml';
      }
    }]
  ],
  ieDriverLogs: 'build2/reports/ieLogs',
};