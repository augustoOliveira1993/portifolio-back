import { container } from 'tsyringe';

import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import UsersRepository from '@modules/users/infra/mongo/repositories/UsersRepository';

import IBlocksRepository from '@modules/users/repositories/IBlocksRepository';
import BlocksRepository from '@modules/users/infra/mongo/repositories/BlocksRepository';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import RoleRepository from '@modules/users/infra/mongo/repositories/RoleRepository';

import IPermissaoRepository from '@modules/users/repositories/IPermissaoRepository';
import PermissaoRepository from '@modules/users/infra/mongo/repositories/PermissaoRepository';

import IPermissaoGrupoRepository from '@modules/users/repositories/IPermissaoGrupoRepository';
import PermissaoGrupoRepository from '@modules/users/infra/mongo/repositories/PermissaoGrupoRepository';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository,
);

container.registerSingleton<IBlocksRepository>(
  'BlocksRepository',
  BlocksRepository,
);

container.registerSingleton<IPermissaoRepository>(
  'PermissaoRepository',
  PermissaoRepository,
);

container.registerSingleton<IPermissaoGrupoRepository>(
  'PermissaoGrupoRepository',
  PermissaoGrupoRepository,
);
container.registerSingleton<IRoleRepository>('RoleRepository', RoleRepository);
