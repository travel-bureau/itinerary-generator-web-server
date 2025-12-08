import { ApolloServerPlugin } from '@apollo/server';

export const StripNullDataPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        const body = response.body as any;

        if (body.kind === 'single' && body.singleResult.errors && body.singleResult.data === null) {
          delete body.singleResult.data;
        }
      },
    };
  },
};