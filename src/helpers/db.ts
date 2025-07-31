import { Request } from 'express';
import { Document } from 'mongoose';
import { PaginatedResponse } from '../types/shared/response';

type ModelInstance = any;
import { buildErrObject } from './utils';
import logger from '../config/logger';

const buildSort = (
  sort: string,
  order: number | string,
): Record<string, number | string> => {
  return { [sort]: order };
};

const cleanPaginationID = (result: any): any => {
  result.docs.map((element: any) => delete element.id);
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

const listInitOptions = async (req: Request): Promise<Record<string, any>> => {
  const order = (req.query.order || 'asc') as string;
  const sort = (req.query.sort || 'createdAt') as string;
  const sortBy = buildSort(sort, order);
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 99999;
  return {
    order,
    sort: sortBy,
    lean: true,
    page,
    limit,
  };
};

async function checkQueryString(
  query: Record<string, any>,
): Promise<Record<string, any>> {
  const queries: Record<string, any> = {};
  for (const key in query) {
    if (query.hasOwnProperty(key)) {
      const element = query[key];
      if (key !== 'filter' && key !== 'fields' && key !== 'page') {
        queries[key] = element;
      }
    }
  }
  try {
    if (query.filter && query.fields) {
      const data: Record<string, any> = { $or: [] };
      const array: any[] = [];
      const arrayFields = query.fields.split(',');
      arrayFields.map((item: string) => {
        array.push({
          [item]: {
            $regex: new RegExp(query.filter, 'i'),
          },
        });
      });
      data.$or = array;
      return { ...data, ...queries };
    } else {
      return queries;
    }
  } catch (err: any) {
    logger.error(err.message);
    throw buildErrObject(422, 'ERROR_WITH_FILTER');
  }
}

async function getAllItems(model: ModelInstance): Promise<any> {
  return model.find({}, '-updatedAt -createdAt', {
    sort: { name: 1 },
  });
}

async function getItems<T>(
  req: Request,
  model: ModelInstance,
  query: Record<string, any>,
  fields: string,
): Promise<PaginatedResponse<T>> {
  const options = await listInitOptions(req);
  for (const key in options) {
    if (query.hasOwnProperty(key)) delete query[key];
  }
  options.select = fields;
  const items = await model.paginate(query, options);
  return cleanPaginationID(items);
}

async function getAggregatedItems<T>(
  req: Request,
  model: ModelInstance,
  aggregated: any[],
): Promise<PaginatedResponse<T>> {
  const options = await listInitOptions(req);
  const aggregate = model.aggregate(aggregated);
  const items = await model.aggregatePaginate(aggregate, options);
  return cleanPaginationID(items);
}

async function getItem<T>(id: string, model: ModelInstance): Promise<T> {
  const item = await model.findById(id);
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  return item;
}

async function filterItems<T>(
  fields: Record<string, any>,
  model: ModelInstance,
): Promise<{ ok: boolean; payload: T[] }> {
  const payload = await model.find(fields);
  return { ok: true, payload };
}

async function createItem<T>(item: Document): Promise<T> {
  return (await item.save()) as T;
}

async function updateItem<T>(
  id: string,
  model: ModelInstance,
  body: Record<string, any>,
): Promise<T> {
  const item = await model.findById(id);
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
  item.set(body);
  return await item.save();
}

async function deleteItem(id: string, model: ModelInstance): Promise<void> {
  const item = await model.findByIdAndDelete(id);
  if (!item) {
    throw buildErrObject(404, 'NOT_FOUND');
  }
}

export const listItemsPaginated = async <T>(
  req: Request,
  model: ModelInstance,
): Promise<PaginatedResponse<T>> => {
  const query = await checkQueryString(req.query);
  const fields = req.query.fields
    ? (req.query.fields as string).split(',').join(' ')
    : '';
  const paginatedResponse = await getItems<T>(req, model, query, fields);
  return paginatedResponse;
};

export const itemExists = async (
  body: any,
  model: any,
  uniqueFields: string[],
): Promise<boolean> => {
  const query = uniqueFields.length > 0 ? {} : { noFields: true };
  for (const uniquefield of uniqueFields) {
    (query as any)[uniquefield] = body[uniquefield];
  }
  const item = await model.findOne(query);
  if (item) {
    throw buildErrObject(422, 'Este registro ya existe');
  }
  return false;
};

export const itemExistsExcludingItself = async (
  id: string,
  body: any,
  model: any,
  uniqueFields: string[],
): Promise<boolean> => {
  const query: any = uniqueFields.length > 0 ? {} : { noFields: true };
  for (const uniquefield of uniqueFields) {
    (query as any)[uniquefield] = body[uniquefield];
  }
  query._id = {
    $ne: id,
  };
  const item = await model.findOne(query);
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
};
