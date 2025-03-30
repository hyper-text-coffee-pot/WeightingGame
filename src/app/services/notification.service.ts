import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})
export class NotificationService
{
	constructor(
		private alertController: AlertController,
		private toastController: ToastController) { }

	public async presentAlert(header: string, message: string, color: 'red' | 'green'): Promise<void>
	{
		const alert = await this.alertController.create({
			header: header,
			message: message,
			buttons: ['OK'],
			cssClass: color === 'red' ? 'alert-red' : 'alert-green'
		});

		await alert.present();
	}

	public async presentToast(header: string, message: string, color: 'danger' | 'success', position: 'top' | 'bottom' | 'middle'): Promise<void>
	{
		const toast = await this.toastController.create({
			header: header,
			message: message,
			duration: 3000,
			color: color,
			position: position,
			buttons: [
				{
					text: 'OK',
					role: 'cancel'
				}
			]
		});

		await toast.present();
	}
}
