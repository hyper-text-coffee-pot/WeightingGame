import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment.production';

@Component({
	selector: 'app-tab3',
	templateUrl: 'tab3.page.html',
	styleUrls: ['tab3.page.scss'],
	standalone: false,
})
export class Tab3Page
{
	constructor(private authService: AuthService) { }

	public appVersion = environment.version;

	public appVersionName = environment.versionName;

	public get currentUser()
	{
		return this.authService.getCurrentUser();
	}

	public signOut(): void
	{
		this.authService.signOut();
	}
}
