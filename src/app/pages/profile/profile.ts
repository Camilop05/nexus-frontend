import { Component, OnInit, inject, signal } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';
import type { AuthenticatedUser } from '../../core/models/auth.models';
import { DOCUMENT_TYPE_LABELS } from '../../core/models/auth.models';
import { ROLE_LABELS } from '../../core/models/user.models';
import type { UserRole } from '../../core/models/user.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [TagModule],
  template: `
    <div class="card flex flex-col gap-4" style="max-width: 34rem">
      <h2 class="m-0 text-2xl font-semibold">Mi perfil</h2>

      @if (user()) {
        <div class="flex flex-col gap-3">
          <div>
            <span class="block text-surface-500 text-sm">Nombre completo</span>
            <span class="font-medium">{{ user()!.firstName }} {{ user()!.lastName }}</span>
          </div>

          <div>
            <span class="block text-surface-500 text-sm">Correo</span>
            <span class="font-medium">{{ user()!.email }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <span class="block text-surface-500 text-sm">Celular</span>
              <span class="font-medium">{{ user()!.phone }}</span>
            </div>

            <div>
              <span class="block text-surface-500 text-sm">Sector de origen</span>
              <span class="font-medium">{{ user()!.nationality }}</span>
            </div>
          </div>

          <div>
            <span class="block text-surface-500 text-sm">Documento</span>
            <span class="font-medium">
              {{ documentTypeLabels[user()!.documentType] }} · {{ user()!.documentNumber }}
            </span>
          </div>

          <div>
            <span class="block text-surface-500 text-sm">Rango</span>
            <p-tag [value]="roleLabels[user()!.role]" severity="info" />
          </div>

          <div>
            <span class="block text-surface-500 text-sm">Identificador</span>
            <span class="font-mono text-sm">{{ user()!.id }}</span>
          </div>
        </div>
      } @else {
        <p class="text-surface-500">Cargando información del perfil...</p>
      }
    </div>
  `,
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);

  user = signal<AuthenticatedUser | null>(null);
  documentTypeLabels = DOCUMENT_TYPE_LABELS;
  roleLabels = ROLE_LABELS as Record<UserRole, string>;

  ngOnInit() {
    this.authService.me().subscribe({
      next: (user) => this.user.set(user),
    });
  }
}
