import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfigService } from './services/config.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ServiceWorkerModule } from '@angular/service-worker';

// Supply the Firebase configuration to the Firebase module.
export function firebaseConfigFactory(configService: ConfigService)
{
	const config = configService.firebaseConfig;
	if (!config || Object.keys(config).length === 0)
	{
		throw new Error("Firebase config is missing!");
	}
	return config;
}

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		ReactiveFormsModule,
  ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: !isDevMode(),
    // Register the ServiceWorker as soon as the application is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000'
  })
	],
	providers: [
		{
			provide: RouteReuseStrategy,
			useClass: IonicRouteStrategy
		},
		ConfigService,
		provideFirebaseApp(() => initializeApp(firebaseConfigFactory(new ConfigService()))),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideAnalytics(() => getAnalytics()),
		provideCharts(withDefaultRegisterables())
	],
	bootstrap: [AppComponent],
})
export class AppModule { }

