import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';

export const UnauthorizedRedirectGuard: CanActivateFn = (route, state) =>
{
	const router = inject(Router);
	const userStorageService = inject(UserStorageService);
	const user = userStorageService.getUser();
	if (user)
	{
		return true;
	}
	else
	{
		router.navigate(['/']); // Redirect to /login
		return false;
	}
};