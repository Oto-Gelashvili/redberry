import { Component, computed, input, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="name()" (error)="failed.set(true)" />
    } @else {
      <span class="fallback">{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--size);
      height: var(--size);
      border-radius: 50%;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eeedfc;
      color: #4f46e5;
      font-weight: 600;
      font-size: calc(var(--size) * 0.4);
      text-transform: uppercase;
    }
  `,
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  src = input<string | null | undefined>('');
  name = input<string>('');
  size = input<number>(32);

  // resets to false whenever the src changes
  protected failed = linkedSignal(() => {
    this.src();
    return false;
  });

  protected initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join(''),
  );
}
