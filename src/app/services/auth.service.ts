import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { UserStorageService } from './user-storage.service';
import { LoggerService } from './logger.service';
import { HabitMapperUser } from '../models/user/habit-mapper-user';
import { IHabitMapperUser } from '../abstractions/i-habit-mapper-user';

@Injectable({
	providedIn: 'root'
})
export class AuthService
{
	constructor(
		private afAuth: Auth,
		private router: Router,
		private firestoreService: FirestoreService,
		private userStorageService: UserStorageService,
		private loggerService: LoggerService
	) { }

	/**
	 * Sign a user up or log them in.
	 * Creates a new user document in all the necessary collections.
	 * This one is a bit of an async mess, but whatevs.
	 */
	public completeSignInWithGooglePopup(): void
	{
		try
		{
			signInWithPopup(this.afAuth, new GoogleAuthProvider())
				.then((result: UserCredential) =>
				{
					if (result.user)
					{
						const user = result.user as User;

						// Map results to Habit Mapper User
						const habitMapperUser: HabitMapperUser = new HabitMapperUser(user);
						const userId = habitMapperUser?.authUser?.uid || '';
						if (userId)
						{
							this.firestoreService.getUserFromFirestore(userId)
								.then((userDoc: IHabitMapperUser | null) =>
								{
									if (userDoc != null && typeof userDoc !== 'undefined')
									{
										this.refreshCurrentUser(false)
											.then(() =>
											{
												this.router.navigate(['/tabs']);
											});
									}
									else
									{
										// If the user does not have data in Firestore, add the user to Firestore.
										this.firestoreService.addUser(userId)
											.then(() =>
											{
												// Regardless of whether the user has data in Firestore, set the user in local storage.
												this.refreshCurrentUser(false)
													.then(() =>
													{
														this.router.navigate(['/tabs']);
													});
											});
									}
								});
						}
						else
						{
							throw new Error('User ID is undefined');
						}
					}
					else
					{
						alert("Well, this is embarrassing. Sign up failed.");
						this.loggerService.logEvent('sign_up_failed', { error: 'Sign up failed.' });
					}
				});
		}
		catch (error)
		{
			this.loggerService.logEvent('sign_up_failed', { error: error });
		}
	}

	public getCurrentUser(): HabitMapperUser | null
	{
		return this.userStorageService.getUser();
	}

	/**
	 * When storing to local storage, the user's habits should not be included.
	 * This method refreshes the user object in local storage with the user's habits.
	 * @param includeHabits If true, the user's habits will be included in the user object.
	 */
	public refreshCurrentUser(includeHabits: boolean): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			const firebaseUser = this.afAuth.currentUser;
			if (firebaseUser)
			{
				const habitMapperUser = new HabitMapperUser(firebaseUser);
				this.firestoreService.getUserFromFirestore(habitMapperUser?.authUser?.uid)
					.then((userDoc: IHabitMapperUser | null) =>
					{
						if (userDoc)
						{
							habitMapperUser.MapFromFirestoreData(userDoc);

							if (!includeHabits)
							{
								habitMapperUser.habits = [];
							}

							this.userStorageService.setUser(habitMapperUser);
							resolve();
						}
					});
			}
		});
	}

	public signOut(): void
	{
		this.afAuth.signOut()
			.then(() =>
			{
				this.userStorageService.clearUser();
				this.router.navigate(['/']);
			}).catch(error => console.error('Error signing out:', error));
	}
}
