import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindAllService from '@modules/notification/services/notification/FindAllService';
import CreateService from '@modules/notification/services/notification/CreateService';
import DeleteService from '@modules/notification/services/notification/DeleteService';
import FindByIdService from '@modules/notification/services/notification/FindByIdService';
import UpdateService from '@modules/notification/services/notification/UpdateService';
import ReadAllNotifyService from '@modules/notification/services/notification/ReadAllNotifyService';
import ReadNotifyService from '@modules/notification/services/notification/ReadNotifyService';
import CreateAndNotifyService from '@modules/notification/services/notification/CreateAndNotifyService';

export default class NotificationController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindAllService);
    const result = await service.execute(req.query);
    return res.json(result);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(CreateService);
    const result = await service.execute(
      {
        ...req.body,
        user: req.userId,
      },
      req.userEmail,
    );

    return res.json(result);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(DeleteService);
    const result = await service.execute(req.params.id as string);
    return res.json(result);
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindByIdService);
    const result = await service.execute(req.params.id as string);
    return res.json(result);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(UpdateService);
    const result = await service.execute(
      req.params.id as string,
      req.body,
      req.userEmail,
    );
    return res.json(result);
  }

  public async redAllNotify(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(ReadAllNotifyService);
    const result = await service.execute(req.userEmail);
    return res.json(result);
  }

  public async redNotify(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(ReadNotifyService);
    const result = await service.execute(
      req.params.id as string,
      req.body,
      req.userEmail,
    );
    return res.json(result);
  }

  public async createAndNotify(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(CreateAndNotifyService);
    const result = await service.execute({
      ...req.body,
      created_by: req.userEmail,
    });
    return res.json(result);
  }
}
