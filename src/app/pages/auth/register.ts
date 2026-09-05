import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ButtonModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex min-h-screen items-center justify-center bg-surface-100 px-4">
      <div class="w-full max-w-md rounded-xl bg-surface-0 p-8 shadow">
        <div class="mb-6 text-center">
          <h1 class="text-3xl font-bold text-surface-900">Crea tu cuenta</h1>
          <p class="mt-2 text-surface-600">Crea tu cuenta en Nexus</p>
        </div>

        <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="mb-2 block font-medium" for="name">Nombre</label>
            <input id="name" pInputText class="w-full" formControlName="name" />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <small class="text-red-500">El nombre debe tener mínimo 2 caracteres.</small>
            }
          </div>

          <div>
            <label class="mb-2 block font-medium" for="email">Correo</label>
            <input id="email" pInputText class="w-full" formControlName="email" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <small class="text-red-500">Ingresa un correo válido.</small>
            }
          </div>

          <div>
            <label class="mb-2 block font-medium" for="password">Contraseña</label>
            <p-password
              inputId="password"
              styleClass="w-full"
              inputStyleClass="w-full"
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
            />
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <small class="text-red-500">La contraseña debe tener mínimo 8 caracteres.</small>
            }
          </div>

          <button
            pButton
            type="submit"
            label="Registrarme"
            icon="pi pi-user-plus"
            [loading]="loading"
          ></button>
        </form>

        <div class="mt-6 text-center">
          <a routerLink="/auth/login" class="text-primary">Ya tengo cuenta</a>
        </div>
      </div>
    </div>
  `,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  loading = false;

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

    this.loading = true;

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo crear la cuenta',
          detail: this.apiErrorService.getMessage(error),
        });
      },
    });
  }
}