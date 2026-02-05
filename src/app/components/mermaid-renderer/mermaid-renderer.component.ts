import { Component, ElementRef, effect, input, viewChild, Inject, PLATFORM_ID, signal, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import mermaid from 'mermaid';
import svgPanZoom from 'svg-pan-zoom';

@Component({
  selector: 'app-mermaid-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="w-full h-full bg-zinc-900/50 rounded-lg border border-zinc-800 relative overflow-hidden"
    >
      <!-- Canvas Container -->
      <div class="w-full h-full flex items-center justify-center overflow-hidden">
        <div #mermaidContainer class="mermaid w-full h-full flex items-center justify-center"></div>
      </div>

      <!-- Controls Overlay -->
      <div class="absolute bottom-4 right-4 flex flex-col gap-2 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button (click)="zoomIn()" class="p-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded shadow-lg border border-zinc-700 transition-colors cursor-pointer" title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button (click)="resetView()" class="p-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded shadow-lg border border-zinc-700 transition-colors transform active:scale-95 cursor-pointer" title="Fit to Screen">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>
        </button>
        <button (click)="zoomOut()" class="p-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded shadow-lg border border-zinc-700 transition-colors cursor-pointer" title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
      </div>
      
      <!-- Status / Debug -->
      @if (error() || renderError()) {
        <div class="absolute top-4 left-4 right-4 z-10 max-w-2xl mx-auto pointer-events-auto">
             <div class="p-4 border border-red-500/20 rounded bg-red-950/90 backdrop-blur text-sm font-mono flex flex-col gap-2 shadow-2xl">
                <strong class="text-red-400">Error:</strong>
                <div class="text-red-300 whitespace-pre-wrap">{{ error() || renderError() }}</div>
                @if (renderError()) {
                    <details class="text-xs text-zinc-500 cursor-pointer">
                        <summary>Debug Code</summary>
                        <pre class="mt-2 p-2 bg-black/50 rounded text-zinc-400 overflow-auto max-h-40">{{ debugCode() }}</pre>
                    </details>
                }
            </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    :host ::ng-deep svg {
      /* Ensure SVG takes full space so pan/zoom works within container */
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
    }
  `]
})
export class MermaidRendererComponent implements OnDestroy {
  code = input.required<string>();
  error = input<string | null>(null);
  mermaidContainer = viewChild<ElementRef>('mermaidContainer');
  renderError = signal<string | null>(null);
  debugCode = signal<string>('');

  private panZoomInstance: SvgPanZoom.Instance | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: "Inter, system-ui, sans-serif",
        flowchart: { useMaxWidth: false, htmlLabels: true },
        logLevel: 5
      });
    }

    effect(async () => {
      const element = this.mermaidContainer()?.nativeElement;
      let diagramCode = this.code();

      if (!element || !diagramCode || !isPlatformBrowser(this.platformId)) return;

      // Cleanup previous instance
      this.destroyPanZoom();
      this.renderError.set(null);
      this.debugCode.set(diagramCode);

      try {
        console.log('Rendering Mermaid Code:', diagramCode);

        // Client-side Sanitization
        const knownTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gbu', 'gitGraph', 'pie', 'mindmap', 'timeline', 'zenuml', 'sankey', 'xychart', 'block', 'packet', 'kanban', 'architecture'];
        let startIndex = -1;
        for (const type of knownTypes) {
          const match = diagramCode.match(new RegExp(`^\\s*${type}`, 'm'));
          if (match && match.index !== undefined) {
            startIndex = match.index;
            break;
          }
        }
        if (startIndex > 0) diagramCode = diagramCode.substring(startIndex);

        // Render
        element.innerHTML = '';
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, diagramCode);
        element.innerHTML = svg;

        // Initialize Pan/Zoom
        setTimeout(() => {
          const svgElement = element.querySelector('svg');
          if (svgElement) {
            this.initPanZoom(svgElement);
          }
        }, 0);

      } catch (err: any) {
        console.error('Mermaid render error:', err);
        this.renderError.set(err.message || 'Unknown Mermaid Syntax Error');
      }
    });
  }

  private initPanZoom(svgElement: SVGElement) {
    try {
      this.panZoomInstance = svgPanZoom(svgElement as any, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        minZoom: 0.1,
        maxZoom: 10,
        dblClickZoomEnabled: false // Often conflicts with other interactions
      });

      // Handle window resize
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.panZoomInstance) {
            this.panZoomInstance.resize();
            this.panZoomInstance.fit();
            this.panZoomInstance.center();
          }
        });
        this.resizeObserver.observe(svgElement.parentElement!);
      }

    } catch (e) {
      console.warn('Failed to initialize svg-pan-zoom', e);
    }
  }

  private destroyPanZoom() {
    if (this.panZoomInstance) {
      this.panZoomInstance.destroy();
      this.panZoomInstance = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  ngOnDestroy() {
    this.destroyPanZoom();
  }

  zoomIn() {
    this.panZoomInstance?.zoomIn();
  }

  zoomOut() {
    this.panZoomInstance?.zoomOut();
  }

  resetView() {
    if (this.panZoomInstance) {
      this.panZoomInstance.reset();
      this.panZoomInstance.fit();
      this.panZoomInstance.center();
    }
  }
}

