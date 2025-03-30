import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSignupPage } from './login-signup.page';

describe('LoginSignupPage', () => {
  let component: LoginSignupPage;
  let fixture: ComponentFixture<LoginSignupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
