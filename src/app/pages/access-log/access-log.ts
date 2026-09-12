import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AccessService } from '../../core/services/access.service';
import { AuthService } from '../../core/services/auth.service';
import type { AccessLog } from '../../core/models/access.models';
import { ROLE_LABELS } from '../../core/models/user.models';
import type { UserRole } from '../../core/models/user.models';

@Component({
  selector: 'app-access-log-page',
  standalone: true,
  imports: [DatePipe, TableModule, TagModule],
  template: `
    <div class="card">
      <span class="nexus-eyebrow">REGISTRO DE SEGURIDAD</span>
      <h2 class="m-0 mb-4 text-2xl font-semibold">Bitácora de acceso</h2>

      @if (checkingRole()) {
        <p class="text-surface-500">Verificando credenciales...</p>
      } @else if (!canView()) {
        <div class="flex flex-col items-start gap-2">
          <p-tag value="Acceso restringido" severity="danger" />
          <p class="text-surface-500">
            Solo Comandantes y Oficiales de turno pueden consultar la bitácora de la estación.
          </p>
        </div>
      } @else {
        <p-table [value]="logs()" [loading]="loading()" [paginator]="true" [rows]="10" responsiveLayout="scroll">
          <ng-template #header>
            <tr>
              <th>Fecha</th>
              <th>Tripulante</th>
              <th>Zona</th>
              <th>Resultado</th>
            </tr>
          </ng-template>

          <ng-template #body let-log>
            <tr>
              <td>{{ log.attemptedAt | date: 'short' }}</td>
              <td>{{ log.user?.firstName }} {{ log.user?.lastName }} ({{ log.user ? getRoleLabel(log.user.role) : '—' }})</td>
              <td>{{ log.zone?.name }}</td>
              <td>
                <p-tag
                  [value]="log.granted ? 'Otorgado' : 'Denegado'"
                  [severity]="log.granted ? 'success' : 'danger'"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>

    <style>
      .nexus-eyebrow {
        letter-spacing: 0.15em;
        font-size: 0.7rem;
        color: var(--primary-color);
      }
    </style>
  `,
})
export class AccessLogPage implements OnInit {
  private readonly accessService = inject(AccessService);
  private readonly authService = inject(AuthService);

  logs = signal<AccessLog[]>([]);
  loading = signal(false);
  checkingRole = signal(true);
  currentRole = signal<UserRole | null>(null);
  canView = computed(() => this.currentRole() === 'ADMIN' || this.currentRole() === 'SUPERVISOR');

  roleLabels = ROLE_LABELS;

  getRoleLabel(role: unknown): string {
    return typeof role === 'string' && role in this.roleLabels
      ? this.roleLabels[role as UserRole]
      : '—';
  }

  ngOnInit() {
    this.authService.me().subscribe({
      next: (user) => {
        this.currentRole.set(user.role);
        this.checkingRole.set(false);

        if (this.canView()) {
          this.loadLogs();
        }
      },
      error: () => this.checkingRole.set(false),
    });
  }

  loadLogs() {
    this.loading.set(true);

    this.accessService.findLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
