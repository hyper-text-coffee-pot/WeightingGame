import { Habit } from "../models/user/habit";

export interface IHabitMapperUser
{
	isTutorialComplete: boolean;
	habits: Habit[];
	previousHabitsList: string[];
	previousEmojisList: string[];
	previousEmotionsList: string[];
	previousTriggersList: string[];
	previousContextsList: string[];
}
