#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

// ─── Helpers ────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join('');
}

function toPascalCase(str: string): string {
  return str.split('-').map(capitalize).join('');
}

function pluralizeWord(word: string): string {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  if (word.endsWith('ão')) return word.slice(0, -2) + 'ões';
  if (word.endsWith('il')) return word.slice(0, -1) + 's';
  if (['al', 'el', 'ol', 'ul'].some(e => word.endsWith(e)))
    return word.slice(0, -1) + 'is';
  if (word.endsWith('m')) return word.slice(0, -1) + 'ns';
  if (word.endsWith('r') || word.endsWith('z')) return word + 'es';
  if (word.endsWith('ch') || word.endsWith('sh') || word.endsWith('x'))
    return word + 'es';
  if (word.endsWith('y') && !vowels.includes(word.slice(-2, -1)))
    return word.slice(0, -1) + 'ies';
  if (word.endsWith('s')) return word;
  return word + 's';
}

function toPlural(str: string): string {
  const parts = str.split('-');
  parts[parts.length - 1] = pluralizeWord(parts[parts.length - 1]);
  return parts.join('-');
}

function writeFile(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  Já existe, pulando: ${path.relative(process.cwd(), filePath)}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ Criado: ${path.relative(process.cwd(), filePath)}`);
}

// ─── Templates ──────────────────────────────────────────────────────────────

const templates = {
  dto: (resourceName: string) =>
    `import { Document } from 'mongoose';

export interface I${resourceName}DTO {
  nome: string;
  descricao?: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface I${resourceName}Document extends I${resourceName}DTO, Document {}
`,

  repositoryInterface: (resourceName: string, moduleName: string) =>
    `import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import IBaseMongoRepository from '@shared/infra/https/mongo/IBaseMongoRepository';

export default interface I${resourceName}Repository
  extends IBaseMongoRepository<I${resourceName}DTO, I${resourceName}Document> {
  // Adicione métodos customizados aqui
}
`,

  repositoryImpl: (resourceName: string, moduleName: string) =>
    `import { Model } from 'mongoose';
import { ${resourceName} } from '@modules/${moduleName}/infra/mongo/models/${resourceName}';
import { I${resourceName}DTO, I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { BaseMongoRepository } from '@shared/infra/https/mongo/BaseMongoRepository';

export default class ${resourceName}Repository
  extends BaseMongoRepository<I${resourceName}DTO, I${resourceName}Document>
  implements I${resourceName}Repository
{
  protected readonly model: Model<I${resourceName}Document> = ${resourceName};
  protected readonly modelPopulated = [];
}
`,

  model: (resourceName: string, moduleName: string) =>
    `import { I${resourceName}Document } from '@modules/${moduleName}/dto/I${resourceName}DTO';
import mongoose, { Schema } from 'mongoose';

const schema: Schema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String },
    created_by: { type: String },
    updated_by: { type: String },
  },
  {
    timestamps: true,
  },
);

export const ${resourceName} = mongoose.model<I${resourceName}Document>('${resourceName}', schema);
`,

  createService: (resourceName: string, moduleName: string) =>
    `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}DTO } from '@modules/${moduleName}/dto/I${resourceName}DTO';

@injectable()
export default class CreateService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(
    data: I${resourceName}DTO,
    userEmail: string | undefined,
  ) {
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

  updateService: (resourceName: string, moduleName: string) =>
    `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { I${resourceName}DTO } from '@modules/${moduleName}/dto/I${resourceName}DTO';
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
  ) {
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

  deleteService: (resourceName: string, moduleName: string) =>
    `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(id: string) {
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

  findAllService: (resourceName: string, moduleName: string) =>
    `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { applyPaginationParams, applySearchParam, buildPaginatedResult } from '@shared/utils/healpers';

@injectable()
export default class FindAllService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ) {
    let queryParams: Record<string, any> = {};

    // Aplica busca textual
    queryParams = applySearchParam(query, queryParams, {
      textFields: ['nome', 'descricao'],
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

  findByIdService: (resourceName: string, moduleName: string) =>
    `import { injectable, inject } from 'tsyringe';
import I${resourceName}Repository from '@modules/${moduleName}/repositories/I${resourceName}Repository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('${resourceName}Repository')
    private repository: I${resourceName}Repository,
  ) {}

  public async execute(id: string) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: '${resourceName} não encontrado' });
    }
    return exist;
  }
}
`,

  controller: (resourceName: string, moduleName: string, resourceLower: string) =>
    `import { Request, Response } from 'express';
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

  routes: (resourceName: string, moduleName: string, resourceLower: string) =>
    `import { Router } from 'express';
import ${resourceName}Controller from '@modules/${moduleName}/infra/https/controllers/${resourceName}Controller';
import { verifyToken } from '@modules/users/infra/https/middleware/authJWT';

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
};

// ─── Main ────────────────────────────────────────────────────────────────────

function generateSubModule(parentModule: string, subModuleName: string) {
  const resourceName = toPascalCase(subModuleName);
  const resourceLower = toCamelCase(subModuleName);
  const basePath = path.join(process.cwd(), 'src', 'modules', parentModule);

  // Valida que o módulo pai existe
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Módulo pai "${parentModule}" não encontrado em src/modules/`);
    process.exit(1);
  }

  console.log(`\n🚀 Adicionando sub-módulo: ${subModuleName} → ${parentModule}`);
  console.log(`📦 Resource: ${resourceName}\n`);

  // Arquivos a criar
  const files: { relPath: string; content: string }[] = [
    {
      relPath: `dto/I${resourceName}DTO.ts`,
      content: templates.dto(resourceName),
    },
    {
      relPath: `repositories/I${resourceName}Repository.ts`,
      content: templates.repositoryInterface(resourceName, parentModule),
    },
    {
      relPath: `infra/mongo/models/${resourceName}.ts`,
      content: templates.model(resourceName, parentModule),
    },
    {
      relPath: `infra/mongo/repositories/${resourceName}Repository.ts`,
      content: templates.repositoryImpl(resourceName, parentModule),
    },
    {
      relPath: `services/${resourceLower}/CreateService.ts`,
      content: templates.createService(resourceName, parentModule),
    },
    {
      relPath: `services/${resourceLower}/UpdateService.ts`,
      content: templates.updateService(resourceName, parentModule),
    },
    {
      relPath: `services/${resourceLower}/DeleteService.ts`,
      content: templates.deleteService(resourceName, parentModule),
    },
    {
      relPath: `services/${resourceLower}/FindAllService.ts`,
      content: templates.findAllService(resourceName, parentModule),
    },
    {
      relPath: `services/${resourceLower}/FindByIdService.ts`,
      content: templates.findByIdService(resourceName, parentModule),
    },
    {
      relPath: `infra/https/controllers/${resourceName}Controller.ts`,
      content: templates.controller(resourceName, parentModule, resourceLower),
    },
    {
      relPath: `infra/https/routes/${resourceLower}Router.ts`,
      content: templates.routes(resourceName, parentModule, resourceLower),
    },
  ];

  files.forEach(({ relPath, content }) =>
    writeFile(path.join(basePath, relPath), content),
  );

  // ── Atualiza container/index.ts do módulo pai ──────────────────────────────
  const containerPath = path.join(basePath, 'container', 'index.ts');
  if (fs.existsSync(containerPath)) {
    let content = fs.readFileSync(containerPath, 'utf-8');

    const importRepo = `import I${resourceName}Repository from '@modules/${parentModule}/repositories/I${resourceName}Repository';`;
    const importImpl = `import ${resourceName}Repository from '@modules/${parentModule}/infra/mongo/repositories/${resourceName}Repository';`;
    const registration = `\ncontainer.registerSingleton<I${resourceName}Repository>(\n  '${resourceName}Repository',\n  ${resourceName}Repository,\n);\n`;

    if (!content.includes(`I${resourceName}Repository`)) {
      // Insere imports após o último import existente
      content = content.replace(
        /^(import .+;\n)(?!import)/m,
        `$1${importRepo}\n${importImpl}\n`,
      );
      content = content.trimEnd() + registration;
      fs.writeFileSync(containerPath, content);
      console.log(`✅ Atualizado: src/modules/${parentModule}/container/index.ts`);
    } else {
      console.log(`⚠️  Container já contém ${resourceName}Repository, pulando.`);
    }
  }

  // ── Atualiza routes global ─────────────────────────────────────────────────
  const routesPath = path.join(
    process.cwd(),
    'src', 'shared', 'infra', 'https', 'routes', 'index.ts',
  );
  if (fs.existsSync(routesPath)) {
    let routesContent = fs.readFileSync(routesPath, 'utf-8');

    const importLine = `import ${resourceLower}Routes from '@modules/${parentModule}/infra/https/routes/${resourceLower}Router';`;
    const useLine = `routes.use('/${toPlural(subModuleName)}', ${resourceLower}Routes);`;

    if (!routesContent.includes(importLine)) {
      const lines = routesContent.split('\n');

      // Insere import após o último import de @modules
      const lastModuleImport = [...lines]
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => line.startsWith('import') && line.includes('@modules'))
        .pop();

      if (lastModuleImport) {
        lines.splice(lastModuleImport.i + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }

      // Insere uso antes do export default
      const exportIdx = lines.findIndex(line => line.includes('export default'));
      if (exportIdx >= 0) {
        lines.splice(exportIdx, 0, useLine);
      } else {
        lines.push(useLine);
      }

      fs.writeFileSync(routesPath, lines.join('\n'));
      console.log(`✅ Atualizado: src/shared/infra/https/routes/index.ts`);
    } else {
      console.log(`⚠️  Rota ${resourceLower}Routes já registrada, pulando.`);
    }
  }

  console.log(`\n✨ Sub-módulo "${subModuleName}" adicionado a "${parentModule}" com sucesso!`);
  console.log(`\n📝 Próximos passos:`);
  console.log(`   1. Ajuste o DTO em:    src/modules/${parentModule}/dto/I${resourceName}DTO.ts`);
  console.log(`   2. Ajuste o schema em: src/modules/${parentModule}/infra/mongo/models/${resourceName}.ts`);
  console.log(`   3. Compile e teste:    npm run build && npm run dev`);
  console.log(`\n🔗 Rotas disponíveis em: /api/${toPlural(subModuleName)}`);
}

// ─── Execução ─────────────────────────────────────────────────────────────────

const [parentModule, subModuleName] = process.argv.slice(2);

if (!parentModule || !subModuleName) {
  console.error('❌ Erro: Argumentos insuficientes');
  console.log('📖 Uso:     npx ts-node scripts/generate-sub-module.ts <modulo-pai> <sub-modulo>');
  console.log('📖 Exemplo: npx ts-node scripts/generate-sub-module.ts mapaProdutividade configuracao');
  process.exit(1);
}

generateSubModule(parentModule, subModuleName);
