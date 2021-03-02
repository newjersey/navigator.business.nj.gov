import * as serverless from 'serverless-http';
import * as express from 'express';
import {Request, Response} from "express";
import * as bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.get('/message', (_req: Request, res: Response) => {
  res.send({ message: 'This is message route' });
});

app.post('/message', (req: Request, res: Response) => {
  res.send({ message: `Hello ${req.body.name}` });
});

app.use((_req: Request, res: Response) => {
  res.send({ message: 'Server is running' });
});

export const hello = serverless(app);