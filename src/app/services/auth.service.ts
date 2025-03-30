import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { UserStorageService } from './user-storage.service';
import { LoggerService } from './logger.service';
import { WeightingGameUser } from '../models/user/weighting-game-user';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';

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
						const weightingGameUser: WeightingGameUser = new WeightingGameUser(user);
						const userId = weightingGameUser?.authUser?.uid || '';
						if (userId)
						{
							this.firestoreService.getUserFromFirestore(userId)
								.then((userDoc: IWeightingGameUser | null) =>
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
										this.firestoreService.addUser(weightingGameUser)
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

	public getCurrentUser(): WeightingGameUser | null
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
				const weightingGameUser = new WeightingGameUser(firebaseUser);
				this.firestoreService.getUserFromFirestore(weightingGameUser?.authUser?.uid)
					.then((userDoc: IWeightingGameUser | null) =>
					{
						if (userDoc)
						{
							weightingGameUser.MapFromFirestoreData(userDoc);

							if (!includeHabits)
							{
								weightingGameUser.weightRecords = [];
							}

							this.userStorageService.setUser(weightingGameUser);
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
