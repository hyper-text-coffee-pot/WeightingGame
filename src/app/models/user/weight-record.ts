import { v4 as uuidv4 } from 'uuid';

export class WeightRecord {
	public id: string = '';
	public weightLbsOz: number = 0.0;
	public timestamp: string = '';
	public dateOnly: string = '';

	constructor(newWeightLbsOz: number) {
		this.id = uuidv4();
		this.weightLbsOz = newWeightLbsOz;
		this.timestamp = new Date().toISOString();
		this.dateOnly = this.extractDateOnly(this.timestamp);
	}

	/**
	 * Objects need to be converted to plain objects before being sent to Firestore.
	 */
	public toPlainObject(): any {
		return {
			id: this.id,
			weightLbsOz: this.weightLbsOz,
			timestamp: this.timestamp,
			dateOnly: this.dateOnly,
		};
	}

	/**
	 * Extracts the date-only portion (YYYY-MM-DD) from an ISO timestamp.
	 */
	private extractDateOnly(isoTimestamp: string): string {
		return isoTimestamp.split('T')[0];
	}
}
