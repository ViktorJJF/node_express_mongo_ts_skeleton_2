import { Request } from 'express';
import { SQL, eq, or, sql, count, asc, desc, and, ilike } from 'drizzle-orm';
import { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { PaginatedResponse } from '../types/shared/response';
import { buildErrObject } from './utils';
import logger from '../config/logger';
import getDatabase from '../config/database';

const buildSort = (
  sort: string,
  order: number | string,
  table: any,
): SQL<unknown> | undefined => {
  // Get column from table
  const column = (table as any)[sort] as PgColumn;
  if (!column) {
    return undefined;
  }

  return order === 'desc' || order === -1 ? desc(column) : asc(column);
};

const cleanPaginationID = (result: any): any => {
  return renameKey(result, 'data', 'payload');
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

const listInitOptions = async (req: Request): Promise<Record<string, any>> => {
  const order = (req.query.order || 'asc') as string;
  const sort = (req.query.sort || 'createdAt') as string;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 99999;
  return {
    order,
    sort,
    page,
    limit,
  };
};

async function checkQueryString(
  query: Record<string, any>,
  table: any,
): Promise<SQL<unknown> | undefined> {
  const conditions: SQL<unknown>[] = [];

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const element = query[key];
      if (
        key !== 'filter' &&
        key !== 'fields' &&
        key !== 'page' &&
        key !== 'order' &&
        key !== 'sort' &&
        key !== 'limit'
      ) {
        const column = (table as any)[key] as PgColumn;
        if (column) {
          conditions.push(eq(column, element));
        }
      }
    }
  }

  try {
    if (query.filter && query.fields) {
      const searchConditions: SQL<unknown>[] = [];
      const fieldsArray = query.fields.split(',');

      fieldsArray.forEach((field: string) => {
        const column = (table as any)[field.trim()] as PgColumn;
        if (column) {
          searchConditions.push(ilike(column, `%${query.filter}%`));
        }
      });

      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions)!);
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  } catch (err: any) {
    logger.error(err.message);
    throw buildErrObject(422, 'ERROR_WITH_FILTER');
  }
}

async function getAllItems<T>(table: T): Promise<any> {
  try {
    const db = getDatabase();
    const nameColumn = (table as any).name as PgColumn;
    const orderBy = nameColumn ? [asc(nameColumn)] : undefined;

    const result = await (db
      .select()
      .from(table as any)
      .orderBy(...(orderBy || [])) as any);
    return result;
  } catch (error) {
    logger.error('Error getting all items:', error);
    throw error;
  }
}

async function getItems<T, R>(
  req: Request,
  table: T,
  query: Record<string, any>,
  _fields?: string,
): Promise<PaginatedResponse<R>> {
  try {
    const db = getDatabase();
    const options = await listInitOptions(req);

    // Build where condition
    const whereCondition = await checkQueryString(query, table);

    // Build sort
    const sortColumn = buildSort(options.sort, options.order, table);
    const orderBy = sortColumn ? [sortColumn] : undefined;

    // Calculate offset
    const offset = (options.page - 1) * options.limit;

    // Get total count
    const totalQuery: any = (db.select({ count: count() }).from(table as any) as any);
    if (whereCondition) {
      totalQuery.where(whereCondition);
    }
    const [{ count: totalCount }] = await totalQuery;

    // Get paginated results
    let selectQuery: any = (db.select().from(table as any) as any);
    if (whereCondition) {
      selectQuery = selectQuery.where(whereCondition);
    }
    if (orderBy) {
      selectQuery = selectQuery.orderBy(...orderBy);
    }
    selectQuery = selectQuery.limit(options.limit).offset(offset);

    const data = (await selectQuery) as any[];

    const result = {
      data,
      totalDocs: totalCount,
      limit: options.limit,
      totalPages: Math.ceil(totalCount / options.limit),
      page: options.page,
      hasPrevPage: options.page > 1,
      hasNextPage: options.page < Math.ceil(totalCount / options.limit),
      prevPage: options.page > 1 ? options.page - 1 : null,
      nextPage:
        options.page < Math.ceil(totalCount / options.limit)
          ? options.page + 1
          : null,
    };

    return cleanPaginationID(result);
  } catch (error) {
    logger.error('Error getting items:', error);
    throw error;
  }
}

async function getAggregatedItems<T, R>(
  req: Request,
  table: T,
  // aggregated is not directly applicable to Drizzle, but we can simulate with complex queries
  customQuery?: (db: any, table: T, options: any) => Promise<any>,
): Promise<PaginatedResponse<R>> {
  try {
    const options = await listInitOptions(req);

    if (!customQuery) {
      // Fallback to regular getItems if no custom query provided
      return await getItems<T, R>(req, table, {});
    }

    const db = getDatabase();
    const result = await customQuery(db, table, options);
    return cleanPaginationID(result);
  } catch (error) {
    logger.error('Error getting aggregated items:', error);
    throw error;
  }
}

async function getItem<T, R>(id: number, table: T): Promise<R> {
  try {
    const db = getDatabase();
    const idColumn = (table as any).id as PgColumn;
    const result = (await (db
      .select()
      .from(table as any)
      .where(eq(idColumn, id)) as any)) as any[];

    if (!result || result.length === 0) {
      throw buildErrObject(404, 'NOT_FOUND');
    }

    return result[0] as R;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw error;
    }
    logger.error('Error getting item:', error);
    throw error;
  }
}

async function filterItems<T, R>(
  fields: Record<string, any>,
  table: T,
): Promise<{ ok: boolean; payload: R[] }> {
  try {
    const conditions: SQL<unknown>[] = [];

    for (const [key, value] of Object.entries(fields)) {
      const column = (table as any)[key] as PgColumn;
      if (column) {
        conditions.push(eq(column, value));
      }
    }

    const db = getDatabase();
    let query: any = (db.select().from(table as any) as any);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const payload = (await query) as any[];
    return { ok: true, payload: payload as R[] };
  } catch (error) {
    logger.error('Error filtering items:', error);
    throw error;
  }
}

async function createItem<T, R>(
  item: Record<string, any>,
  table: T,
): Promise<R> {
  try {
    const db = getDatabase();
    const result = (await (db
      .insert(table as any)
      .values(item as any)
      .returning() as any)) as any[];
    return (result && result[0] ? (result[0] as R) : (undefined as any)) as R;
  } catch (error) {
    logger.error('Error creating item:', error);
    throw error;
  }
}

async function updateItem<T, R>(
  id: number,
  table: T,
  body: Record<string, any>,
): Promise<R> {
  try {
    const db = getDatabase();
    const idColumn = (table as any).id as PgColumn;

    // Add updatedAt timestamp
    const updatedBody = {
      ...body,
      updatedAt: new Date(),
    };

    const result = (await (db
      .update(table as any)
      .set(updatedBody as any)
      .where(eq(idColumn, id))
      .returning() as any)) as any[];

    if (!result || result.length === 0) {
      throw buildErrObject(404, 'NOT_FOUND');
    }

    return result[0] as R;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw error;
    }
    logger.error('Error updating item:', error);
    throw error;
  }
}

async function deleteItem<T, R>(
  id: number,
  table: T,
): Promise<R> {
  try {
    const db = getDatabase();
    const idColumn = (table as any).id as PgColumn;
    const result = (await (db
      .delete(table as any)
      .where(eq(idColumn, id))
      .returning() as any)) as any[];

    if (!result || result.length === 0) {
      throw buildErrObject(404, 'NOT_FOUND');
    }

    return result[0] as R;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw error;
    }
    logger.error('Error deleting item:', error);
    throw error;
  }
}

async function createItems<T, R>(
  items: Record<string, any>[],
  table: T,
): Promise<R[]> {
  try {
    const db = getDatabase();
    const result = (await (db
      .insert(table as any)
      .values(items as any)
      .returning() as any)) as any[];
    return (result as unknown) as R[];
  } catch (error) {
    logger.error('Error creating items:', error);
    throw error;
  }
}

async function updateItems<T, R>(
  updates: { id: number; data: Record<string, any> }[],
  table: T,
): Promise<{ modified: number; items: R[] }> {
  try {
    const db = getDatabase();
    const idColumn = (table as any).id as PgColumn;
    const updatedItems: R[] = [];
    let modifiedCount = 0;

    for (const update of updates) {
      try {
        const updatedBody = {
          ...update.data,
          updatedAt: new Date(),
        };

        const result = (await (db
          .update(table as any)
          .set(updatedBody as any)
          .where(eq(idColumn, update.id))
          .returning() as any)) as any[];

        if (result && result.length > 0) {
          updatedItems.push(result[0] as R);
          modifiedCount++;
        }
      } catch (error) {
        logger.error(`Error updating item ${update.id}:`, error);
      }
    }

    return {
      modified: modifiedCount,
      items: updatedItems,
    };
  } catch (error) {
    logger.error('Error updating items:', error);
    throw error;
  }
}

async function deleteItems<T, R>(
  ids: number[],
  table: T,
): Promise<{ deleted: number; items: R[] }> {
  try {
    const db = getDatabase();
    const idColumn = (table as any).id as PgColumn;
    const deletedItems: R[] = [];

    for (const id of ids) {
      try {
        const result = (await (db
          .delete(table as any)
          .where(eq(idColumn, id))
          .returning() as any)) as any[];
        if (result && result.length > 0) {
          deletedItems.push(result[0] as R);
        }
      } catch (error) {
        logger.error(`Error deleting item ${id}:`, error);
      }
    }

    return {
      deleted: deletedItems.length,
      items: deletedItems,
    };
  } catch (error) {
    logger.error('Error deleting items:', error);
    throw error;
  }
}

export const listItemsPaginated = async <T extends PgTable, R>(
  req: Request,
  table: T,
): Promise<PaginatedResponse<R>> => {
  const query = { ...req.query };
  delete query.page;
  delete query.limit;
  delete query.sort;
  delete query.order;

  const fields = req.query.fields as string;
  const paginatedResponse = await getItems<T, R>(
    req,
    (table as unknown) as T,
    query,
    fields,
  );
  return paginatedResponse;
};

export const itemExists = async <T extends PgTable>(
  body: any,
  table: T,
  uniqueFields: string[],
): Promise<boolean> => {
  try {
    if (uniqueFields.length === 0) {
      return false;
    }

    const db = getDatabase();
    const conditions: SQL<unknown>[] = [];
    for (const field of uniqueFields) {
      const column = (table as any)[field] as PgColumn;
      if (column && body[field] !== undefined) {
        conditions.push(eq(column, body[field]));
      }
    }

    if (conditions.length === 0) {
      return false;
    }

    const result = await db
      .select()
      .from((table as unknown) as any)
      .where(and(...conditions))
      .limit(1);

    if (result && result.length > 0) {
      throw buildErrObject(422, 'Este registro ya existe');
    }

    return false;
  } catch (error) {
    if (error instanceof Error && error.message === 'Este registro ya existe') {
      throw error;
    }
    logger.error('Error checking if item exists:', error);
    throw error;
  }
};

export const itemExistsExcludingItself = async <T extends PgTable>(
  id: number,
  body: any,
  table: T,
  uniqueFields: string[],
): Promise<boolean> => {
  try {
    if (uniqueFields.length === 0) {
      return false;
    }

    const db = getDatabase();
    const conditions: SQL<unknown>[] = [];
    const idColumn = (table as any).id as PgColumn;

    // Exclude current item
    conditions.push(sql`${idColumn} != ${id}`);

    // Add unique field conditions
    for (const field of uniqueFields) {
      const column = (table as any)[field] as PgColumn;
      if (column && body[field] !== undefined) {
        conditions.push(eq(column, body[field]));
      }
    }

    const result = await db
      .select()
      .from((table as unknown) as any)
      .where(and(...conditions))
      .limit(1);

    if (result && result.length > 0) {
      throw buildErrObject(422, 'Este registro ya existe');
    }

    return false;
  } catch (error) {
    if (error instanceof Error && error.message === 'Este registro ya existe') {
      throw error;
    }
    logger.error('Error checking if item exists excluding itself:', error);
    throw error;
  }
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
