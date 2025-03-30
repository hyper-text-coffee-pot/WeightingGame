import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ConfigService
{
	private config = (window as any).appConfig || {};

	get firebaseConfig(): any
	{
		return this.config.firebaseConfig ?? {};
	}
}