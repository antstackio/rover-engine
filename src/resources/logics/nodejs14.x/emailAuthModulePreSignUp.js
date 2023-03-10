// WE GOT THIS FROM THE LOGICS DIRECTORY
exports.lambdaHandler = async (event) => {
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false;
  return event;
};
