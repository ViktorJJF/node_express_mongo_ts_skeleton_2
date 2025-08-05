import { NextFunction, Request, Response } from 'express';
import model from '../models/bots';
import {
  createItem,
  deleteItem,
  getItem,
  listItemsPaginated,
  updateItem,
  createItems,
  updateItems,
  deleteItems,
} from '../helpers/db';
import {
  IBot,
  ICreateBot,
  IUpdateBot,
  IBulkCreateBots,
  IBulkUpdateBots,
  IBulkDeleteBots,
} from '../types/bots';
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

  public bulkCreate = async (
    req: Request<{}, {}, IBulkCreateBots>,
    res: Response<SuccessResponse<{ created: number; items: IBot[] }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { bots } = req.body;

      // Check for duplicate names within the request
      const names = bots.map((bot) => bot.name);
      const duplicateNames = names.filter(
        (name, index) => names.indexOf(name) !== index,
      );
      if (duplicateNames.length > 0) {
        throw new Error(
          `Duplicate names found in request: ${duplicateNames.join(', ')}`,
        );
      }

      // Check if any bots with these names already exist
      for (const bot of bots) {
        await itemExists(bot, model, UNIQUE_FIELDS);
      }

      const createdItems = await createItems<IBot>(bots, model);
      res.status(200).json({
        ok: true,
        payload: {
          created: createdItems.length,
          items: createdItems,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public bulkUpdate = async (
    req: Request<{}, {}, IBulkUpdateBots>,
    res: Response<SuccessResponse<{ modified: number; items: IBot[] }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { updates } = req.body;

      // Validate each update for uniqueness constraints
      for (const update of updates) {
        if (update.data.name) {
          await itemExistsExcludingItself(
            update.id,
            model,
            update.data,
            UNIQUE_FIELDS,
          );
        }
      }

      const result = await updateItems<IBot>(updates, model);
      res.status(200).json({ ok: true, payload: result });
    } catch (error) {
      next(error);
    }
  };

  public bulkDelete = async (
    req: Request<{}, {}, IBulkDeleteBots>,
    res: Response<SuccessResponse<{ deleted: number; items: IBot[] }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await deleteItems<IBot>(ids, model);
      res.status(200).json({ ok: true, payload: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
