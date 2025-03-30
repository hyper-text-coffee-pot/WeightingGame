import { Component } from '@angular/core';
import { WeightRecord } from '../models/user/weight-record';
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
	selector: 'app-tab2',
	templateUrl: 'tab2.page.html',
	styleUrls: ['tab2.page.scss'],
	standalone: false,
})
export class Tab2Page
{
	constructor(
		private authService: AuthService,
		private firestoreService: FirestoreService
	)
	{
		this.loadHabits();
	}

	public weightRecords: WeightRecord[] = [];

	public lineChartType: ChartType = 'line';

	public lineChartData: ChartConfiguration['data'] = {
		datasets: [],
		labels: [],
	};

	public lineChartOptions: ChartConfiguration['options'] = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				position: 'top',
			},
		},
		scales: {
			x: {
				ticks: {
					autoSkip: true, // Automatically skip labels if they overlap
					maxRotation: 45, // Maximum rotation angle for labels
					minRotation: 45, // Minimum rotation angle for labels
				}
			}
		},
	};

	public lineChartLegend = false;

	public loadHabits(event?: any, daysToLoad: number = 7): void
	{
		const user = this.authService.getCurrentUser();
		if (user)
		{
			this.firestoreService.getUserFromFirestore(user.authUser?.uid)
				.then((user) =>
				{
					if (user)
					{
						// Filter weight records for the past 7 days
						const sevenDaysAgo = new Date();
						sevenDaysAgo.setDate(sevenDaysAgo.getDate() - daysToLoad);

						this.weightRecords = user.weightRecords.filter((record) =>
							new Date(record.timestamp) >= sevenDaysAgo
						);

						// Map weightRecords to chart data

						this.lineChartData = {
							datasets: [
								{
									data: Array.from({ length: daysToLoad }, (_, i) =>
									{
										const date = new Date();
										date.setDate(date.getDate() - ((daysToLoad - 1) - i)); // Generate dates for the last 7 days
										const formattedDate = date.toLocaleDateString('en-US'); // Format as short date

										// Find the weight record for this date
										const record = this.weightRecords.find(
											(record) =>
												new Date(record.timestamp).toLocaleDateString('en-US') === formattedDate
										);

										// Return the weight if a record exists, otherwise return null or 0
										return record ? record.currentWeight : null;
									}),
									label: 'Body Weight (lbs)',
									borderColor: 'rgba(75,192,192,1)',
									backgroundColor: 'rgba(75,192,192,0.2)',
									fill: true,
								},
							],
							labels: Array.from({ length: daysToLoad }, (_, i) =>
							{
								const date = new Date();
								date.setDate(date.getDate() - ((daysToLoad - 1) - i)); // Generate dates for the last 7 days
								return date.toLocaleDateString('en-US'); // Format as short date
							}),
						};
					}

					if (event)
					{
						(event.target as HTMLIonRefresherElement).complete();
					}
				});
		}
	}

	public onDaysToLoadChange(event: any): void
	{
		const daysToLoad = event.detail.value; // Get the selected value
		this.loadHabits(undefined, daysToLoad); // Call loadHabits with the selected value
	}
}
