// graph-client.provider.ts
import { InjectionToken } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';
import { MsalService } from '@azure/msal-angular';

export const GRAPH_CLIENT = new InjectionToken<Client>('GRAPH_CLIENT');

export function graphClientFactory(msalService: MsalService): Client {
  return Client.init({
    authProvider: async (done) => {
      const account = msalService.instance.getActiveAccount()
        ?? msalService.instance.getAllAccounts()[0];

      if (!account) {
        done(new Error('Not signed in'), null);
        return;
      }

      const scopes = [
        'Application.Read.All',
        'AppRoleAssignment.ReadWrite.All',
        'User.Read.All',
        'Group.Read.All'
      ];

      try {
        const result = await msalService.instance.acquireTokenSilent({
          scopes,
          account
        });
        done(null, result.accessToken);
      } catch (error: any) {
        console.log('Silent failed:', error.errorCode, error);

        // Trigger interactive consent
        if (
          error.errorCode === 'consent_required' ||
          error.errorCode === 'interaction_required' ||
          error.message?.includes('AADSTS65001')
        ) {
          try {
            const result = await msalService.instance.acquireTokenPopup({
              scopes,
              account
            });
            done(null, result.accessToken);
          } catch (interactiveError) {
            console.error('Interactive failed:', interactiveError);
            done(interactiveError, null);
          }
        } else {
          done(error, null);
        }
      }
    }
  });
}