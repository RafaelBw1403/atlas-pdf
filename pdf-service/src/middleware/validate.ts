import type { ZodType, ZodObject } from "zod";
import type { RequestHandler } from "express";

// If you only validate objects (common in APIs):
export const validate =
    (schema: ZodObject): RequestHandler =>
    (req, _res, next) => {
        try {
        req.body = schema.parse(req.body);
        next();
        } catch (err) {
        next(err);
        }
    };

// If you want to allow *any* schema (object, string, union, etc.):
export const validateAny =
    (schema: ZodType): RequestHandler =>
    (req, _res, next) => {
        try {
        req.body = schema.parse(req.body);
        next();
        } catch (err) {
        next(err);
        }
    };