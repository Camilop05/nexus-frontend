import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ApiErrorService } from '../../core/services/api-error.service';
import { UsersService } from '../../core/services/users.service';
import type { CreateUserRequest, DocumentType, UpdateUserRequest, User, UserRole } from '../../core/models/user.models';
import { DOCUMENT_TYPE_OPTIONS, ROLE_LABELS } from '../../core/models/user.models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    ToolbarModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="card">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <div>
            <h2 class="m-0 text-2xl font-semibold">Usuarios</h2>
            <p class="m-0 text-surface-500">Administración básica de usuarios</p>
          </div>
        </ng-template>

        <ng-template #end>
          <button pButton label="Nuevo" icon="pi pi-plus" (click)="openCreate()"></button>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="users()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowHover]="true"
        dataKey="id"
        responsiveLayout="scroll"
      >
        <ng-template #header>
          <tr>
            <th>Nombre completo</th>
            <th>Correo</th>
            <th>Celular</th>
            <th>Documento</th>
            <th>Sector de origen</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Creado</th>
            <th style="width: 12rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-user>
          <tr>
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ getDocumentLabel(user.documentType) }} {{ user.documentNumber }}</td>
            <td>{{ user.nationality }}</td>
            <td>
              <p-tag [value]="getRoleLabel(user.role)" severity="info" />
            </td>
            <td>
              <p-tag
                [value]="user.isActive ? 'Activo' : 'Inactivo'"
                [severity]="user.isActive ? 'success' : 'danger'"
              />
            </td>
            <td>{{ user.createdAt | date: 'short' }}</td>
            <td>
              <div class="flex gap-2">
                <button
                  pButton
                  icon="pi pi-pencil"
                  severity="secondary"
                  rounded
                  text
                  (click)="openEdit(user)"
                ></button>

                <button
                  pButton
                  icon="pi pi-ban"
                  severity="danger"
                  rounded
                  text
                  [disabled]="!user.isActive"
                  (click)="deactivate(user)"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [style]="{ width: '38rem' }"
      [header]="editingUserId ? 'Editar usuario' : 'Crear usuario'"
    >
      <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="save()">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block font-medium" for="firstName">Nombres</label>
            <input id="firstName" pInputText class="w-full" formControlName="firstName" />
          </div>

          <div>
            <label class="mb-2 block font-medium" for="lastName">Apellidos</label>
            <input id="lastName" pInputText class="w-full" formControlName="lastName" />
          </div>
        </div>

        <div>
          <label class="mb-2 block font-medium" for="email">Correo</label>
          <input id="email" pInputText class="w-full" formControlName="email" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block font-medium" for="phone">Celular</label>
            <input id="phone" pInputText class="w-full" formControlName="phone" />
          </div>

          <div>
            <label class="mb-2 block font-medium" for="nationality">Sector de origen</label>
            <input id="nationality" pInputText class="w-full" formControlName="nationality" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block font-medium" for="documentType">Tipo de documento</label>
            <p-select
              inputId="documentType"
              styleClass="w-full"
              formControlName="documentType"
              [options]="documentTypeOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div>
            <label class="mb-2 block font-medium" for="documentNumber">Número de documento</label>
            <input id="documentNumber" pInputText class="w-full" formControlName="documentNumber" />
          </div>
        </div>

        @if (!editingUserId) {
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
          </div>
        }

        <div>
          <label class="mb-2 block font-medium" for="role">Rol</label>
          <p-select
            inputId="role"
            styleClass="w-full"
            formControlName="role"
            [options]="roleOptions"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        <div class="flex justify-end gap-2">
          <button
            pButton
            type="button"
            label="Cancelar"
            severity="secondary"
            (click)="dialogVisible = false"
          ></button>
          <button pButton type="submit" label="Guardar" [loading]="saving"></button>
        </div>
      </form>
    </p-dialog>
  `,
})
export class UsersPage implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly apiErrorService = inject(ApiErrorService);

  users = signal<User[]>([]);
  loading = signal(false);
  dialogVisible = false;
  saving = false;
  editingUserId: string | null = null;

  roles: UserRole[] = ['ADMIN', 'USER', 'SUPERVISOR'];
  roleLabels = ROLE_LABELS;
  roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
    value,
    label: ROLE_LABELS[value],
  }));

  documentTypeOptions = DOCUMENT_TYPE_OPTIONS;

  getRoleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  getDocumentLabel(documentType: DocumentType): string {
    return this.documentTypeOptions.find((option) => option.value === documentType)?.label ?? documentType;
  }

  // Formulario compartido para crear y editar.
  form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    documentType: ['CC' as DocumentType, [Validators.required]],
    documentNumber: ['', [Validators.required, Validators.minLength(4)]],
    nationality: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.minLength(8)]],
    role: ['USER' as UserRole, [Validators.required]],
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    this.usersService.findMany().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.showError(error);
      },
    });
  }

  openCreate() {
    this.editingUserId = null;
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentType: 'CC',
      documentNumber: '',
      nationality: '',
      password: '',
      role: 'USER',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.dialogVisible = true;
  }

  openEdit(user: User) {
    this.editingUserId = user.id;
    this.form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      nationality: user.nationality,
      password: '',
      role: user.role,
    });
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.dialogVisible = true;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue();

    if (this.editingUserId) {
      const payload: UpdateUserRequest = {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        phone: value.phone,
        documentType: value.documentType,
        documentNumber: value.documentNumber,
        nationality: value.nationality,
        role: value.role,
      };

      this.usersService.update(this.editingUserId, payload).subscribe({
        next: () => this.afterSave('Usuario actualizado correctamente'),
        error: (error) => this.afterError(error),
      });

      return;
    }

    const payload: CreateUserRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone,
      documentType: value.documentType,
      documentNumber: value.documentNumber,
      nationality: value.nationality,
      password: value.password,
      role: value.role,
    };

    this.usersService.create(payload).subscribe({
      next: () => this.afterSave('Usuario creado correctamente'),
      error: (error) => this.afterError(error),
    });
  }

  deactivate(user: User) {
    this.usersService.deactivate(user.id).subscribe({
      next: () => this.afterSave('Usuario desactivado correctamente'),
      error: (error) => this.showError(error),
    });
  }

  private afterSave(message: string) {
    this.saving = false;
    this.dialogVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Operación exitosa',
      detail: message,
    });
    this.loadUsers();
  }

  private afterError(error: unknown) {
    this.saving = false;
    this.showError(error);
  }

  private showError(error: unknown) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: this.apiErrorService.getMessage(error),
    });
  }
}
