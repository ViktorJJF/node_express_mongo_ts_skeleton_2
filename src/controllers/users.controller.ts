import { NextFunction, Request, Response } from 'express';
import { users } from '../schemas/database';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { IUser } from '../types/entities/users';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<IUser>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<typeof users, IUser>(
        req,
        users,
      );
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
      const id = parseInt(req.params.id, 10);
      const item = await getItem<typeof users, IUser>(id, users);
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
      const item = await createItem<typeof users, IUser>(req.body, users);
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
      const id = parseInt(req.params.id, 10);
      const item = await updateItem<typeof users, IUser>(id, users, req.body);
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
      await deleteItem<typeof users, IUser>(id, users);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
