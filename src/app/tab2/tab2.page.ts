import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WeightRecord } from '../models/user/weight-record';
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

	public weightRecords: WeightRecord[] = [];

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
						this.weightRecords = user.weightRecords;
					}

					if (event)
					{
						(event.target as HTMLIonRefresherElement).complete();
					}
				});
		}
	}
}
