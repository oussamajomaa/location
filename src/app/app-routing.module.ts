import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LocationComponent } from './location/location.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'login'},
  {path:'login', component:LoginComponent},
  {path:'home', component:HomeComponent},
  {path:'map', component:MapComponent, canActivate:[AuthGuard]},
  {path:'location', component:LocationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
