const identifyChallengeMockWithError = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/answer': [
    'error-401-invalid-otp-passcode'
  ],
  '/idp/idx/cancel': [
    'identify'
  ]
};

const challengeSuccessMock = {
  ...identifyChallengeMockWithError,
  '/oauth2/default/.well-known/openid-configuration': [
    'well-known-openid-configuration'
  ],
  '/oauth2/default/v1/interact': [
    'interact'
  ],
  '/idp/idx/challenge/answer': [
    'success-with-interaction-code'
  ],
  '/oauth2/default/v1/token': [
    'success-tokens'
  ]
};

module.exports = {
  identifyChallengeMockWithError,
  challengeSuccessMock
};
