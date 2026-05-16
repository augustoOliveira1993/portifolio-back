# 📝 Guia de Uso dos Snippets VS Code

## Snippets Disponíveis para CRUD Completo

Este projeto inclui snippets do VS Code para acelerar a criação de módulos CRUD completos.

### 🎯 Snippets Disponíveis

| Comando            | Descrição                          | Arquivo                     |
| ------------------ | ---------------------------------- | --------------------------- |
| `dto`              | Cria interface DTO com Document    | `I${Resource}DTO.ts`        |
| `repo-interface`   | Cria interface de repositório      | `I${Resource}Repository.ts` |
| `repo-impl`        | Cria implementação de repositório  | `${Resource}Repository.ts`  |
| `model`            | Cria Mongoose Schema e Model       | `${Resource}.ts`            |
| `service-create`   | Cria serviço de criação            | `CreateService.ts`          |
| `service-update`   | Cria serviço de atualização        | `UpdateService.ts`          |
| `service-delete`   | Cria serviço de remoção            | `DeleteService.ts`          |
| `service-findall`  | Cria serviço FindAll com paginação | `FindAllService.ts`         |
| `service-findbyid` | Cria serviço FindById              | `FindByIdService.ts`        |
| `controller-crud`  | Cria Controller completo           | `${Resource}Controller.ts`  |
| `routes-crud`      | Cria Router completo               | `${resource}Router.ts`      |
| `container-di`     | Cria registro DI                   | `container/index.ts`        |

### 📋 Como Usar

1. **Crie a estrutura de pastas do módulo**:

   ```
   src/modules/products/
   ├── container/
   │   └── index.ts
   ├── dto/
   │   └── IProductDTO.ts
   ├── infra/
   │   ├── https/
   │   │   ├── controllers/
   │   │   │   └── ProductController.ts
   │   │   └── routes/
   │   │       └── productRouter.ts
   │   └── mongo/
   │       ├── models/
   │       │   └── Product.ts
   │       └── repositories/
   │           └── ProductRepository.ts
   ├── repositories/
   │   └── IProductRepository.ts
   └── services/
       └── product/
           ├── CreateService.ts
           ├── DeleteService.ts
           ├── FindAllService.ts
           ├── FindByIdService.ts
           └── UpdateService.ts
   ```

2. **Use os snippets em cada arquivo**:
   - Em `IProductDTO.ts`: digite `dto` + Tab
   - Em `IProductRepository.ts`: digite `repo-interface` + Tab
   - Em `ProductRepository.ts`: digite `repo-impl` + Tab
   - Em `Product.ts`: digite `model` + Tab
   - Em cada service: digite `service-create`, `service-update`, etc. + Tab
   - Em `ProductController.ts`: digite `controller-crud` + Tab
   - Em `productRouter.ts`: digite `routes-crud` + Tab
   - Em `container/index.ts`: digite `container-di` + Tab

3. **Preencha os placeholders**:
   - `${1:Resource}`: Nome do recurso (ex: Product)
   - `${2:moduleName}`: Nome do módulo (ex: products)
   - Os números indicam a ordem de navegação pelo Tab

4. **Registre o módulo**:
   - Adicione em `src/shared/container/index.ts`:

     ```typescript
     import '@modules/products/container';
     ```

   - Adicione em `src/shared/infra/https/routes/index.ts`:

     ```typescript
     import productRoutes from '@modules/products/infra/https/routes/productRouter';
     // ...
     routes.use('/products', productRoutes);
     ```

### 🚀 Exemplo Prático: Criar Módulo "Products"

1. Crie as pastas conforme estrutura acima
2. Use os snippets em cada arquivo:
   - **DTO**: `dto` → Resource: Product
   - **Repository Interface**: `repo-interface` → Product, products
   - **Repository Implementation**: `repo-impl` → Product, products
   - **Model**: `model` → Product, products
   - **Services**: Use `service-create`, `service-update`, etc.
   - **Controller**: `controller-crud` → products, product, Product
   - **Routes**: `routes-crud` → Product, products
   - **Container**: `container-di` → Product, products

3. Registre nas rotas e container global

### ⚡ Próximos Passos

Para automação completa, use o CLI gerador de módulos:

```bash
npm run generate:module products
```

Isso criará toda a estrutura automaticamente!

### 📚 Padrões Seguidos

- **Clean Architecture**: Separação em camadas (Domain, Application, Infrastructure)
- **DDD**: Módulos organizados por contexto de negócio
- **SOLID**: Dependency Inversion com interfaces e DI
- **Paginação**: Suporte nativo em FindAll com `applyPaginationParams` e `buildPaginatedResult`
- **Busca**: Suporte a busca textual com `applySearchParam`
- **Validação**: Erros tipados com `NotFoundError`, `BadRequestError`, etc.

### 💡 Dicas

- Os snippets incluem imports automáticos
- Interfaces tipadas herdadas de base
- Paginação já configurada
- Error handling padronizado
- Logs e tracking de usuário já incluídos
