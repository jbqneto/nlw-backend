import { Request, Response } from 'express';
import knex from '../database/connection';
import util from '../config/util';

const ip = util.Network.getIp();

class PointsController {

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        id: point.id,
        title: point.title,
        image: `http://${ip}:3000/uploads/${point.image}`
      };
    });

    return response.json(serializedPoints);

  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const point = await knex('points').where('id', id).first();

      if (!point)
        return response.status(404).json({ error: `Ponto não encontrado: ${id}` });

      const serializedPoint = { ...point, image: `http://${ip}:3000/uploads/${point.image}` }

      const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id).select('items.id', 'items.title');

      return response.json({ point: serializedPoint, items });

    } catch (error) {
      return response.status(error.status || 400).json({ error: error.message });
    }

  }

  async edit(request: Request, response: Response) {
    const { id } = request.params;
    const { image } = request.body;

    try {
      const point = await knex('points').where('id', id).first();

      if (!point)
        return response.status(404).json({ error: `Ponto não encontrado: ${id}` });

      await knex('points').where('id', '=', id).update('image', image);

      return response.status(204).send();

    } catch (error) {
      return response.status(error.status || 500).json({ error: error.message });
    }

  }

  async create(request: Request, response: Response) {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

    try {

      const transaction = await knex.transaction();
      const point = {
        name,
        email,
        image: request.file.filename,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
      };

      const insertedPointIds = await transaction('points').insert(point);

      const point_id = insertedPointIds[0];

      const pointItems = items
        .split(',')
        .map((item: string) => parseInt(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id
          }
        });

      await transaction('point_items').insert(pointItems);

      await transaction.commit();

      return response.status(201).json({ id: point_id, ...point });

    } catch (error) {
      console.log(error);
      return response.status(error.status || 500).json(error.message || 'Erro ao gravar ponto');
    }

  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const { image } = request.body;

    try {
      const point = await knex('points').where('id', id).first();

      if (!point)
        return response.status(404).json({ error: `Ponto não encontrado: ${id}` });

      await knex('points').where('id', '=', id).del();

      return response.status(204).send();

    } catch (error) {
      return response.status(error.status || 500).json({ error: error.message });
    }
  }
}

export default PointsController;