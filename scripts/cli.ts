#!/usr/bin/env ts-node

/*
 Simple project CLI
 Commands:
  - pnpm cli generate entity <name> [--singular <singularName>] [--plural <pluralName>]
  - pnpm cli db generate|migrate|push|drop|studio|reset|rollback
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

type GenerateArgs = {
  singular: string;
  plural: string;
  capitalizedSingular: string;
  capitalizedPlural: string;
};

function toCapitalized(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function deriveSingularPlural(name: string, providedSingular?: string, providedPlural?: string): { singular: string; plural: string } {
  if (providedSingular && providedPlural) return { singular: providedSingular, plural: providedPlural };
  if (providedSingular && !providedPlural) {
    // naive pluralization
    const s = providedSingular;
    if (s.endsWith('y')) return { singular: s, plural: s.slice(0, -1) + 'ies' };
    if (s.endsWith('s')) return { singular: s, plural: s + 'es' };
    return { singular: s, plural: s + 's' };
  }
  if (!providedSingular && providedPlural) {
    // naive singularization
    const p = providedPlural;
    if (p.endsWith('ies')) return { singular: p.slice(0, -3) + 'y', plural: p };
    if (p.endsWith('s')) return { singular: p.slice(0, -1), plural: p };
    return { singular: p, plural: p };
  }
  // both undefined; base on input name
  const base = name.toLowerCase();
  if (base.endsWith('ies')) return { singular: base.slice(0, -3) + 'y', plural: base };
  if (base.endsWith('s')) return { singular: base.slice(0, -1), plural: base };
  if (base.endsWith('y')) return { singular: base, plural: base.slice(0, -1) + 'ies' };
  return { singular: base, plural: base + 's' };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFileSafe(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${filePath}`);
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

function appendExportToSchemasIndex(entityPlural: string) {
  const indexPath = path.resolve('src/schemas/database/index.ts');
  const exportLine = `export * from './${entityPlural}';\n`;
  let current = '';
  try { current = fs.readFileSync(indexPath, 'utf8'); } catch {}
  if (!current.includes(exportLine)) {
    ensureDir(path.dirname(indexPath));
    fs.writeFileSync(indexPath, current + exportLine, 'utf8');
    console.log(`Updated exports in ${indexPath}`);
  }
}

function generateSchema({ singular, plural, capitalizedSingular }: GenerateArgs) {
  const target = path.resolve(`src/schemas/database/${plural}.ts`);
  const content = `import { pgTable, serial, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const ${plural} = pgTable('${plural}', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
});

export type ${capitalizedSingular} = typeof ${plural}.$inferSelect;
export type New${capitalizedSingular} = typeof ${plural}.$inferInsert;
`;
  writeFileSafe(target, content);
  appendExportToSchemasIndex(plural);
}

function generateZodSchemas({ singular, plural, capitalizedSingular, capitalizedPlural }: GenerateArgs) {
  const target = path.resolve(`src/schemas/${singular}.schema.ts`);
  const content = `import { z } from 'zod';

export const ${singular}Schema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const create${capitalizedSingular}Schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const update${capitalizedSingular}Schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const bulkCreate${capitalizedPlural}Schema = z.object({
  ${plural}: z.array(create${capitalizedSingular}Schema).min(1),
});

export const bulkUpdate${capitalizedPlural}Schema = z.object({
  updates: z.array(z.object({ id: z.string(), data: update${capitalizedSingular}Schema })).min(1),
});

export const bulkDelete${capitalizedPlural}Schema = z.object({
  ids: z.array(z.string()).min(1),
});
`;
  writeFileSafe(target, content);
}

function generateTypes({ singular, capitalizedSingular, capitalizedPlural }: GenerateArgs) {
  const target = path.resolve(`src/types/entities/${singular}.ts`);
  const content = `import { z } from 'zod';
import {
  ${singular}Schema,
  create${capitalizedSingular}Schema,
  update${capitalizedSingular}Schema,
  bulkCreate${capitalizedPlural}Schema,
  bulkUpdate${capitalizedPlural}Schema,
  bulkDelete${capitalizedPlural}Schema,
} from '../../schemas/${singular}.schema';
import { IPaginatedResponse } from '../api/pagination';
import { IApiResponse } from '../api/response';

export type I${capitalizedSingular} = z.infer<typeof ${singular}Schema>;
export type ICreate${capitalizedSingular} = z.infer<typeof create${capitalizedSingular}Schema>;
export type IUpdate${capitalizedSingular} = z.infer<typeof update${capitalizedSingular}Schema>;
export type IBulkCreate${capitalizedPlural} = z.infer<typeof bulkCreate${capitalizedPlural}Schema>;
export type IBulkUpdate${capitalizedPlural} = z.infer<typeof bulkUpdate${capitalizedPlural}Schema>;
export type IBulkDelete${capitalizedPlural} = z.infer<typeof bulkDelete${capitalizedPlural}Schema>;

export type I${capitalizedSingular}ListResponse = IPaginatedResponse<I${capitalizedSingular}>;
export type I${capitalizedSingular}Response = IApiResponse<I${capitalizedSingular}>;
export type ICreate${capitalizedSingular}Response = IApiResponse<I${capitalizedSingular}>;
export type IUpdate${capitalizedSingular}Response = IApiResponse<I${capitalizedSingular}>;
export type IDelete${capitalizedSingular}Response = IApiResponse<I${capitalizedSingular}>;
`;
  writeFileSafe(target, content);
}

function generateController({ singular, plural, capitalizedSingular }: GenerateArgs) {
  const target = path.resolve(`src/controllers/${plural}.controller.ts`);
  const content = `import { NextFunction, Request, Response } from 'express';
import { ${plural} } from '../schemas/database';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { I${capitalizedSingular} } from '../types/entities/${singular}';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<I${capitalizedSingular}>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<typeof ${plural}, I${capitalizedSingular}>(req, ${plural});
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<I${capitalizedSingular}>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await getItem<typeof ${plural}, I${capitalizedSingular}>(id, ${plural});
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, Partial<I${capitalizedSingular}>>,
    res: Response<SuccessResponse<I${capitalizedSingular}>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await createItem<typeof ${plural}, I${capitalizedSingular}>(req.body, ${plural});
      res.status(201).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, Partial<I${capitalizedSingular}>>,
    res: Response<SuccessResponse<I${capitalizedSingular}>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await updateItem<typeof ${plural}, I${capitalizedSingular}>(id, ${plural}, req.body);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteItem<typeof ${plural}, I${capitalizedSingular}>(id, ${plural});
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
`;
  writeFileSafe(target, content);
}

function generateRoutes({ singular, plural, capitalizedSingular, capitalizedPlural }: GenerateArgs) {
  const target = path.resolve(`src/routes/api/v1/${plural}.ts`);
  const content = `import express from 'express';
import controller from '../../../controllers/${plural}.controller';
import { requireAuth, role, checkRole, trimRequest } from '../../../middleware/auth';
import { ROLES } from '../../../middleware/roles';
import { validate } from '../../../middleware/validator';
import { z } from 'zod';
import {
  create${capitalizedSingular}Schema,
  update${capitalizedSingular}Schema,
  bulkCreate${capitalizedPlural}Schema,
  bulkUpdate${capitalizedPlural}Schema,
  bulkDelete${capitalizedPlural}Schema,
} from '../../../schemas/${singular}.schema';
import { idSchema } from '../../../schemas/shared.schema';

const router = express.Router();

// List
router.get(
  '/${plural}',
  // #swagger.tags = ['${capitalizedPlural}']
  controller.list,
);

// Bulk create
router.post(
  '/${plural}/bulk',
  // #swagger.tags = ['${capitalizedPlural}']
  trimRequest.all,
  validate(z.object({ body: bulkCreate${capitalizedPlural}Schema })),
  controller.bulkCreate ?? ((req, res, next) => next()),
);

// Bulk update
router.put(
  '/${plural}/bulk',
  // #swagger.tags = ['${capitalizedPlural}']
  requireAuth,
  role(ROLES.Admin),
  checkRole,
  trimRequest.all,
  validate(z.object({ body: bulkUpdate${capitalizedPlural}Schema })),
  controller.bulkUpdate ?? ((req, res, next) => next()),
);

// Bulk delete
router.delete(
  '/${plural}/bulk',
  // #swagger.tags = ['${capitalizedPlural}']
  validate(z.object({ body: bulkDelete${capitalizedPlural}Schema })),
  controller.bulkDelete ?? ((req, res, next) => next()),
);

// Get by id
router.get(
  '/${plural}/:id',
  // #swagger.tags = ['${capitalizedPlural}']
  validate(z.object({ params: z.object({ id: idSchema }) })),
  controller.listOne,
);

// Create
router.post(
  '/${plural}',
  // #swagger.tags = ['${capitalizedPlural}']
  trimRequest.all,
  validate(z.object({ body: create${capitalizedSingular}Schema })),
  controller.create,
);

// Update
router.put(
  '/${plural}/:id',
  // #swagger.tags = ['${capitalizedPlural}']
  requireAuth,
  role(ROLES.Admin),
  checkRole,
  trimRequest.all,
  validate(z.object({ params: z.object({ id: idSchema }), body: update${capitalizedSingular}Schema })),
  controller.update,
);

// Delete
router.delete(
  '/${plural}/:id',
  // #swagger.tags = ['${capitalizedPlural}']
  validate(z.object({ params: z.object({ id: idSchema }) })),
  controller.delete,
);

export default router;
`;
  writeFileSafe(target, content);
}

function run(command: string) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', env: process.env });
}

function handleDbCommand(sub: string) {
  switch (sub) {
    case 'generate':
      run('pnpm db:generate');
      break;
    case 'migrate':
      run('pnpm db:migrate');
      break;
    case 'push':
      run('pnpm db:push');
      break;
    case 'drop':
      run('pnpm db:drop');
      break;
    case 'studio':
      run('pnpm db:studio');
      break;
    case 'reset':
      // convenient reset: drop then push from current schema
      run('pnpm db:drop');
      run('pnpm db:push');
      break;
    case 'rollback':
      /*
        Drizzle does not provide automatic down migrations.
        For developer convenience we simulate a rollback by:
         - removing the last migration from journal (not implemented automatically here)
         - dropping and pushing the current schema
        This effectively resets DB to current code schema.
      */
      console.warn('Simulated rollback: dropping and re-pushing current schema. For precise down migrations, create manual down SQL.');
      run('pnpm db:drop');
      run('pnpm db:push');
      break;
    default:
      console.error(`Unknown db subcommand: ${sub}`);
      process.exit(1);
  }
}

function handleGenerateEntity(args: string[]) {
  const name = (args[0] || '').trim();
  if (!name) {
    console.error('Usage: pnpm cli generate entity <name> [--singular <singular>] [--plural <plural>]');
    process.exit(1);
  }
  const singularArgIdx = args.indexOf('--singular');
  const pluralArgIdx = args.indexOf('--plural');
  const singularOpt = singularArgIdx >= 0 ? args[singularArgIdx + 1] : undefined;
  const pluralOpt = pluralArgIdx >= 0 ? args[pluralArgIdx + 1] : undefined;

  const { singular, plural } = deriveSingularPlural(name, singularOpt, pluralOpt);
  const capitalizedSingular = toCapitalized(singular);
  const capitalizedPlural = toCapitalized(plural);

  const genArgs: GenerateArgs = { singular, plural, capitalizedSingular, capitalizedPlural };

  generateSchema(genArgs);
  generateZodSchemas(genArgs);
  generateTypes(genArgs);
  generateController(genArgs);
  generateRoutes(genArgs);

  console.log('\nNext steps:');
  console.log('- pnpm db:push        # or db:generate + db:migrate');
  console.log(`- Implement any custom logic in src/controllers/${plural}.controller.ts`);
  console.log(`- Optionally add to documentation via zod schema in src/schemas/${singular}.schema.ts`);
}

function main() {
  const [, , cmd, sub, ...rest] = process.argv;
  if (cmd === 'generate' && sub === 'entity') {
    return handleGenerateEntity(rest);
  }
  if (cmd === 'db' && sub) {
    return handleDbCommand(sub);
  }
  console.log('Usage:');
  console.log('  pnpm cli generate entity <name> [--singular <name>] [--plural <name>]');
  console.log('  pnpm cli db <generate|migrate|push|drop|studio|reset|rollback>');
}

main();


