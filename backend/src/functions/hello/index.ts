import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.hello`,
  events: [
    {
      http: {
        method: 'ANY',
        path: '{proxy+}',
      },
      https: {
        method: 'ANY',
        path: '{proxy+}',
      }
    }
  ]
}
