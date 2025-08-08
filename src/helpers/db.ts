import { Request } from 'express';
import { PaginatedResponse } from '../types/shared/response';
import { buildErrObject } from './utils';
import logger from '../config/logger';
import prisma from '../lib/prisma';

// Minimal delegate interface to support generic helpers across Prisma models
type PrismaDelegate = any;

// Ensure API maintains `_id` as in previous Mongo contract
function mapId(obj: any): any {
  if (!obj) return obj;
  if ('_id' in obj) return obj;
  const { id, ...rest } = obj as any;
  return { _id: id, ...rest };
}

function mapArrayId(arr: any[]): any[] {
  return arr.map((o: any) => mapId(o));
}

const buildSort = (
  sort: string,
  order: 'asc' | 'desc' | string,
): Record<string, 'asc' | 'desc'> => {
  const normalized = order === 'desc' ? 'desc' : 'asc';
  return { [sort]: normalized } as Record<string, 'asc' | 'desc'>;
};

const _cleanPaginationID = (result: any): any => {
  // No-op for Prisma (ids are fine); ensure shape uses payload
  return renameKey(result, 'docs', 'payload');
};

const renameKey = (
  object: Record<string, any>,
  key: string,
  newKey: string,
): Record<string, any> => {
  const clonedObj = { ...object };
  const targetKey = clonedObj[key];
  delete clonedObj[key];
  clonedObj[newKey] = targetKey;
  return clonedObj;
};

const listInitOptions = async (req: Request): Promise<{
  order: 'asc' | 'desc';
  sort: Record<string, 'asc' | 'desc'>;
  page: number;
  limit: number;
}> => {
  const order = ((req.query.order as string) || 'asc') as 'asc' | 'desc';
  const sort = (req.query.sort || 'createdAt') as string;
  const sortBy = buildSort(sort, order);
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 25;
  return { order, sort: sortBy, page, limit };
};

async function checkQueryString(
  query: Record<string, any>,
): Promise<Record<string, any>> {
  const where: Record<string, any> = {};
  try {
    // Carry through additional exact-match filters (non-reserved keys)
    for (const key in query) {
      if (!['filter', 'fields', 'page', 'limit', 'order', 'sort', 'select'].includes(key)) {
        where[key] = query[key];
      }
    }

    if (query.filter && query.fields) {
      const arrayFields = String(query.fields).split(',').map((s) => s.trim()).filter(Boolean);
      if (arrayFields.length > 0) {
        where.OR = arrayFields.map((field) => ({
          [field]: { contains: String(query.filter), mode: 'insensitive' },
        }));
      }
    }

    return where;
  } catch (err: any) {
    logger.error(err.message);
    throw buildErrObject(422, 'ERROR_WITH_FILTER');
  }
}

async function getAllItems<T>(delegate: PrismaDelegate): Promise<T[]> {
  return delegate.findMany({ orderBy: { name: 'asc' } });
}

async function getItems<T>(
  req: Request,
  delegate: PrismaDelegate,
  where: Record<string, any>,
  fields: string,
): Promise<PaginatedResponse<T>> {
  const { page, limit, sort } = await listInitOptions(req);
  const skip = (page - 1) * limit;

  const select = buildSelect(fields);
  const [totalDocs, docs] = await Promise.all([
    delegate.count({ where }),
    delegate.findMany({ where, skip, take: limit, orderBy: sort, select }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const pagingCounter = skip + 1;
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : null;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    ok: true,
    totalDocs,
    limit,
    totalPages,
    page,
    pagingCounter,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    payload: mapArrayId(docs) as unknown as T[],
  };
}

async function getAggregatedItems<T>(
  _req: Request,
  _delegate: PrismaDelegate,
  _aggregated: any[],
): Promise<PaginatedResponse<T>> {
  throw buildErrObject(500, 'NOT_IMPLEMENTED_WITH_PRISMA');
}

async function getItem<T>(id: string, delegate: PrismaDelegate): Promise<T> {
  const item = await delegate.findUnique({ where: { id } });
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return mapId(item) as T;
}

async function filterItems<T>(
  where: Record<string, any>,
  delegate: PrismaDelegate,
): Promise<{ ok: boolean; payload: T[] }> {
  const payload = await delegate.findMany({ where });
  return { ok: true, payload: mapArrayId(payload) as unknown as T[] };
}

async function createItem<T>(
  item: Record<string, any>,
  delegate: PrismaDelegate,
): Promise<T> {
  const created = await delegate.create({ data: item });
  return mapId(created) as T;
}

async function updateItem<T>(
  id: string,
  delegate: PrismaDelegate,
  data: Record<string, any>,
): Promise<T> {
  try {
    const updated = await delegate.update({ where: { id }, data });
    return mapId(updated) as T;
  } catch {
    throw buildErrObject(404, 'NOT_FOUND');
  }
}

async function deleteItem<T>(id: string, delegate: PrismaDelegate): Promise<T> {
  try {
    const deleted = await delegate.delete({ where: { id } });
    return mapId(deleted) as T;
  } catch {
    throw buildErrObject(404, 'NOT_FOUND');
  }
}

async function createItems<T>(
  items: Record<string, any>[],
  delegate: PrismaDelegate,
): Promise<T[]> {
  const operations = items.map((data) => (delegate as any).create({ data }));
  const createdItems = await prisma.$transaction(operations as any);
  return mapArrayId(createdItems) as unknown as T[];
}

async function updateItems<T>(
  updates: { id: string; data: Record<string, any> }[],
  delegate: PrismaDelegate,
): Promise<{ modified: number; items: T[] }> {
  const operations = updates.map(({ id, data }) =>
    (delegate as any).update({ where: { id }, data }),
  );
  const items = (await prisma.$transaction(operations as any)) as T[];
  return { modified: items.length, items: mapArrayId(items) as unknown as T[] };
}

async function deleteItems<T>(
  ids: string[],
  delegate: PrismaDelegate,
): Promise<{ deleted: number; items: T[] }> {
  const itemsToDelete = await delegate.findMany({ where: { id: { in: ids } } });
  const result = await delegate.deleteMany({ where: { id: { in: ids } } });
  return { deleted: result.count, items: mapArrayId(itemsToDelete) as unknown as T[] };
}

export const listItemsPaginated = async <T>(
  req: Request,
  delegate: PrismaDelegate,
): Promise<PaginatedResponse<T>> => {
  const where = await checkQueryString(req.query);
  const fields = (req.query.fields as string) || '';
  const paginatedResponse = await getItems<T>(req, delegate, where, fields);
  return paginatedResponse;
};

export const itemExists = async <T>(
  body: any,
  delegate: PrismaDelegate,
  uniqueFields: string[],
): Promise<boolean> => {
  if (uniqueFields.length === 0) return false;
  const OR = uniqueFields.map((field) => ({ [field]: body[field] }));
  const item = await delegate.findFirst({ where: { OR } });
  if (item) {
    throw buildErrObject(422, 'Este registro ya existe');
  }
  return false;
};

export const itemExistsExcludingItself = async <T>(
  id: string,
  body: any,
  delegate: PrismaDelegate,
  uniqueFields: string[],
): Promise<boolean> => {
  if (uniqueFields.length === 0) return false;
  const OR = uniqueFields.map((field) => ({ [field]: body[field] }));
  const item = await delegate.findFirst({ where: { OR, NOT: { id } } });
  if (item) {
    throw buildErrObject(422, 'Este registro ya existe');
  }
  return false;
};

export {
  listInitOptions,
  renameKey,
  checkQueryString,
  getAllItems,
  getItems,
  getAggregatedItems,
  getItem,
  filterItems,
  createItem,
  updateItem,
  deleteItem,
  createItems,
  updateItems,
  deleteItems,
};

// Helpers
function buildSelect(fields: string | undefined): Record<string, boolean> | undefined {
  if (!fields) return undefined;
  const list = String(fields)
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  if (list.length === 0) return undefined;
  return list.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}
