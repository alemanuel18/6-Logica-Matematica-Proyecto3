export const asyncHandler = (handler) => (request, response, next) => {
  Promise.resolve()
    .then(() => handler(request, response))
    .catch(next);
};
