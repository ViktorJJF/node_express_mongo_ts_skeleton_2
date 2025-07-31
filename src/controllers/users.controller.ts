import { NextFunction, Request, Response } from 'express';
import User from '../models/Users';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
} from '../helpers/db';
import { User as UserType, CreateUser, UpdateUser } from '../types/users';
import { SuccessResponse, PaginatedResponse } from '../types/shared/response';
import { ListQuery } from '../types/shared/query';

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<PaginatedResponse<UserType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<UserType>(req, User);
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<UserType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await getItem<UserType>(req.params.id, User);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, CreateUser>,
    res: Response<SuccessResponse<UserType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = new User(req.body);
      const item = await createItem<UserType>(user);
      res.status(201).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, UpdateUser>,
    res: Response<SuccessResponse<UserType>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const item = await updateItem<UserType>(req.params.id, User, req.body);
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
