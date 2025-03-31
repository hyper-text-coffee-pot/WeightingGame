import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, updateDoc, arrayUnion, getDoc } from '@angular/fire/firestore';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';
import { WeightRecord } from '../models/user/weight-record';
import { WeightingGameUser } from '../models/user/weighting-game-user';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService
{
	constructor(private firestore: Firestore) { }

	// Add a new document to a collection
	public addWeightRecord(userId: string, data: WeightRecord): Promise<any>
	{
		const weightRecordData = data.toPlainObject();
		return updateDoc(doc(this.firestore, `users/${ userId }`),
			{
				weightRecords: arrayUnion(weightRecordData)
			});
	}

	/**
	 * Sign a user up or log them in.
	 * Creates a new user document in all the necessary collections.
	 */
	public addUser(weightingGameUser: WeightingGameUser): Promise<any>
	{
		let userId = weightingGameUser.authUser?.uid.trim();
		let userDisplayName = weightingGameUser.authUser?.displayName?.trim();
		let userEmail = weightingGameUser.authUser?.email?.trim();
		// Use merge: true to avoid overwriting, make sure you just send an empty object.
		return setDoc(doc(this.firestore, `users/${ userId }`), {
			displayName: userDisplayName,
			emailAddress: userEmail
		}, { merge: true });
	}

	public async getUserFromFirestore(userId: string | undefined): Promise<IWeightingGameUser | null>
	{
		if (!userId)
		{
			return null;
		}

		const userDocRef = doc(this.firestore, `users/${ userId }`);
		const userDoc = await getDoc(userDocRef);
		if (userDoc.exists())
		{
			return userDoc.data() as IWeightingGameUser;
		}
		else
		{
			console.log("No such document!");
			return null;
		}
	}

	public async getUserProperty(userId: string, property: string): Promise<any>
	{
		const userDocRef = doc(this.firestore, `users/${ userId }`);
		const userDoc = await getDoc(userDocRef);
		if (userDoc.exists())
		{
			const userData = userDoc.data();
			return userData[property]; // Return the specific property
		} else
		{
			console.log("No such document!");
			return null;
		}
	}

	public updateUser(userId: string, data: any): Promise<any>
	{
		return updateDoc(doc(this.firestore, `users/${ userId }`), data);
	}
}