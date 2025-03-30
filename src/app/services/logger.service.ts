import { Injectable } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Injectable({
	providedIn: 'root'
})
export class LoggerService
{
	constructor(private analytics: Analytics) { }

	public logEvent(eventTitle: string, data: {}): void
	{
		logEvent(this.analytics, eventTitle, data);
	}
}
