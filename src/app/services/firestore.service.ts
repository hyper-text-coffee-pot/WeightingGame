import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc, updateDoc, arrayUnion, getDoc, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { IWeightingGameUser } from '../abstractions/i-weighting-game-user';
import { WeightRecord } from '../models/user/weight-record';
import { WeightingGameUser } from '../models/user/weighting-game-user';

@Injectable({
	providedIn: 'root'
})
export class FirestoreService
{
	constructor(private firestore: Firestore) { }

	public async addOrUpdateWeightRecord(userId: string, data: WeightRecord): Promise<any>
	{
		if (!userId)
		{
			throw new Error('User ID is required');
		}

		const weightRecordsCollectionRef = collection(this.firestore, `users/${ userId }/weightRecords`);

		// Extract the "date-only" part of the new record's timestamp in YYYY-MM-DD format
		const newRecordDate = data.timestamp.split('T')[0]; // Extract date-only part from ISO string

		// Query for existing records with the same "date-only" value
		const startOfDay = new Date(`${ newRecordDate }T00:00:00.000Z`);
		const endOfDay = new Date(`${ newRecordDate }T23:59:59.999Z`);

		const q = query(
			weightRecordsCollectionRef,
			where('timestamp', '>=', startOfDay.toISOString()),
			where('timestamp', '<=', endOfDay.toISOString())
		);
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty)
		{
			// A record with the same date already exists, update it
			const existingDoc = querySnapshot.docs[0]; // Assuming only one record per day
			const docRef = doc(this.firestore, `users/${ userId }/weightRecords/${ existingDoc.id }`);
			console.log('Updating existing record:', existingDoc.id);
			return setDoc(docRef, data.toPlainObject(), { merge: true });
		}

		// Add the new record if no duplicate exists
		console.log('Adding new record');
		return addDoc(weightRecordsCollectionRef, data.toPlainObject());
	}

	public async getAllWeightRecords(userId: string | undefined): Promise<WeightRecord[]>
	{
		if (!userId)
		{
			return [];
		}

		try
		{
			const weightRecordsCollectionRef = collection(this.firestore, `users/${ userId }/weightRecords`);
			const querySnapshot = await getDocs(weightRecordsCollectionRef);
			const weightRecords: WeightRecord[] = querySnapshot.docs.map(doc =>
			{
				const data = doc.data();
				const weightRecord = new WeightRecord();
				weightRecord.mapFirestoreData(data);
				return weightRecord; // Adjust based on your WeightRecord constructor
			});

			return weightRecords;
		}
		catch (error)
		{
			console.error('Error fetching weight records:', error);
			throw error;
		}
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

	public updateUser(userId: string, data: any): Promise<any>
	{
		return updateDoc(doc(this.firestore, `users/${ userId }`), data);
	}

	/** Keep for later **/

	// public addWeightRecord(userId: string, data: WeightRecord): Promise<any>
	// {
	// 	const weightRecordData = data.toPlainObject();
	// 	const weightRecordsCollectionRef = collection(this.firestore, `users/${ userId }/weightRecords`);
	// 	return addDoc(weightRecordsCollectionRef, weightRecordData);
	// }

	// public async addWeightRecordIfNotExists(userId: string, data: WeightRecord): Promise<any>
	// {
	// 	if (!userId)
	// 	{
	// 		throw new Error('User ID is required');
	// 	}

	// 	const weightRecordsCollectionRef = collection(this.firestore, `users/${ userId }/weightRecords`);

	// 	// Extract the "date-only" part of the new record's timestamp
	// 	const newRecordDate = new Date(data.timestamp).toLocaleDateString('en-US');

	// 	// Query for existing records with the same "date-only" value
	// 	const q = query(weightRecordsCollectionRef, where('timestamp', '>=', new Date(newRecordDate).toISOString()), where('timestamp', '<', new Date(newRecordDate + 'T23:59:59.999Z').toISOString()));
	// 	const querySnapshot = await getDocs(q);

	// 	if (!querySnapshot.empty)
	// 	{
	// 		// A record with the same date already exists
	// 		console.log('A record for this date already exists. Skipping addition.');
	// 		return Promise.reject('Duplicate record for the same date');
	// 	}

	// 	// Add the new record if no duplicate exists
	// 	const weightRecordData = data.toPlainObject();
	// 	return addDoc(weightRecordsCollectionRef, weightRecordData);
	// }

	// public async getUserProperty(userId: string, property: string): Promise<any>
	// {
	// 	const userDocRef = doc(this.firestore, `users/${ userId }`);
	// 	const userDoc = await getDoc(userDocRef);
	// 	if (userDoc.exists())
	// 	{
	// 		const userData = userDoc.data();
	// 		return userData[property]; // Return the specific property
	// 	} else
	// 	{
	// 		console.log("No such document!");
	// 		return null;
	// 	}
	// }

	// Add a new document to a collection
	// public addWeightRecord(userId: string, data: WeightRecord): Promise<any>
	// {
	// 	const weightRecordData = data.toPlainObject();
	// 	return updateDoc(doc(this.firestore, `users/${ userId }`),
	// 		{
	// 			weightRecords: arrayUnion(weightRecordData)
	// 		});
	// }

	/** Keep for later **/
}