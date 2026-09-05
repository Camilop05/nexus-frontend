
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
 
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, RouterModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
 
    <div class="nx-screen">
      <div class="nx-panel">
        <div class="nx-brand">
          <svg class="nx-hex" viewBox="0 0 40 40" fill="none">
            <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="none" stroke="#4cd4e8" stroke-width="2.5" />
            <circle cx="20" cy="20" r="5" fill="#4cd4e8" />
          </svg>
          <span class="nx-wordmark">NEXUS</span>
        </div>
 
        <h1 class="nx-heading">Solicitud de acceso</h1>
        <p class="nx-sub">Crea tus credenciales para unirte a la red.</p>
 
        <form (ngSubmit)="submit()" [formGroup]="form">
          <div class="nx-field">
            <label for="name">Nombre</label>
            <input id="name" type="text" formControlName="name" placeholder="Tu nombre" />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <small>El nombre debe tener mínimo 2 caracteres.</small>
            }
          </div>
 
          <div class="nx-field">
            <label for="email">Correo</label>
            <input id="email" type="email" formControlName="email" placeholder="nombre@nexus.io" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <small>Ingresa un correo válido.</small>
            }
          </div>
 
          <div class="nx-field">
            <label for="password">Contraseña</label>
            <div class="nx-password">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
              />
              <button type="button" class="nx-toggle" (click)="showPassword.set(!showPassword())">
                <i class="pi" [ngClass]="showPassword() ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <small>La contraseña debe tener mínimo 8 caracteres.</small>
            }
          </div>
 
          <button type="submit" class="nx-submit" [disabled]="loading()">
            {{ loading() ? 'Creando...' : 'Solicitar credenciales' }}
          </button>
        </form>
 
        <div class="nx-foot">¿Ya tienes acceso? <a routerLink="/auth/login">Inicia sesión</a></div>
      </div>
    </div>
 
    <style>
      .nx-screen {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(circle at 50% 0%, rgba(76, 212, 232, 0.07), transparent 55%),
          #060b14;
        color: #e8f1f5;
        font-family: 'Inter', system-ui, sans-serif;
      }
 
      .nx-panel {
        width: 100%;
        max-width: 22rem;
        padding: 2.5rem 2.25rem;
        position: relative;
        margin: 2rem;
      }
 
      .nx-panel::before,
      .nx-panel::after {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        border: 2px solid #4cd4e8;
      }
      .nx-panel::before { top: 0; left: 0; border-right: none; border-bottom: none; }
      .nx-panel::after { bottom: 0; right: 0; border-left: none; border-top: none; }
 
      .nx-brand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 2.25rem;
      }
 
      .nx-hex {
        width: 26px;
        height: 26px;
      }
 
      .nx-wordmark {
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.12em;
      }
 
      .nx-heading {
        font-size: 1.4rem;
        font-weight: 500;
        margin: 0 0 0.35rem;
      }
 
      .nx-sub {
        color: #5a7184;
        font-size: 0.88rem;
        margin: 0 0 2rem;
      }
 
      .nx-field {
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
      }
 
      .nx-field label {
        font-size: 0.78rem;
        color: #5a7184;
        margin-bottom: 0.4rem;
      }
 
      .nx-field input {
        width: 100%;
        background: #0d1b2a;
        border: 1px solid rgba(90, 113, 132, 0.4);
        border-radius: 2px;
        color: #e8f1f5;
        padding: 0.7rem 0.8rem;
        font-size: 0.95rem;
        font-family: inherit;
        outline: none;
      }
 
      .nx-field input:focus {
        border-color: #4cd4e8;
        box-shadow: 0 0 0 1px rgba(76, 212, 232, 0.25);
      }
 
      .nx-field small {
        color: #f2a65a;
        margin-top: 0.4rem;
        font-size: 0.78rem;
      }
 
      .nx-password {
        position: relative;
        display: flex;
      }
 
      .nx-password input {
        padding-right: 2.5rem;
      }
 
      .nx-toggle {
        position: absolute;
        right: 0.6rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #5a7184;
        cursor: pointer;
        padding: 0.2rem;
      }
 
      .nx-toggle:hover {
        color: #4cd4e8;
      }
 
      .nx-submit {
        width: 100%;
        background: #4cd4e8;
        color: #04141a;
        border: none;
        border-radius: 2px;
        padding: 0.8rem;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        margin-top: 0.4rem;
      }
 
      .nx-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
 
      .nx-foot {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.85rem;
        color: #5a7184;
      }
 
      .nx-foot a {
        color: #4cd4e8;
        text-decoration: none;
      }
    </style>
  `,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
 
  loading = signal(false);
  showPassword = signal(false);
 
  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
 
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.loading.set(true);
 
    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo crear la cuenta',
          detail: this.apiErrorService.getMessage(error),
        });
      },
    });
  }
}
 