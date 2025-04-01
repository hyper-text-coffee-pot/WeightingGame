import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, updateDoc, arrayUnion, getDoc, addDoc, collection, getDocs } from '@angular/fire/firestore';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';
import { WeightRecord } from '../models/user/weight-record';
import { WeightingGameUser } from '../models/user/weighting-game-user';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService {
	constructor(private firestore: Firestore) { }

	public addWeightRecord(userId: string, data: WeightRecord): Promise<any> {
		const weightRecordData = data.toPlainObject();
		const weightRecordsCollectionRef = collection(this.firestore, `users/${userId}/weightRecords`);
		return addDoc(weightRecordsCollectionRef, weightRecordData);
	}

	public async getAllWeightRecords(userId: string): Promise<WeightRecord[]> {
		try {
			const weightRecordsCollectionRef = collection(this.firestore, `users/${userId}/weightRecords`);
			const querySnapshot = await getDocs(weightRecordsCollectionRef);
			const weightRecords: WeightRecord[] = querySnapshot.docs.map(doc => {
				const data = doc.data();
				return new WeightRecord(data['weightLbsOz']); // Adjust based on your WeightRecord constructor
			});
			console.log(weightRecords);
			return weightRecords;
		} catch (error) {
			console.error('Error fetching weight records:', error);
			throw error;
		}
	}

	/**
	 * Sign a user up or log them in.
	 * Creates a new user document in all the necessary collections.
	 */
	public addUser(weightingGameUser: WeightingGameUser): Promise<any> {
		let userId = weightingGameUser.authUser?.uid.trim();
		let userDisplayName = weightingGameUser.authUser?.displayName?.trim();
		let userEmail = weightingGameUser.authUser?.email?.trim();
		// Use merge: true to avoid overwriting, make sure you just send an empty object.
		return setDoc(doc(this.firestore, `users/${userId}`), {
			displayName: userDisplayName,
			emailAddress: userEmail
		}, { merge: true });
	}

	public async getUserFromFirestore(userId: string | undefined): Promise<IWeightingGameUser | null> {
		if (!userId) {
			return null;
		}

		const userDocRef = doc(this.firestore, `users/${userId}`);
		const userDoc = await getDoc(userDocRef);
		if (userDoc.exists()) {
			return userDoc.data() as IWeightingGameUser;
		}
		else {
			console.log("No such document!");
			return null;
		}
	}

	public async getUserProperty(userId: string, property: string): Promise<any> {
		const userDocRef = doc(this.firestore, `users/${userId}`);
		const userDoc = await getDoc(userDocRef);
		if (userDoc.exists()) {
			const userData = userDoc.data();
			return userData[property]; // Return the specific property
		} else {
			console.log("No such document!");
			return null;
		}
	}

	public updateUser(userId: string, data: any): Promise<any> {
		return updateDoc(doc(this.firestore, `users/${userId}`), data);
	}

	// Add a new document to a collection
	// public addWeightRecord(userId: string, data: WeightRecord): Promise<any>
	// {
	// 	const weightRecordData = data.toPlainObject();
	// 	return updateDoc(doc(this.firestore, `users/${ userId }`),
	// 		{
	// 			weightRecords: arrayUnion(weightRecordData)
	// 		});
	// }
}