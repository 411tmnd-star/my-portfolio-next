import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

/** jsdom has no matchMedia, ResizeObserver or IntersectionObserver. Desktop, full motion by default. */
export function setMedia(matching: string[] = ["(min-width: 900px)"]) {
  window.matchMedia = (query: string) =>
    ({ matches: matching.includes(query), media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}
setMedia();

class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("ResizeObserver", Observer);
vi.stubGlobal("IntersectionObserver", Observer);
// jsdom prints "not implemented" for canvas contexts; no context is also what a browser without WebGL2 returns.
HTMLCanvasElement.prototype.getContext = (() => null) as never;
