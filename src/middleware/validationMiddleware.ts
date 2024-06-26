import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const validateSchema =
  (schema: yup.ObjectSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const file = req.file;
      const params = req.params;
      const query = req.query;
      const payload = { ...body, file, ...params, ...query };
      await schema.validate(payload, { abortEarly: false });
      next();
    } catch (error) {
      const errors = error.inner.map((err: yup.ValidationError) => {
        return {
          field: err.path,
          message: err.message,
        };
      });
      console.log(errors);
      res.status(400).json({ status: false, message: "Bad Request", errors });
    }
  };

export default validateSchema;
