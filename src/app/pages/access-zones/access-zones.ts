import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AccessService } from '../../core/services/access.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiErrorService } from '../../core/services/api-error.service';
import type { AccessZone, CreateZoneRequest, UpdateZoneRequest } from '../../core/models/access.models';
import { ROLE_LABELS } from '../../core/models/user.models';
import type { UserRole } from '../../core/models/user.models';

@Component({
  selector: 'app-access-zones-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
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
            <span class="nexus-eyebrow">CONTROL DE ACCESO</span>
            <h2 class="m-0 text-2xl font-semibold">Zonas de la estación</h2>
            <p class="m-0 text-surface-500">Cada zona exige un rango mínimo para entrar</p>
          </div>
        </ng-template>

        <ng-template #end>
          @if (isCommander()) {
            <button pButton label="Nueva zona" icon="pi pi-plus" (click)="openCreate()"></button>
          }
        </ng-template>
      </p-toolbar>

      @if (loading()) {
        <p class="text-surface-500">Escaneando sectores...</p>
      } @else {
        <div class="grid grid-cols-12 gap-6">
          @for (zone of zones(); track zone.id) {
            <div class="col-span-12 md:col-span-6 xl:col-span-4">
              <p-card>
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="m-0 text-lg font-semibold">{{ zone.name }}</h3>
                    <p class="m-0 text-surface-500 text-sm">{{ zone.description || 'Sin descripción' }}</p>
                  </div>
                  <p-tag [value]="zone.isActive ? 'Operativa' : 'Fuera de servicio'" [severity]="zone.isActive ? 'success' : 'danger'" />
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <span class="text-sm text-surface-500">
                    Rango mínimo: <strong>{{ roleLabels[zone.minRole] }}</strong>
                  </span>
                </div>

                <div class="mt-4 flex gap-2">
                  <button
                    pButton
                    label="Entrar"
                    icon="pi pi-sign-in"
                    size="small"
                    [loading]="entering() === zone.id"
                    (click)="enter(zone)"
                  ></button>

                  @if (isCommander()) {
                    <button
                      pButton
                      icon="pi pi-pencil"
                      severity="secondary"
                      size="small"
                      text
                      (click)="openEdit(zone)"
                    ></button>

                    <button
                      pButton
                      icon="pi pi-ban"
                      severity="danger"
                      size="small"
                      text
                      [disabled]="!zone.isActive"
                      (click)="deactivate(zone)"
                    ></button>
                  }
                </div>
              </p-card>
            </div>
          }
        </div>
      }
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [style]="{ width: '28rem' }"
      [header]="editingZoneId ? 'Editar zona' : 'Nueva zona'"
    >
      <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="save()">
        <div>
          <label class="mb-2 block font-medium" for="name">Nombre</label>
          <input id="name" pInputText class="w-full" formControlName="name" />
        </div>

        <div>
          <label class="mb-2 block font-medium" for="description">Descripción</label>
          <input id="description" pInputText class="w-full" formControlName="description" />
        </div>

        <div>
          <label class="mb-2 block font-medium" for="minRole">Rango mínimo requerido</label>
          <p-select
            inputId="minRole"
            styleClass="w-full"
            formControlName="minRole"
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
          <button pButton type="submit" label="Guardar" [loading]="saving()"></button>
        </div>
      </form>
    </p-dialog>

    <style>
      .nexus-eyebrow {
        letter-spacing: 0.15em;
        font-size: 0.7rem;
        color: var(--primary-color);
      }
    </style>
  `,
})
export class AccessZonesPage implements OnInit {
  private readonly accessService = inject(AccessService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly apiErrorService = inject(ApiErrorService);

  zones = signal<AccessZone[]>([]);
  loading = signal(false);
  entering = signal<string | null>(null);
  saving = signal(false);
  dialogVisible = false;
  editingZoneId: string | null = null;

  currentRole = signal<UserRole | null>(null);
  isCommander = computed(() => this.currentRole() === 'ADMIN');

  roleLabels = ROLE_LABELS;
  roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
    value,
    label: ROLE_LABELS[value],
  }));

  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    minRole: ['USER' as UserRole, [Validators.required]],
  });

  ngOnInit() {
    this.authService.me().subscribe({
      next: (user) => this.currentRole.set(user.role),
    });
    this.loadZones();
  }

  loadZones() {
    this.loading.set(true);

    this.accessService.findZones().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.showError(error);
      },
    });
  }

  enter(zone: AccessZone) {
    this.entering.set(zone.id);

    this.accessService.enterZone(zone.id).subscribe({
      next: (response) => {
        this.entering.set(null);
        this.messageService.add({
          severity: response.granted ? 'success' : 'warn',
          summary: response.granted ? 'Acceso otorgado' : 'Acceso denegado',
          detail: response.reason,
        });
      },
      error: (error) => {
        this.entering.set(null);
        this.showError(error);
      },
    });
  }

  openCreate() {
    this.editingZoneId = null;
    this.form.reset({ name: '', description: '', minRole: 'USER' });
    this.dialogVisible = true;
  }

  openEdit(zone: AccessZone) {
    this.editingZoneId = zone.id;
    this.form.reset({
      name: zone.name,
      description: zone.description ?? '',
      minRole: zone.minRole,
    });
    this.dialogVisible = true;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    if (this.editingZoneId) {
      const payload: UpdateZoneRequest = {
        name: value.name,
        description: value.description,
        minRole: value.minRole,
      };

      this.accessService.updateZone(this.editingZoneId, payload).subscribe({
        next: () => this.afterSave('Zona actualizada correctamente'),
        error: (error) => this.afterError(error),
      });

      return;
    }

    const payload: CreateZoneRequest = {
      name: value.name,
      description: value.description,
      minRole: value.minRole,
    };

    this.accessService.createZone(payload).subscribe({
      next: () => this.afterSave('Zona creada correctamente'),
      error: (error) => this.afterError(error),
    });
  }

  deactivate(zone: AccessZone) {
    this.accessService.deactivateZone(zone.id).subscribe({
      next: () => this.afterSave('Zona desactivada correctamente'),
      error: (error) => this.showError(error),
    });
  }

  private afterSave(message: string) {
    this.saving.set(false);
    this.dialogVisible = false;
    this.messageService.add({ severity: 'success', summary: 'Operación exitosa', detail: message });
    this.loadZones();
  }

  private afterError(error: unknown) {
    this.saving.set(false);
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
