import { v4 as uuidv4 } from 'uuid';

export class WeightRecord
{
	public id: string = '';
	public currentWeight: number = 0.00;
	public timestamp: string = '';

	constructor(currentWeight: number)
	{
		this.id = uuidv4();
		this.currentWeight = currentWeight;
		this.timestamp = new Date().toISOString();
	}

	/**
	 * Objects need to be converted to plain objects before being sent to Firestore.
	 */
	public toPlainObject(): any
	{
		return {
			id: this.id,
			currentWeight: this.currentWeight,
			timestamp: this.timestamp
		};
	}
}
