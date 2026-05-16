#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

// Função auxiliar para capitalizar primeira letra
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função para converter para camelCase
function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join('');
}

// Função para converter para PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => capitalize(word))
    .join('');
}

// Templates
const templates = {
  dto: (resourceName: string) => `import { Document } from 'mongoose';

export interface I${resourceName}DTO {
  name: string;
  description?: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface I${resourceName}Document extends I${resourceName}DTO, Document {}
`,

  repositoryInterface: (
    resourceName: string,
    moduleName: string,
  ) => `import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface I${resourceName}Repository
  extends IBaseRepository<I${resourceName}DTO, I${resourceName}Document> {
  // Adicione métodos customizados aqui
}
`,

  repositoryImpl: (
    resourceName: string,
    moduleName: string,
  ) => `import { Model } from 'mongoose';
import { ${resourceName} } from '@modules/${moduleName}/infra/mongo/models/${resourceName}';
import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class ${resourceName}Repository
  extends BaseMongoRepository<I${resourceName}DTO, I${resourceName}Document>
  implements I${resourceName}Repository
{
  protected readonly model: Model<I${resourceName}Document> = ${resourceName};
  protected readonly modelPopulated = [];
}
`,

  model: (
    resourceName: string,
    moduleName: string,
  ) => `import { I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import mongoose, { Schema } from 'mongoose';

const schema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    created_by: { type: String },
    updated_by: { type: String },
  },
  {
    timestamps: true,
  },
);

export const ${resourceName} = mongoose.model<I${resourceName}Document>('${resourceName}', schema);
`,

  createService: (
    resourceName: string,
    moduleName: string,
  ) => `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(
    data: I${resourceName}DTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<I${resourceName}Document>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: '${resourceName} criado com sucesso!',
      data: created,
    };
  }
}
`,

  updateService: (
    resourceName: string,
    moduleName: string,
  ) => `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(
    id: string,
    data: Partial<I${resourceName}DTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<I${resourceName}Document>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: '${resourceName} não encontrado' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: '${resourceName} atualizado com sucesso!',
      data: updated!,
    };
  }
}
`,

  deleteService: (
    resourceName: string,
    moduleName: string,
  ) => `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: '${resourceName} não encontrado' });
    }

    return {
      success: true,
      message: '${resourceName} deletado com sucesso!',
      data: { id: deleted.id },
    };
  }
}
`,

  findAllService: (
    resourceName: string,
    moduleName: string,
  ) => `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import { IPaginatedResult } from '@shared/utils/pagination';
import { applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<I${resourceName}Document>> {
    let queryParams: Record<string, any> = {};

    // Aplica busca textual
    queryParams = applySearchParam(query, queryParams, {
      textFields: ['name', 'description'],
    });

    // Aplica paginação
    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll(queryParams),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
`,

  findByIdService: (
    resourceName: string,
    moduleName: string,
  ) => `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(id: string): Promise<I${resourceName}Document> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: '${resourceName} não encontrado' });
    }
    return exist;
  }
}
`,

  controller: (
    resourceName: string,
    moduleName: string,
    resourceLower: string,
  ) => `import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindAllService from '@modules/${moduleName}/services/${resourceLower}/FindAllService';
import CreateService from '@modules/${moduleName}/services/${resourceLower}/CreateService';
import DeleteService from '@modules/${moduleName}/services/${resourceLower}/DeleteService';
import FindByIdService from '@modules/${moduleName}/services/${resourceLower}/FindByIdService';
import UpdateService from '@modules/${moduleName}/services/${resourceLower}/UpdateService';

export default class ${resourceName}Controller {
  public async findAll(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(FindAllService);
    const result = await service.execute(req.query);
    return res.json(result);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(CreateService);
    const result = await service.execute(req.body, req.userEmail);
    return res.json(result);
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
`,

  routes: (
    resourceName: string,
    moduleName: string,
  ) => `import { Router } from 'express';
import ${resourceName}Controller from '@modules/${moduleName}/infra/https/controllers/${resourceName}Controller';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new ${resourceName}Controller();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.post('/', [verifyToken], controller.create);
router.get('/', [verifyToken], controller.findAll);
router.get('/:id', [verifyToken], controller.findById);
router.put('/:id', [verifyToken], controller.update);
router.delete('/:id', [verifyToken], controller.delete);

export default router;
`,

  container: (
    resourceName: string,
    moduleName: string,
  ) => `import { container } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import ${resourceName}Repository from '@modules/${moduleName}/infra/mongo/repositories/${resourceName}Repository';

container.registerSingleton<I${resourceName}Repository>(
  '${resourceName}Repository',
  ${resourceName}Repository,
);
`,
};

// Função principal
function generateModule(moduleName: string) {
  const resourceName = toPascalCase(moduleName);
  const resourceLower = toCamelCase(moduleName);
  const basePath = path.join(process.cwd(), 'src', 'modules', moduleName);

  console.log(`\n🚀 Gerando módulo: ${moduleName}`);
  console.log(`📦 Resource: ${resourceName}\n`);

  // Criar estrutura de pastas
  const folders = [
    'container',
    'dto',
    'infra/https/controllers',
    'infra/https/routes',
    'infra/mongo/models',
    'infra/mongo/repositories',
    'repositories',
    `services/${resourceLower}`,
  ];

  folders.forEach(folder => {
    const folderPath = path.join(basePath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`✅ Criada pasta: ${folder}`);
    }
  });

  // Criar arquivos
  const files = [
    {
      path: `dto/I${resourceName}DTO.ts`,
      content: templates.dto(resourceName),
    },
    {
      path: `repositories/I${resourceName}Repository.ts`,
      content: templates.repositoryInterface(resourceName, moduleName),
    },
    {
      path: `infra/mongo/repositories/${resourceName}Repository.ts`,
      content: templates.repositoryImpl(resourceName, moduleName),
    },
    {
      path: `infra/mongo/models/${resourceName}.ts`,
      content: templates.model(resourceName, moduleName),
    },
    {
      path: `services/${resourceLower}/CreateService.ts`,
      content: templates.createService(resourceName, moduleName),
    },
    {
      path: `services/${resourceLower}/UpdateService.ts`,
      content: templates.updateService(resourceName, moduleName),
    },
    {
      path: `services/${resourceLower}/DeleteService.ts`,
      content: templates.deleteService(resourceName, moduleName),
    },
    {
      path: `services/${resourceLower}/FindAllService.ts`,
      content: templates.findAllService(resourceName, moduleName),
    },
    {
      path: `services/${resourceLower}/FindByIdService.ts`,
      content: templates.findByIdService(resourceName, moduleName),
    },
    {
      path: `infra/https/controllers/${resourceName}Controller.ts`,
      content: templates.controller(resourceName, moduleName, resourceLower),
    },
    {
      path: `infra/https/routes/${resourceLower}Router.ts`,
      content: templates.routes(resourceName, moduleName),
    },
    {
      path: 'container/index.ts',
      content: templates.container(resourceName, moduleName),
    },
  ];

  files.forEach(file => {
    const filePath = path.join(basePath, file.path);
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ Criado arquivo: ${file.path}`);
  });

  // Atualizar container global
  const containerPath = path.join(
    process.cwd(),
    'src',
    'shared',
    'container',
    'index.ts',
  );
  if (fs.existsSync(containerPath)) {
    let containerContent = fs.readFileSync(containerPath, 'utf-8');
    const importLine = `import '@modules/${moduleName}/container';`;

    if (!containerContent.includes(importLine)) {
      // Adicionar import antes da última linha
      containerContent = containerContent.trimEnd() + `\n${importLine}\n`;
      fs.writeFileSync(containerPath, containerContent);
      console.log(`✅ Atualizado: src/shared/container/index.ts`);
    }
  }

  // Atualizar routes global
  const routesPath = path.join(
    process.cwd(),
    'src',
    'shared',
    'infra',
    'https',
    'routes',
    'index.ts',
  );
  if (fs.existsSync(routesPath)) {
    let routesContent = fs.readFileSync(routesPath, 'utf-8');
    const importLine = `import ${resourceLower}Routes from '@modules/${moduleName}/infra/https/routes/${resourceLower}Router';`;
    const useLine = `routes.use('/${moduleName}', ${resourceLower}Routes);`;

    if (!routesContent.includes(importLine)) {
      // Adicionar import no início (após outros imports)
      const lines = routesContent.split('\n');
      const lastImportIndex = lines.findIndex(
        (line: string) =>
          line.startsWith('import') && line.includes('@modules'),
      );
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }

      // Adicionar rota antes do export
      const exportIndex = lines.findIndex((line: string) =>
        line.includes('export default'),
      );
      if (exportIndex >= 0) {
        lines.splice(exportIndex, 0, useLine);
      } else {
        lines.push(useLine);
      }

      fs.writeFileSync(routesPath, lines.join('\n'));
      console.log(`✅ Atualizado: src/shared/infra/https/routes/index.ts`);
    }
  }

  console.log(`\n✨ Módulo "${moduleName}" criado com sucesso!`);
  console.log(`\n📝 Próximos passos:`);
  console.log(
    `   1. Ajuste os campos do DTO em: src/modules/${moduleName}/dto/I${resourceName}DTO.ts`,
  );
  console.log(
    `   2. Ajuste o schema em: src/modules/${moduleName}/infra/mongo/models/${resourceName}.ts`,
  );
  console.log(`   3. Compile e teste: npm run build && npm run dev`);
  console.log(
    `\n🔗 Rotas disponíveis em: https://localhost:PORT/api/${moduleName}`,
  );
}

// Execução
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Erro: Nome do módulo não fornecido');
  console.log('📖 Uso: npm run generate:module <nome-do-modulo>');
  console.log('📖 Exemplo: npm run generate:module products');
  process.exit(1);
}

generateModule(moduleName);
