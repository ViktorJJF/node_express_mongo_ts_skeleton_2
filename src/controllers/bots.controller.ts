import { NextFunction, Request, Response } from 'express';
import model from '../models/bots';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { Bot as BotType, CreateBot, UpdateBot } from '../types/bots';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<BotType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<BotType>(req, model);
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<BotType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await getItem<BotType>(req.params.id, model);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, CreateBot>,
    res: Response<SuccessResponse<BotType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const bot = new model(req.body);
      const item = await createItem<BotType>(bot);
      res.status(201).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, UpdateBot>,
    res: Response<SuccessResponse<BotType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await updateItem<BotType>(req.params.id, model, req.body);
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
      await deleteItem(req.params.id, model);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
