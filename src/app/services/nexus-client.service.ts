import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GenerateRequest, GenerateResponse } from '../data/api.models';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NexusClientService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/v1/flowminds/generate`;

    async generateDiagram(prompt: string): Promise<GenerateResponse> {
        const payload: GenerateRequest = { prompt };
        return firstValueFrom(
            this.http.post<GenerateResponse>(this.API_URL, payload)
        );
    }
}
