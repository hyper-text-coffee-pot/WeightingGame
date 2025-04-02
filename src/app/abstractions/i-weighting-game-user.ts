import { Timestamp } from "@angular/fire/firestore";

export interface IWeightingGameUser
{
	isTutorialComplete: boolean;
	displayName: string;
	emailAddress: string;
	signupTimestamp: Timestamp | undefined;
}
