import { NextFunction, Request, Response } from 'express';
import model from '../models/bots';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { IBot, ICreateBot, IUpdateBot } from '../types/bots';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';
import { itemExists, itemExistsExcludingItself } from '../helpers/db';

const UNIQUE_FIELDS = ['name'];

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<IBot>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<IBot>(req, model);
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<IBot>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await getItem<IBot>(req.params.id, model);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, ICreateBot>,
    res: Response<SuccessResponse<IBot>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const bot = req.body;
      const doesItemExist = await itemExists(bot, model, UNIQUE_FIELDS);
      if (!doesItemExist) {
        const item = await createItem<IBot>(bot, model);
        res.status(200).json({ ok: true, payload: item });
      }
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, IUpdateBot>,
    res: Response<SuccessResponse<IBot>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const doesItemExist = await itemExistsExcludingItself(
        id,
        model,
        req.body,
        UNIQUE_FIELDS,
      );
      if (!doesItemExist) {
        const item = await updateItem<IBot>(id, model, req.body);
        res.status(200).json({ ok: true, payload: item });
      }
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<IBot>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedItem = await deleteItem<IBot>(id, model);
      res.status(200).json({ ok: true, payload: deletedItem });
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
