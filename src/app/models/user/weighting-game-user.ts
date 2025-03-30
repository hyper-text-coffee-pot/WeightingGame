import { User } from "firebase/auth";
import { WeightRecord } from "./weight-record";

export class WeightingGameUser
{
	constructor(authUser?: User)
	{
		if (authUser)
		{
			this.authUser = authUser;
		}
	}

	public authUser?: User;

	public displayName: string = '';

	public emailAddress: string = '';

	public isTutorialComplete: boolean = false;

	public weightRecords: WeightRecord[] = [];

	public MapFromFirestoreData(data: any): void
	{
		this.isTutorialComplete = data.isTutorialComplete;
		this.weightRecords = data.weightRecords;
	}
}
