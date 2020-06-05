import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {

  async show(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const point = await knex('points').where('id', id).first();

      if (!point)
        return response.status(404).json({ error: `Ponto não encontrado: ${id}` });

      return response.json(point);

    } catch (error) {
      return response.status(error.status || 400).json({ error: error.message });
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