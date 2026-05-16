import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindAllService from '@modules/certification/services/certification/FindAllService';
import CreateService from '@modules/certification/services/certification/CreateService';
import DeleteService from '@modules/certification/services/certification/DeleteService';
import FindByIdService from '@modules/certification/services/certification/FindByIdService';
import UpdateService from '@modules/certification/services/certification/UpdateService';

export default class CertificationController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindAllService);
    const result = await service.execute(req.query);
    return res.json(result);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(CreateService);
    const result = await service.execute(req.body, req.userEmail);
    return res.status(201).json(result);
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindByIdService);
    const result = await service.execute(req.params.id);
    return res.json(result);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(UpdateService);
    const result = await service.execute(req.params.id, req.body, req.userEmail);
    return res.json(result);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(DeleteService);
    const result = await service.execute(req.params.id);
    return res.json(result);
  }
}
