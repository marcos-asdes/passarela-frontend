import '@testing-library/jest-dom/vitest'

/** jsdom não implementa matchMedia — antd usa pra breakpoints responsivos (Grid, Table, etc). */
globalThis.matchMedia ||= function matchMedia(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  } as MediaQueryList
}

/** jsdom não implementa ResizeObserver — antd usa em Picker/Table/etc pra medir o container. */
class ResizeObserverStub {
  observe(): void {
    /* stub */
  }

  unobserve(): void {
    /* stub */
  }

  disconnect(): void {
    /* stub */
  }
}
globalThis.ResizeObserver ||= ResizeObserverStub
