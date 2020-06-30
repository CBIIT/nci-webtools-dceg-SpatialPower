import { useEffect } from 'react';

export function useResetScroll() {
  useEffect(_ => window.scrollTo(0, 0), arguments);
}