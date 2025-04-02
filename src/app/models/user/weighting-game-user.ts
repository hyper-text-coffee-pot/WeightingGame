import { Timestamp } from "@angular/fire/firestore";
import { User } from "firebase/auth";
import { IWeightingGameUser } from "src/app/abstractions/i-weighting-game-user";

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

	public signupTimestamp: Timestamp | undefined = undefined;

	public MapFromFirestoreData(data: IWeightingGameUser): void
	{
		this.isTutorialComplete = data.isTutorialComplete;
		this.displayName = data.displayName;
		this.emailAddress = data.emailAddress;
		this.signupTimestamp = data.signupTimestamp;
	}
}
