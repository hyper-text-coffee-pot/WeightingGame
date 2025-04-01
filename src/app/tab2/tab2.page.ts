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
			tooltip: {
				callbacks: {
					label: (context) =>
					{
						const index = context.dataIndex;
						const weight = context.raw; // The weight value
						const record = this.weightRecords[index]; // Get the corresponding weight record
						if (record)
						{
							const timestamp = new Date(record.timestamp).toLocaleString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							});
							return `Weight: ${ weight } lbs\nTimestamp: ${ timestamp }`;
						}
						return `Weight: ${ weight } lbs`;
					},
				},
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
			this.firestoreService.getAllWeightRecords(user.authUser?.uid)
				.then((weightRecords: WeightRecord[]) =>
				{
					if (weightRecords.length > 0)
					{
						// Filter weight records for the past 7 days
						const sevenDaysAgo = new Date();
						sevenDaysAgo.setDate(sevenDaysAgo.getDate() - daysToLoad);

						this.weightRecords = weightRecords.filter((record) =>
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
											(record) => new Date(record.timestamp).toLocaleDateString('en-US') === formattedDate
										);

										// Return the weight if a record exists, otherwise return null or 0
										return record ? record.weightLbsOz : null;
									}),
									label: 'Weight (lbs)',
									borderColor: 'rgba(75,192,192,1)',
									backgroundColor: 'rgba(75,192,192,0.2)',
									fill: true
								},
							],
							labels: Array.from({ length: daysToLoad }, (_, i) =>
							{
								const date = new Date();
								date.setDate(date.getDate() - ((daysToLoad - 1) - i)); // Generate dates for the last 7 days
								if (date.getFullYear() === new Date().getFullYear())
								{
									// Format as "Month Day"
									return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
								}
								else
								{
									// Format as "Month Day, Year"
									return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
								}
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
