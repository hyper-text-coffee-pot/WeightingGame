import { Component, ViewChild } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { WeightRecord } from '../models/user/weight-record';
import { NotificationService } from '../services/notification.service';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';
import { IonAccordionGroup } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-tab1',
	templateUrl: 'tab1.page.html',
	styleUrls: ['tab1.page.scss'],
	standalone: false
})
export class Tab1Page {
	@ViewChild('weightGoalGroup', { static: true }) weightGoalGroup!: IonAccordionGroup;

	private dailyQuote: string = "Every journey begins with a single step."; // Default quote

	constructor(
		private firestoreService: FirestoreService,
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private notificationService: NotificationService,
		private http: HttpClient) {
		const currentUser = this.authService.getCurrentUser();
		if (currentUser?.authUser?.uid) {
			this.firestoreService.getUserFromFirestore(currentUser.authUser.uid)
				.then((user: IWeightingGameUser | null) => {
					if (user) {
						this.isTutorialComplete = user.isTutorialComplete;
						this.lastLoggedWeightLbsOz = user.lastLoggedWeightLbsOz;
						this.weightGoalLbsOz = user.weightGoalLbsOz;
					}
				});
		}

		this.weightLoggerForm = this.formBuilder.group({
			currentWeight: ['', Validators.required]
		});

		this.weightGoalForm = this.formBuilder.group({
			weightGoal: ['', Validators.required]
		});

		// Load daily quote on initialization
		this.loadDailyQuote();
	}

	// Default to false to prevent annoying flicker.
	public isTutorialComplete: boolean = true;

	public weightLoggerForm: FormGroup;

	public weightGoalForm: FormGroup;

	public lastLoggedWeightLbsOz: number = 0;

	public weightGoalLbsOz: number = 0;

	public closeCard(): void {
		const currentUser = this.authService.getCurrentUser();
		if (currentUser?.authUser?.uid) {
			this.isTutorialComplete = true;
			this.firestoreService.updateUser(currentUser.authUser.uid, { isTutorialComplete: true });
		}
	}

	public async logWeight(): Promise<void> {
		if (this.weightLoggerForm.invalid) {
			await this.notificationService.presentAlert("Uh oh! 😔", "Please check the form and try again.", "red");
			return;
		}
		else {
			const user = this.authService.getCurrentUser();
			if (user?.authUser?.uid && this.weightLoggerForm.valid) {
				if (isNaN(this.weightLoggerForm.value.currentWeight) || this.weightLoggerForm.value.currentWeight <= 0) {
					await this.notificationService.presentAlert("Uh oh! 😔", "Please enter a valid weight.", "red");
					return;
				}
				else {
					// Convert to consistent decimal format.
					let newWeightLbsOz = parseFloat(this.weightLoggerForm.value.currentWeight.toFixed(2));
					let weightRecord = new WeightRecord(newWeightLbsOz);
					await this.firestoreService.updateUser(user.authUser.uid, { lastLoggedWeightLbsOz: newWeightLbsOz });
					this.lastLoggedWeightLbsOz = newWeightLbsOz;
					this.firestoreService.addOrUpdateWeightRecord(user?.authUser?.uid, weightRecord)
						.then(() => {
							this.authService.refreshCurrentUser();
							this.notificationService.presentToast("Success! 🎉", "Your weight has been logged.", "success", "top");
							this.weightLoggerForm.reset();
							this.weightLoggerForm.markAsPristine();
							this.weightLoggerForm.markAsUntouched();
						}).catch((error) => {
							console.error('Error adding record:', error)
							this.notificationService.presentAlert("Uh oh! 😔", "A record for this date already exists. Please check your records.", "red");
						});
				}
			}
		}
	}

	public async saveWeightGoal(): Promise<void> {
		if (this.weightGoalForm.invalid) {
			await this.notificationService.presentAlert("Uh oh! 😔", "Please check the form and try again.", "red");
			return;
		}
		else {
			const user = this.authService.getCurrentUser();
			if (user?.authUser?.uid && this.weightGoalForm.valid) {
				if (isNaN(this.weightGoalForm.value.weightGoal) || this.weightGoalForm.value.weightGoal <= 0) {
					await this.notificationService.presentAlert("Uh oh! 😔", "Please enter a valid weight goal.", "red");
					return;
				}
				else {
					// Convert to consistent decimal format.
					let newWeightLbsOz = parseFloat(this.weightGoalForm.value.weightGoal.toFixed(2));
					await this.firestoreService.updateUser(user.authUser.uid, { weightGoalLbsOz: newWeightLbsOz });
					this.weightGoalLbsOz = newWeightLbsOz;
					this.authService.refreshCurrentUser();
					this.notificationService.presentToast("Success! 🎉", "Your weight goal has been updated.", "success", "top");
					this.weightGoalForm.reset();
					this.weightGoalForm.markAsPristine();
					this.weightGoalForm.markAsUntouched();
					// Collapse the accordion after saving
					const nativeEl = this.weightGoalGroup;
					nativeEl.value = undefined;
				}
			}
		}
	}

	private async loadDailyQuote(): Promise<void> {
		try {
			const response = await this.http.get<any[]>('https://zenquotes.io/api/today').toPromise();
			if (response && response.length > 0) {
				this.dailyQuote = `"${response[0].q}" - ${response[0].a}`;
			}
		} catch (error) {
			console.error('Error fetching daily quote:', error);
			// Keep the default quote if API fails
		}
	}

	public getDailyQuote(): string {
		return this.dailyQuote;
	}

	public getWeightGoalMessage(): string {
		const difference = this.lastLoggedWeightLbsOz - this.weightGoalLbsOz;
		const formattedDifference = Math.abs(difference);

		if (difference <= 0) {
			// At or below goal weight
			return `Congratulations! 🎉 You've reached your weight goal! You're ${formattedDifference.toFixed(1)} lbs at or below your target. Amazing work!`;
		} else if (difference <= 5) {
			// Close to goal (within 5 lbs)
			return `So close! 💪 You're only ${difference.toFixed(1)} lbs away from your goal! Keep pushing!`;
		} else {
			// Still working toward goal
			return `You're ${difference.toFixed(1)} lbs away from your goal! Keep up the great work!`;
		}
	}

	public getWeightGoalSubtitle(): string {
		const difference = this.lastLoggedWeightLbsOz - this.weightGoalLbsOz;

		if (difference <= 0) {
			return "Goal achieved! 🏆";
		} else if (difference <= 5) {
			return "Almost there! 🔥";
		} else {
			return "You got this! 💪🏼";
		}
	}
}
