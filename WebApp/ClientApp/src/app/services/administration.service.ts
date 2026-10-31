import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, finalize, Observable, retry} from "rxjs";
import {environment} from "../../environments/environment";
import {IRole, IUser, IUserRole} from "../models/administration";
import { Client } from '@microsoft/microsoft-graph-client';
import { User, Message, AppRole, ServicePrincipal, AppRoleAssignment } from '@microsoft/microsoft-graph-types';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  GROUP_ID: string = environment.AzureAd.groupId; //ID of the group granted general authorization for the app.
  APP_OBJECT_ID: string = environment.AzureAd.enterpriseAppId; //ID of the Enterprise App (not app reg).

  constructor(private http: HttpClient, private graphClient: Client) { }

  public getRoles(): Observable<IRole[]> {
    return this.http.get<any[]>(environment.apiUrl + 'administration/roles').pipe(
      retry(3),
      catchError((err, caught) => {
        this.handleError(err);
        return new Observable<any[]>((subscriber) => {
          subscriber.next(undefined);
        })
      }),
      finalize(() => {

      })
    );
  }

  public getUsers(): Observable<IUser[]> {
    return this.http.get<any[]>(environment.apiUrl + 'administration/users').pipe(
      retry(3),
      catchError((err, caught) => {
        this.handleError(err);
        return new Observable<any[]>((subscriber) => {
          subscriber.next(undefined);
        })
      }),
      finalize(() => {

      })
    );
  }

  public getUsersInRoles(): Observable<IUserRole[]> {
    return this.http.get<any[]>(environment.apiUrl + 'administration/users/roles').pipe(
      retry(3),
      catchError((err, caught) => {
        this.handleError(err);
        return new Observable<any[]>((subscriber) => {
          subscriber.next(undefined);
        })
      }),
      finalize(() => {

      })
    );
  }

  public addUserToRole(userId: string, role: string): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + `administration/users/${userId}/roles/${role}`, null).pipe(
      retry(3),
      catchError((err, caught) => {
        this.handleError(err);
        return new Observable<boolean>((subscriber) => {
          subscriber.next(undefined);
        })
      }),
      finalize(() => {

      })
    );
  }

  public removeUser(userId: string): Observable<boolean> {
    return this.http.delete<boolean>(environment.apiUrl + `administration/users/${userId}`).pipe(
      retry(3),
      catchError((err, caught) => {
        this.handleError(err);
        return new Observable<boolean>((subscriber) => {
          subscriber.next(undefined);
        })
      }),
      finalize(() => {

      })
    );
  }

  private handleError(err: any): void {
    console.log('Error: ' + err)
  }

  private async getServicePrincipal(): Promise<ServicePrincipal> {
    return await this.graphClient
      .api(`/servicePrincipals(appId='${environment.AzureAd.clientId}')`)
      .get();
  }

  public async getRolesDelegated(): Promise<AppRole[]> {
    return await this.graphClient
      .api(`/servicePrincipals(appId='${environment.AzureAd.clientId}')`)
      .select('appRoles')
      .get()
      .then((sp: ServicePrincipal) => sp.appRoles ?? []);
  }

  public async getUsersDelegated(): Promise<User[]> {
    return await this.graphClient.api(`groups/${this.GROUP_ID}/members`)
      .get()
      .then((response: { value: User[]}) => response.value ?? []);
  }

  public async getUsersInRolesDelegated(): Promise<AppRoleAssignment[]> {
    const sp = await this.getServicePrincipal();
    return await this.graphClient
      .api(`/servicePrincipals/${sp.id}/appRoleAssignedTo`)
      .get()
      .then((response: { value: AppRoleAssignment[] }) => response.value ?? []);
  }

  public async addUserToRoleDelegated(userId: string, role: string): Promise<boolean> {
    const appRoleAssignment = {
      '@odata.type': '#microsoft.graph.appRoleAssignment',
      appRoleId: role,
      principalId: userId,
      resourceId: this.APP_OBJECT_ID
    };

    return await this.graphClient.api(`/users/${userId}/appRoleAssignments`)
      .post(appRoleAssignment)
      .then(() => true)
      .catch((err) => {
        console.error(err)
        return false;
      });
  }

  public async getUserRolesDelegated(userId: string): Promise<AppRoleAssignment[]> {
      return await this.graphClient.api(`/users/${userId}/appRoleAssignments`)
        .get()
        .then((response: { value: AppRoleAssignment[] }) => response.value ?? []);
  }

  public async removeUserDelegated(userId: string): Promise<void> {
    await this.getUserRolesDelegated(userId).then(async (appRoleAssignments) => {
      for (let appRoleAssignment of appRoleAssignments) {
        await this.graphClient.api(`/users/${userId}/appRoleAssignments/${appRoleAssignment.id}`)
          .delete();
      }
    });
  }

}
