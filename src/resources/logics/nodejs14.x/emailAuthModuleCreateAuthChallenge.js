exports.lambdaHandler = async (event) => {
  let password;
  if (!event.request.session || !event.request.session.length) {
    // new session, so fetch password from the db
    // Developer can fetch username and email from the event object -
    // const username = event.request.userAttributes.email;
    // const user = event.request.userAttributes.username;
    password = event.request.userAttributes.password;
  } else {
    const previousChallenge = event.request.session.slice(-1)[0];
    password = previousChallenge.challengeMetadata.match(/PASSWORD-(d*)/)[1];
  }
  // This is sent back to the client app
  event.response.publicChallengeParameters = {
    username: event.request.userAttributes.email,
  };

  // Add the secret login code to the private challenge parameters
  // so it can be verified by the "Verify Auth Challenge Response" trigger
  event.response.privateChallengeParameters = { password };

  // Add the secret login code to the session so it is available
  // in a next invocation of the "Create Auth Challenge" trigger
  event.response.challengeMetadata = `PASSWORD - ${password}`;
  return event;
};
