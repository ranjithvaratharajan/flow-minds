import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { GenerateRequest, GenerateResponse, QuotaResponse } from '../data/api.models';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NexusClientService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/v1/flowminds/generate`;
    private readonly QUOTA_URL = `${environment.apiUrl}/v1/flowminds/quota`;

    // Cache the local count to enforce client-side immediately
    private currentRemaining = 0;

    getQuota(): Observable<QuotaResponse> {
        return this.http.get<QuotaResponse>(this.QUOTA_URL).pipe(
            tap(response => {
                this.currentRemaining = response.remaining;
            })
        );
    }

    async generateDiagram(prompt: string): Promise<GenerateResponse> {
        // 0. Client-side Guard
        if (this.currentRemaining <= 0) {
            throw new Error('Daily Limit Exceeded. Please try again tomorrow.');
        }

        const payload: GenerateRequest = { prompt };
        const response = await firstValueFrom(
            this.http.post<GenerateResponse>(this.API_URL, payload)
        );

        // Decrement local counter on success to show immediate update in UI
        if (response.success) {
            this.currentRemaining = Math.max(0, this.currentRemaining - 1);
        }

        return response;
    }
}
