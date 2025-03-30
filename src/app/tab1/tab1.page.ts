import { Component } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Habit } from '../models/user/habit';
import { NotificationService } from '../services/notification.service';
import { IHabitMapperUser } from '../abstractions/i-habit-mapper-user';

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
				.then((user: IHabitMapperUser | null) =>
				{
					if (user)
					{
						this.isTutorialComplete = user.isTutorialComplete;
					}
				});
		}

		this.habitForm = this.formBuilder.group({
			habitName: ['', Validators.required],
			emojiMood: ['', Validators.required],
			emotion: ['', Validators.required],
			trigger: ['', Validators.required],
			context: ['', Validators.required],
			motivationLevel: ['', Validators.required]
		});
	}

	// Default to false to prevent annoying flicker.
	public isTutorialComplete: boolean = true;

	public habitForm: FormGroup;

	public closeCard(): void
	{
		const currentUser = this.authService.getCurrentUser();
		if (currentUser?.authUser?.uid)
		{
			this.isTutorialComplete = true;
			this.firestoreService.updateUser(currentUser.authUser.uid, { isTutorialComplete: true });
		}
	}

	public async logHabit(): Promise<void>
	{
		if (this.habitForm.invalid)
		{
			await this.notificationService.presentAlert("Uh oh! 😔", "Please check the form and try again.", "red");
			return;
		}
		else
		{
			const user = this.authService.getCurrentUser();
			if (user?.authUser?.uid && this.habitForm.valid)
			{
				let habit = new Habit(
					this.habitForm.value.habitName,
					this.habitForm.value.emojiMood,
					this.habitForm.value.emotion,
					this.habitForm.value.trigger,
					this.habitForm.value.context,
					this.habitForm.value.motivationLevel
				);

				this.firestoreService.addHabit(user?.authUser?.uid, habit)
					.then(() =>
					{
						this.authService.refreshCurrentUser(false);
						this.notificationService.presentToast("Success! 🎉", "Your habit has been logged.", "success", "top");
						this.habitForm.reset();
					});
			}
		}
	}
}
