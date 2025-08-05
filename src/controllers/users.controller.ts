import { NextFunction, Request, Response } from 'express';
import User from '../models/Users';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { IUser } from '../types/users';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<IUser>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<IUser>(req, User);
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<IUser>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await getItem<IUser>(req.params.id, User);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, Partial<IUser>>,
    res: Response<SuccessResponse<IUser>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await createItem<IUser>(req.body, User);
      res.status(201).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, Partial<IUser>>,
    res: Response<SuccessResponse<IUser>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await updateItem<IUser>(req.params.id, User, req.body);
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
      await deleteItem(req.params.id, User);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
