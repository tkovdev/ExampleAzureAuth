import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MsalBroadcastService, MsalGuard, MsalInterceptor, MsalModule, MsalRedirectComponent, MsalService} from "@azure/msal-angular";
import {BrowserCacheLocation, InteractionType, PublicClientApplication} from "@azure/msal-browser";
import {environment} from "../environments/environment";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {RoleGuard} from "./guards/role.guard";
import {SignalrService} from "./services/signalr.service";
import { GRAPH_CLIENT, graphClientFactory } from './providers/graph-client.provider';
import { Client } from '@microsoft/microsoft-graph-client';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,

    MsalModule.forRoot( new PublicClientApplication({ // MSAL Configuration
      auth: {
        clientId: environment.AzureAd.clientId,
        authority: environment.AzureAd.authority,
        redirectUri: environment.AzureAd.redirectUri,

      },
      cache: {
        cacheLocation : BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: true, // set to true for IE 11
      },
      system: {
        loggerOptions: {
          loggerCallback: () => {},
          piiLoggingEnabled: false
        }
      }
    }), {
      interactionType: InteractionType.Redirect, // MSAL Guard Configuration
    }, {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: new Map([
        ['https://localhost:5001/api/*', ['https://api.exampleauth.tkov.dev/API.Read']],
      ])})

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: Client,
      useFactory: graphClientFactory,
      deps: [MsalService]
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    RoleGuard,
    SignalrService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
