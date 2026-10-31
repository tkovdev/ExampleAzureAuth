import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministrationComponent} from "./pages/administration/administration.component";
import {RoleGuard} from "../../guards/role.guard";
import { DelegatedAdministrationComponent } from './pages/delegated-administration/delegated-administration.component';

const routes: Routes = [
  {path: '', component: AdministrationComponent, canActivate: [RoleGuard], data: {expectedRole: ['User.Administrator']}},
  {path: 'delegated', component: DelegatedAdministrationComponent, canActivate: [RoleGuard], data: {expectedRole: ['User.Administrator']}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
