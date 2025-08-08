import { NextFunction, Request, Response } from 'express';
import { bots } from '../schemas/database';
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
  IBotListResponse,
  IListOneBotResponse,
  ICreateBotResponse,
  IUpdateBotResponse,
  IDeleteBotResponse,
  IBulkCreateBotsResponse,
  IBulkUpdateBotsResponse,
  IBulkDeleteBotsResponse,
} from '../types/entities/bots';
import { ListQuery } from '../types/shared/query';
import { itemExists, itemExistsExcludingItself } from '../helpers/db';

const UNIQUE_FIELDS = ['name'];

class Controller {
  public list = async (
    req: Request<{}, {}, {}, Partial<ListQuery>>,
    res: Response<IBotListResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paginatedResponse = await listItemsPaginated<typeof bots, IBot>(
        req,
        bots,
      );
      res.status(200).json(paginatedResponse);
    } catch (error) {
      next(error);
    }
  };

  public listOne = async (
    req: Request<{ id: string }>,
    res: Response<IListOneBotResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await getItem<typeof bots, IBot>(id, bots);
      res.status(200).json({ ok: true, payload: item });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request<{}, {}, ICreateBot>,
    res: Response<ICreateBotResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const bot = req.body;
      const doesItemExist = await itemExists(bot, bots, UNIQUE_FIELDS);
      if (!doesItemExist) {
        const item = await createItem<typeof bots, IBot>(bot, bots);
        res.status(200).json({ ok: true, payload: item });
      }
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }, {}, IUpdateBot>,
    res: Response<IUpdateBotResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const doesItemExist = await itemExistsExcludingItself(
        id,
        bots,
        req.body,
        UNIQUE_FIELDS,
      );
      if (!doesItemExist) {
        const item = await updateItem<typeof bots, IBot>(id, bots, req.body);
        res.status(200).json({ ok: true, payload: item });
      }
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request<{ id: string }>,
    res: Response<IDeleteBotResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const deletedItem = await deleteItem<typeof bots, IBot>(id, bots);
      res.status(200).json({ ok: true, payload: deletedItem });
    } catch (error) {
      next(error);
    }
  };

  public bulkCreate = async (
    req: Request<{}, {}, IBulkCreateBots>,
    res: Response<IBulkCreateBotsResponse>,
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
      for (const bot of validatedData.bots) {
        await itemExists(bot, bots, UNIQUE_FIELDS);
      }

      const createdItems = await createItems<typeof bots, IBot>(
        validatedData.bots,
        bots,
      );
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
    res: Response<IBulkUpdateBotsResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { updates } = req.body;

      // Validate each update for uniqueness constraints
      for (const update of updates) {
        if (update.data.name) {
          await itemExistsExcludingItself(
            update.id,
            bots,
            update.data,
            UNIQUE_FIELDS,
          );
        }
      }

      const updatesData = validatedData.updates.map((update) => ({
        id: parseInt(update.id, 10),
        data: update.data,
      }));
      const result = await updateItems<typeof bots, IBot>(updatesData, bots);
      res.status(200).json({ ok: true, payload: result });
    } catch (error) {
      next(error);
    }
  };

  public bulkDelete = async (
    req: Request<{}, {}, IBulkDeleteBots>,
    res: Response<IBulkDeleteBotsResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = req.body as IBulkDeleteBots;
      const result = await deleteItems<typeof bots, IBot>(
        validatedData.ids.map((id) => parseInt(id, 10)),
        bots,
      );
      res.status(200).json({ ok: true, payload: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new Controller();
