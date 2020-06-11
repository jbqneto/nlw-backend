import path from 'path';
import express, { Request, Response } from 'express';
import router from './routes';
import { errors } from 'celebrate';

const app = express();

app.use((req: Request, res: Response, next: Function) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({});
  }

  next();

});

app.use(express.json());
app.use(router);
app.use(errors());

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

const server = app.listen(3000, 'localhost');