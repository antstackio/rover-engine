exports.lambdaHandler = async (event) => {
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false;
  return event;
};
