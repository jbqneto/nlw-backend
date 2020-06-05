import express from 'express';
import knex from './database/connection';

const routes = express.Router();

routes.get('/items', async (request, response) => {
  const items = await knex('items').select('*');

  const serializedItems = items.map(item => {
    return {
      title: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`
    }
  });

  return response.json(serializedItems);
});


routes.post('/points', async (request, response) => {
  const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

  try {
    const transaction = await knex.transaction();

    const insertedPointIds = await transaction('points').insert({
      name,
      email,
      image: '',
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    });

    const point_id = insertedPointIds[0];

    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id
      }
    });

    console.log(pointItems);

    const pointItemsInserted = await transaction('point_items').insert(pointItems);

    await transaction.commit();

    return response.status(201).json({ point_id, pointItemsInserted });

  } catch (error) {
    console.log(error);
    return response.status(error.status || 500).json(error.message || 'Erro ao gravar ponto');
  }

});

export default routes;