import { WeightRecord } from "../models/user/weight-record";

export interface IWeightingGameUser
{
	isTutorialComplete: boolean;
	weightRecords: WeightRecord[];
}
