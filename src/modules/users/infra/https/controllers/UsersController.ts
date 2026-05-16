import { Request, Response } from 'express';
import { container } from 'tsyringe';
import CreateUserService from '@modules/users/services/user/CreateService';
import AuthService from '@modules/users/services/auth/AuthenticateUser';
import UpdateUserService from '@modules/users/services/user/UpdateService';
import AddPermissionsByUserIdService from '@modules/users/services/user/AddPermissionByUserIdService';
import FindAllService from '@modules/users/services/user/FindAllService';
import FindByIdService from '@modules/users/services/user/FindByIdService';
import GetMeService from '@modules/users/services/user/GetMeService';
import { logger } from '@shared/utils/logger';
import DeleteServiceService from '@modules/users/services/user/DeleteService';
import RefreshTokenService from '@modules/users/services/user/RefreshTokenService';
import RemovePermissionByUserIdService from '@modules/users/services/user/RemovePermissionByUserIdService';
import GetAbilityUserAuthService from '@modules/users/services/auth/GetAbilityUserAuthService';
import IsBlockedService from '@modules/users/services/block/IsBlockedService';
import { getClientInfo } from '@shared/utils/request';

export default class UsersController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindAllService);
    const users = await service.execute(req.query);
    return res.json(users);
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindByIdService);
    const result = await service.execute(req.params.id);
    return res.status(200).json(result);
  }

  public async signup(req: Request, res: Response): Promise<Response> {
    const createUser = container.resolve(CreateUserService);
    const result = await createUser.execute(req.body);
    return res.status(201).json(result);
  }

  public async signin(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const isBlockedService = container.resolve(IsBlockedService);
    const { blocked, minutesLeft } = await isBlockedService.execute(email);

    if (blocked) {
      res.status(401).send({
        message: `Usuário Bloqueado. Aguarde ${minutesLeft} minuto(s) to expire.`,
      });
      return;
    }

    const { ip, userAgent } = getClientInfo(req);

    const authService = container.resolve(AuthService);
    const authResponse = await authService.authenticate({
      email,
      password,
      ip,
      userAgent,
    });

    logger.info(`[${ip}] Usuário ${email} autenticado com sucesso!`);

    res.status(200).json(authResponse);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const userData = req.body;
    const servico = container.resolve(UpdateUserService);
    userData.lastupdate = new Date().toLocaleString();
    const updatedUser = await servico.execute(userData._id, userData);
    return res.status(200).json(updatedUser);
  }

  public async updateUser(req: Request, res: Response): Promise<Response> {
    const userData = req.body;
    const { id } = req.params;
    const servico = container.resolve(UpdateUserService);
    const updatedUser = await servico.execute(id, userData);
    return res.status(200).json(updatedUser);
  }

  public async addPermissionByUserId(req: Request, res: Response) {
    const service = container.resolve(AddPermissionsByUserIdService);
    const result = await service.execute(req.params.id, req.body);
    return res.status(200).json(result);
  }

  public async removePermissionByUserId(req: Request, res: Response) {
    const service = container.resolve(RemovePermissionByUserIdService);
    const result = await service.execute(req.params.id, req.body);
    return res.status(200).json(result);
  }

  public async getUserAuth(req: Request, res: Response) {
    const service = container.resolve(GetMeService);
    const result = await service.execute(req.userId as string);
    return res.status(200).json(result);
  }

  public async create(req: Request, res: Response) {
    const service = container.resolve(CreateUserService);
    const result = await service.execute(req.body);
    return res.status(200).json(result);
  }

  public async refreshToken(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const service = container.resolve(RefreshTokenService);
    const result = await service.execute(
      req.body.refreshToken as string,
      ip,
      userAgent,
    );
    return res.status(200).json(result);
  }

  public async delete(req: Request, res: Response) {
    const service = container.resolve(DeleteServiceService);
    const result = await service.execute(req.params.id);
    return res.status(200).json(result);
  }

  public async getAbilityUserAuth(req: Request, res: Response) {
    const service = container.resolve(GetAbilityUserAuthService);
    const result = await service.execute(req.userId as string);
    return res.status(200).json(result);
  }

  public async getMe(req: Request, res: Response) {
    const service = container.resolve(GetMeService);
    const result = await service.execute(req.userId as string);
    return res.status(200).json(result);
  }
}
