import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import { json } from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload';
import { logger } from './loggers/logger';
import { createRouter } from './routes';
import { authMiddleware } from './authMiddleware';
import { requestMiddleware } from './requestMiddleware';
import apolloServer from './apolloServer';

export const app = express();

// Use compression (gzip) for responses.
app.use(compression());

// Automatically decode json.
app.use(json());

// Add custom configured logger (morgan through winston).
app.use(
  morgan('combined', {
    skip: (req, res) => {
      return req.originalUrl.startsWith('/status');
    },
    stream: {
      write: message => logger.info(message.trim())
    }
  })
);

// TODO: Restrict requests to lagoon domains?
app.use(cors());

app.use(requestMiddleware);
app.use(authMiddleware);

// Add routes.
app.use('/', createRouter());

app.use(graphqlUploadExpress());

apolloServer.applyMiddleware({ app });
