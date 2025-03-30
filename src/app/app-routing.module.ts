import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';
import { UnauthorizedRedirectGuard } from './guards/unauthorized-redirect.guard';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./login-signup/login-signup.module').then(m => m.LoginSignupPageModule),
		pathMatch: 'full',
		canActivate: [AuthRedirectGuard]
	},
	{
		path: 'tabs',
		loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
		canActivate: [UnauthorizedRedirectGuard]
	}
];
@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
