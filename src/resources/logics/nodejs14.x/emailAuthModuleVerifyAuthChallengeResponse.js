const md5 = require("md5");

exports.lambdaHandler = async (event) => {
  const expectedAnswer = event.request.privateChallengeParameters.password;
  if (md5(event.request.challengeAnswer) === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event;
};
