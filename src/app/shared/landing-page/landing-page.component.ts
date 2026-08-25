import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {

  sliderValue = 55;

  private observer?: IntersectionObserver;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.setupScrollReveal();
    this.setupNavbar();
    this.setupSmoothScrolling();
  }

  onSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.sliderValue = Number(input.value);
  }

  private setupScrollReveal(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll(
      '.section-header, .tool-card, .feature-item, .dashboard-card, .step, .cta-content'
    );

    if (!elements.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'reveal-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((element: Element) => {
      this.renderer.addClass(element, 'reveal');
      this.observer?.observe(element);
    });
  }

  private setupNavbar(): void {
    const navbar = this.elementRef.nativeElement.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      if (window.scrollY > 30) {
        this.renderer.addClass(navbar, 'navbar-scrolled');
      } else {
        this.renderer.removeClass(navbar, 'navbar-scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    (this as any)._scrollHandler = onScroll;
  }

  private setupSmoothScrolling(): void {
    const links = this.elementRef.nativeElement.querySelectorAll('a[href^="#"]');

    links.forEach((link: HTMLAnchorElement) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    const handler = (this as any)._scrollHandler;
    if (handler) window.removeEventListener('scroll', handler);
  }
}