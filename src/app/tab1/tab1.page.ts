import { Component } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { WeightRecord } from '../models/user/weight-record';
import { NotificationService } from '../services/notification.service';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';

@Component({
	selector: 'app-tab1',
	templateUrl: 'tab1.page.html',
	styleUrls: ['tab1.page.scss'],
	standalone: false
})
export class Tab1Page
{
	constructor(
		private firestoreService: FirestoreService,
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private notificationService: NotificationService)
	{
		const currentUser = this.authService.getCurrentUser();
		if (currentUser?.authUser?.uid)
		{
			this.firestoreService.getUserFromFirestore(currentUser.authUser.uid)
				.then((user: IWeightingGameUser | null) =>
				{
					if (user)
					{
						this.isTutorialComplete = user.isTutorialComplete;
					}
				});
		}

		this.weightLoggerForm = this.formBuilder.group({
			currentWeight: ['', Validators.required]
		});
	}

	// Default to false to prevent annoying flicker.
	public isTutorialComplete: boolean = true;

	public weightLoggerForm: FormGroup;

	public closeCard(): void
	{
		const currentUser = this.authService.getCurrentUser();
		if (currentUser?.authUser?.uid)
		{
			this.isTutorialComplete = true;
			this.firestoreService.updateUser(currentUser.authUser.uid, { isTutorialComplete: true });
		}
	}

	public async logWeight(): Promise<void>
	{
		if (this.weightLoggerForm.invalid)
		{
			await this.notificationService.presentAlert("Uh oh! 😔", "Please check the form and try again.", "red");
			return;
		}
		else
		{
			const user = this.authService.getCurrentUser();
			if (user?.authUser?.uid && this.weightLoggerForm.valid)
			{
				if (isNaN(this.weightLoggerForm.value.currentWeight) || this.weightLoggerForm.value.currentWeight <= 0)
				{
					await this.notificationService.presentAlert("Uh oh! 😔", "Please enter a valid weight.", "red");
					return;
				}
				else
				{
					// Convert to consistent decimal format.
					let newWeightLbsOz = parseFloat(this.weightLoggerForm.value.currentWeight.toFixed(2));
					let weightRecord = new WeightRecord(newWeightLbsOz);
					
					this.firestoreService.addOrUpdateWeightRecord(user?.authUser?.uid, weightRecord)
						.then(() =>
						{
							this.authService.refreshCurrentUser(false);
							this.notificationService.presentToast("Success! 🎉", "Your weight has been logged.", "success", "top");
							this.weightLoggerForm.reset();
						}).catch((error) => 
						{
							console.error('Error adding record:', error)
							this.notificationService.presentAlert("Uh oh! 😔", "A record for this date already exists. Please check your records.", "red");
						});
				}
			}
		}
	}
}
