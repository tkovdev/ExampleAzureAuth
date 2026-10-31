import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationComponent } from './pages/administration/administration.component';
import { DelegatedAdministrationComponent } from './pages/delegated-administration/delegated-administration.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdministrationComponent,
    DelegatedAdministrationComponent
  ],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdministrationModule { }
