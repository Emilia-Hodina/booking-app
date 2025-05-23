import { Request, Response, NextFunction, RequestHandler } from "express";

const authorizeRole = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  };
};

export default authorizeRole;
