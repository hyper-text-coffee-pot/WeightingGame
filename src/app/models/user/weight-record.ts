import { v4 as uuidv4 } from 'uuid';

export class WeightRecord
{
	public id: string = '';
	public weightLbsOz: number = 0.0;
	public timestamp: string = '';

	constructor(newWeightLbsOz?: number)
	{
		if (newWeightLbsOz != undefined && newWeightLbsOz != null)
		{
			this.id = uuidv4();
			this.weightLbsOz = newWeightLbsOz;
			this.timestamp = new Date().toISOString();
		}
	}

	public mapFirestoreData(data: any): void
	{
		this.id = data.id || this.id;
		this.weightLbsOz = data.weightLbsOz || this.weightLbsOz;
		this.timestamp = data.timestamp || this.timestamp;
	}

	/**
	 * Objects need to be converted to plain objects before being sent to Firestore.
	 */
	public toPlainObject(): any
	{
		return {
			id: this.id,
			weightLbsOz: this.weightLbsOz,
			timestamp: this.timestamp
		};
	}

	/**
	 * Extracts the date-only portion (YYYY-MM-DD) from an ISO timestamp.
	 */
	private extractDateOnly(isoTimestamp: string): string
	{
		return isoTimestamp.split('T')[0];
	}
}
