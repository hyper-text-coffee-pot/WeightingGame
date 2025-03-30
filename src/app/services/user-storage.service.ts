import { Injectable } from '@angular/core';
import { HabitMapperUser } from '../models/user/habit-mapper-user';

@Injectable({
	providedIn: 'root'
})
export class UserStorageService
{
	private userStorageSchema: string = "__hmap_user_storage__";

	constructor() { }

	public getUser(): HabitMapperUser | null
	{
		return this.getItem(this.userStorageSchema);
	}

	public setUser(user: HabitMapperUser): void
	{
		this.setItem(this.userStorageSchema, user);
	}

	private getItem(key: string): any
	{
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : null;
	}

	private setItem(key: string, value: any): void
	{
		localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
	}

	public clearUser(): void
	{
		localStorage.removeItem(this.userStorageSchema);
	}
}
