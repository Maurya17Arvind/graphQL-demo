import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      // https://graphqlzero.almansi.me/api
      return {
        link: httpLink.create({
          uri: 'https://graphqlplaceholder.vercel.app/graphql',
        }),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            notifyOnNetworkStatusChange: false,
          },
        },
      };
    }),
  ],
};
