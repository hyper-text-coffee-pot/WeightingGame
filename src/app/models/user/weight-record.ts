import { v4 as uuidv4 } from 'uuid';

export class WeightRecord
{
	public id: string = '';
	public weightLbsOz: number = 0.0;
	public timestamp: string = '';

	constructor(newWeightLbsOz: number)
	{
		this.id = uuidv4();
		this.weightLbsOz = newWeightLbsOz;
		this.timestamp = new Date().toISOString();
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
}
