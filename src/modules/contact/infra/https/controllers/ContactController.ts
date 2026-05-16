import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindAllService from '@modules/contact/services/contact/FindAllService';
import CreateService from '@modules/contact/services/contact/CreateService';
import DeleteService from '@modules/contact/services/contact/DeleteService';
import UpdateStatusService from '@modules/contact/services/contact/UpdateStatusService';
import { EContactStatus } from '@modules/contact/dto/IContactDTO';

export default class ContactController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindAllService);
    const result = await service.execute(req.query);
    return res.json(result);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(CreateService);
    const result = await service.execute(req.body);
    return res.status(201).json(result);
  }

  public async updateStatus(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(UpdateStatusService);
    const { status } = req.body as { status: EContactStatus };
    const result = await service.execute(req.params.id, status, req.userEmail);
    return res.json(result);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(DeleteService);
    const result = await service.execute(req.params.id);
    return res.json(result);
  }
}
