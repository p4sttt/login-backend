import { body } from "express-validator";

export const validator = [
  body('username', 'Имя пользователя должно находиться в диапозоне от 3 до 8 символов').isLength({min: 3, max: 8}),
  body('passwordHash', 'Пороль должен быть длинее 5 символов').isLength({min: 5}),
]