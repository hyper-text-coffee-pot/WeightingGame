import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Habit } from '../models/user/habit';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-tab2',
	templateUrl: 'tab2.page.html',
	styleUrls: ['tab2.page.scss'],
	standalone: false,
})
export class Tab2Page
{
	constructor(
		private router: Router,
		private authService: AuthService,
		private firestoreService: FirestoreService
	)
	{
		this.loadHabits();
	}

	public habits: Habit[] = [];

	public loadHabits(event?: any): void
	{
		const user = this.authService.getCurrentUser();
		if (user)
		{
			this.firestoreService.getUserFromFirestore(user.authUser?.uid)
				.then((user) =>
				{
					if (user)
					{
						this.habits = user.habits;
					}

					if (event)
					{
						(event.target as HTMLIonRefresherElement).complete();
					}
				});
		}
	}
}
