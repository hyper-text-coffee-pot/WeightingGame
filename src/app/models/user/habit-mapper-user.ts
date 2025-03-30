import { User } from "firebase/auth";
import { Habit } from "./habit";

export class HabitMapperUser
{
	constructor(authUser?: User)
	{
		if (authUser)
		{
			this.authUser = authUser;
		}
	}

	public authUser?: User;

	public isTutorialComplete: boolean = false;

	public habits: Habit[] = [];

	public previousHabitsList: string[] = [];

	public previousEmojisList: string[] = [];

	public previousEmotionsList: string[] = [];

	public previousTriggersList: string[] = [];

	public previousContextsList: string[] = [];

	public MapFromFirestoreData(data: any): void
	{
		this.isTutorialComplete = data.isTutorialComplete;
		this.habits = data.habits;
		this.previousHabitsList = data.previousHabitsList;
		this.previousEmojisList = data.previousEmojisList;
		this.previousEmotionsList = data.previousEmotionsList;
		this.previousTriggersList = data.previousTriggersList;
		this.previousContextsList = data.previousContextsList;
	}
}
