import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppRole, AppRoleAssignment } from '@microsoft/microsoft-graph-types';
import { AdministrationService } from 'src/app/services/administration.service';

@Component({
  selector: 'app-delegated-administration',
  templateUrl: './delegated-administration.component.html',
  styleUrls: ['./delegated-administration.component.scss']
})
export class DelegatedAdministrationComponent implements OnInit {

  assignedUsers: IUser[] = [];
  appRoleAssignments: AppRoleAssignment[] = [];

  userOptions: IUser[] = [];
  roleOptions: IRole[] = [];

  appRoles: AppRole[] = [];

  fgLookupUser: FormGroup = this.initFgLookupUser();

  constructor(private administrationService: AdministrationService) { }

  ngOnInit(): void {
    this.refresh();
  }

  initFgLookupUser(): FormGroup {
    return new FormGroup({
      user: new FormControl(),
      role: new FormControl()
    });
  }

  getRoleNames(user: IUser): string[] {
    return user.roleIds.map((roleId) =>
      this.roleOptions.find((role) => role.id === roleId)?.name ?? roleId
    );
  }

  addUser(): void {
    const selectedUser = this.fgLookupUser.controls['user'].value as IUser;
    const selectedRole = this.fgLookupUser.controls['role'].value as IRole;
    if (!selectedUser || !selectedUser.id) alert(`FAILURE: Unknown user id`);
    if (!selectedRole || !selectedRole.id) alert(`FAILURE: Unknown role id`);

    this.administrationService.addUserToRoleDelegated(selectedUser.id, selectedRole.id).then((res: boolean) => {
      if(res){
        alert(`SUCCESS: User added to ${selectedRole.name} role.`)
        this.refresh();
      }else{
        alert(`FAILURE: User not added to ${selectedRole.name} role.`)
      }
    });
  }

  removeUser(userId: string): void {
    this.administrationService.removeUserDelegated(userId).then(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this.administrationService.getRolesDelegated().then((appRoles) => {
          this.roleOptions = appRoles.map((x) => {
            return {id: x.id ?? '', name: x.displayName ?? ''}
          })
    });
    this.administrationService.getUsersDelegated().then((users) => {
      this.userOptions = users.map((x) => {
        return { id: x.id ?? '', displayName: x.displayName ?? '', roleIds: [] }
      })
    });
    this.administrationService.getUsersInRolesDelegated().then((appRoleAssignments) => {
      this.appRoleAssignments = appRoleAssignments;

      const usersByPrincipal = new Map<string, IUser>();
      for (const assignment of appRoleAssignments) {
        const principalId = assignment.principalId!;
        let user = usersByPrincipal.get(principalId);
        if (!user) {
          user = { id: principalId, displayName: assignment.principalDisplayName ?? '', roleIds: [] };
          usersByPrincipal.set(principalId, user);
        }
        if (assignment.appRoleId && !user.roleIds.includes(assignment.appRoleId) && assignment.appRoleId != '00000000-0000-0000-0000-000000000000') {
          user.roleIds.push(assignment.appRoleId);
        }
      }
      this.assignedUsers = Array.from(usersByPrincipal.values());
    });
  }
}

interface IUser {
  id: string;
  displayName: string;
  roleIds: string[]
}

interface IRole {
  id: string;
  name: string;
}