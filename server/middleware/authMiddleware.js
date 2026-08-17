import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authorizationHeader =
    req.headers.authorization;

  const token =
    authorizationHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "No token",
    });
  }

  try {
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

export default authMiddleware;