import { Request, Response } from 'express';
import knex from '../database/connection';

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

    return response.json(points);

  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const point = await knex('points').where('id', id).first();

      if (!point)
        return response.status(404).json({ error: `Ponto não encontrado: ${id}` });

      const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id).select('title');

      return response.json({ point, items });

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

      await knex('points').where('id','=',id).update('image', image);
      
      return response.status(204).send();

    } catch (error) {
      return response.status(error.status || 500).json({error: error.message});
    }

  }

  async create(request: Request, response: Response) {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

    try {

      const transaction = await knex.transaction();
      const point = {
        name,
        email,
        image: '',
        whatsapp,
        latitude,
        longitude,
        city,
        uf
      };

      const insertedPointIds = await transaction('points').insert(point);

      const point_id = insertedPointIds[0];

      const pointItems = items.map((item_id: number) => {
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
}

export default PointsController;