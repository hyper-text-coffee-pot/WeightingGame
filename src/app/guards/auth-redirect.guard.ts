import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';

export const AuthRedirectGuard: CanActivateFn = (route, state) =>
{
	const router = inject(Router);
	const userStorageService = inject(UserStorageService);
	const user = userStorageService.getUser();
	if (user)
	{
		router.navigate(['/tabs']); // Redirect to /tabs
		return false;
	}
	else
	{
		return true;
	}
};
