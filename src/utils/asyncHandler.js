
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

//? In the a async function we get 4 arguments -> err, req, res and next

// const asyncHandler = (fn) => async (err, req, res, next) => {

//     try {

//         await fn(req, res, next)

//     } catch (error) {
//     res.status(err.code || error.message).json({
//         success: false,
//         message: err.message
//     })
//     }
// };
