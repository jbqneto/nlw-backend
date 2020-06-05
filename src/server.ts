import path from 'path';
import express from 'express';
import router from './routes';

const app = express();

app.use(express.json());
app.use(router);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3000);