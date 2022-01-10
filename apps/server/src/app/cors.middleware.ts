import { Injectable, NestMiddleware } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Pomocná middleware pro vyřešení CORS problému.
 * Jednoduše řečeno: zajistí se, aby mohl klient běžící na adrese xxx
 * přistupovat k REST API serveru běžící na adrese yyy
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    if (req.headers['origin'] || req.headers['Origin']) {
      res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || req.headers['Origin']);
    } else {
      res.setHeader('Access-Control-Allow-Origin', req.headers['host']);
    }
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-id, x-session-state');
    res.setHeader('Access-Control-Expose-Headers', 'x-client-id, x-session-state');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.statusCode = 200;

    if (req.method === 'OPTIONS') {
      // Stop the middleware chain
      res.end('');
      return;
    }

    next();
  }
}
