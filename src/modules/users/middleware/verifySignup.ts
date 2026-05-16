import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import { ConflictError } from '@shared/errors/AppError';

export const checkDuplicateUsernameOrEmail = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const usersRepository =
    container.resolve<IUsersRepository>('UsersRepository');

  const userByUsername = await usersRepository.findOne({
    username: req.body.username,
  });
  if (userByUsername) {
    throw new ConflictError({ message: 'O nome de usuário já existe' });
  }

  const userByEmail = await usersRepository.findByEmail(req.body.email);
  if (userByEmail) {
    throw new ConflictError({ message: 'O email já existe' });
  }

  next();
};

export const checkRoleExisted = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body.role) {
    const roleRepository = container.resolve<IRoleRepository>('RoleRepository');
    const roleExist = await roleRepository.findById(req.body.role);

    if (!roleExist) {
      throw new ConflictError({
        message: `Role '${req.body.role}' não existe!`,
      });
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRoleExisted,
};

export default verifySignUp;
