import * as path from 'path';

import {
  SERVER_HTTP_PORT as HTTP_PORT,
  SERVER_SOCKET_PORT as SOCKET_PORT
} from 'diplomka-share';

export const SERVER_HTTP_PORT = HTTP_PORT;
export const SERVER_SOCKET_PORT = SOCKET_PORT;
export const FILE_BROWSER_BASE_PATH = `${path.sep}tmp`;
