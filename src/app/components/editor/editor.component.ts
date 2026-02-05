import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NexusClientService } from '../../services/nexus-client.service';
import { MermaidRendererComponent } from '../mermaid-renderer/mermaid-renderer.component';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MermaidRendererComponent, NgxSonnerToaster],
  template: `
    <ngx-sonner-toaster position="top-center" />
    
    <div class="h-screen flex flex-col md:flex-row bg-zinc-950 text-white overflow-hidden">
        <!-- Helper text / Header (Mobile only) -->
        <div class="md:hidden p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <h1 class="text-cyan-400 font-display font-bold text-lg">FlowMinds</h1>
             <span class="text-xs text-zinc-500">v1.0 (Nexus Client)</span>
        </div>

      <!-- Left Panel: Input -->
      <div class="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-sm z-10 transition-all duration-300">
        
        <!-- Header (Desktop) -->
        <div class="hidden md:flex p-6 border-b border-zinc-900 justify-between items-baseline">
           <h1 class="text-cyan-400 font-display font-bold text-xl tracking-wider">FlowMinds</h1>
           <span class="text-xs text-zinc-600 font-mono">NET-ARCH: ACTIVE</span>
        </div>

        <!-- Input Area -->
        <div class="flex-1 p-4 md:p-6 flex flex-col gap-4">
          <label class="text-sm font-mono text-zinc-400 uppercase tracking-widest">
            > Neural Link Input
          </label>
          <textarea
            [(ngModel)]="userPrompt"
            [disabled]="isLoading()"
            class="flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded p-4 font-mono text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none placeholder:text-zinc-700"
            placeholder="Describe your system architecture or logic flow..."
            (keydown.control.enter)="generate()"
          ></textarea>

          <div class="flex justify-between items-center text-xs text-zinc-600 font-mono">
             <span>CTRL+ENTER to execute</span>
             <span>{{ userPrompt().length }} chars</span>
          </div>
          
          <button
            (click)="generate()"
            [disabled]="isLoading() || !userPrompt().trim()"
            class="group relative w-full py-4 bg-cyan-950/30 border border-cyan-900/50 hover:border-cyan-400/50 hover:bg-cyan-900/20 text-cyan-400 font-mono text-sm uppercase tracking-widest transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="relative z-10 flex items-center justify-center gap-2">
                @if (isLoading()) {
                    <span class="animate-pulse">> UPLOADING TO NEXUS...</span>
                } @else {
                    <span>> EXECUTE PROTOCOL</span>
                }
            </span>
             <!-- Cyberpunk glitch effect on hover could go here -->
             <div class="absolute inset-0 bg-cyan-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>

      <!-- Right Panel: Canvas -->
      <div class="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 p-4 md:p-8 overflow-hidden">
        <!-- Grid/Decorative Background -->
        <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style="background-image: linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 w-full h-full flex flex-col">
             <!-- Status output -->
             <div class="h-8 mb-2 font-mono text-xs text-zinc-500 flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" [class.bg-green-500]="!isLoading() && diagramCode()" [class.bg-yellow-500]="isLoading()" [class.bg-zinc-800]="!isLoading() && !diagramCode()"></div>
                @if (isLoading()) {
                    <span class="animate-pulse">PROCESSING DATA STREAM...</span>
                } @else if (diagramCode()) {
                    <span class="text-green-500/80">RENDER COMPLETE. 200 OK.</span>
                } @else {
                    <span>AWAITING INPUT...</span>
                }
             </div>

            <app-mermaid-renderer [code]="diagramCode()" [error]="error()" class="flex-1 shadow-2xl shadow-black/50 border border-zinc-800 rounded-lg backdrop-blur-sm bg-zinc-950/30" />
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EditorComponent {
  private nexus = inject(NexusClientService);

  userPrompt = signal('');
  diagramCode = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  async generate() {
    if (!this.userPrompt().trim() || this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.nexus.generateDiagram(this.userPrompt());
      if (response.success) {
        this.diagramCode.set(response.data.mermaid);
        toast.success('Diagram generated successfully');
      }
    } catch (e: any) {
      console.error(e);

      // Extract meaningful error message
      let errorMessage = 'Connection to Nexus failed.';
      if (e.error && e.error.error) {
        errorMessage = e.error.error; // Backend validation/logic error
      } else if (e.message) {
        errorMessage = e.message; // Network/Generic error
      }

      this.error.set(errorMessage);
      this.diagramCode.set(''); // Clear any stale diagram

      toast.error('Nexus Gateway Error', {
        description: errorMessage
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
