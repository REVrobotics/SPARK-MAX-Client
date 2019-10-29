
export const findAncestorElement = (el: HTMLElement, predicate: (el: HTMLElement) => boolean) => {
  let nextEl: HTMLElement | null = el;

  while (nextEl && !predicate(nextEl)) {
    nextEl = nextEl.parentElement;
  }

  return nextEl ? nextEl : undefined;
};

export const isElementDescendantOf = (el: HTMLElement, potentialAncestor: HTMLElement): boolean => {
  return findAncestorElement(el, (ancestor) => ancestor === potentialAncestor) != null;
};
