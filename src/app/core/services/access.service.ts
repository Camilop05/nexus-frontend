import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../config/api.config';
import type {
  AccessLog,
  AccessZone,
  CreateZoneRequest,
  EnterZoneResponse,
  UpdateZoneRequest,
} from '../models/access.models';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private readonly http = inject(HttpClient);

  // GET /api/v1/access-zones
  findZones() {
    return this.http.get<AccessZone[]>(`${API_URL}/access-zones`);
  }

  // POST /api/v1/access-zones (solo Comandante)
  createZone(dto: CreateZoneRequest) {
    return this.http.post<AccessZone>(`${API_URL}/access-zones`, dto);
  }

  // PATCH /api/v1/access-zones/:id (solo Comandante)
  updateZone(id: string, dto: UpdateZoneRequest) {
    return this.http.patch<AccessZone>(`${API_URL}/access-zones/${id}`, dto);
  }

  // PATCH /api/v1/access-zones/:id/deactivate (solo Comandante)
  deactivateZone(id: string) {
    return this.http.patch<AccessZone>(`${API_URL}/access-zones/${id}/deactivate`, {});
  }

  // POST /api/v1/access-zones/:id/enter — cualquier usuario autenticado.
  enterZone(id: string) {
    return this.http.post<EnterZoneResponse>(`${API_URL}/access-zones/${id}/enter`, {});
  }

  // GET /api/v1/access-logs — solo Comandante y Oficial de turno.
  findLogs() {
    return this.http.get<AccessLog[]>(`${API_URL}/access-logs`);
  }
}
