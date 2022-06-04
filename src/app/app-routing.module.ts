import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {InvoicesComponent} from "./pages/invoices/invoices.component";

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'invoices', component: InvoicesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
