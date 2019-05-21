import { ActivatableI, IConstructor } from './peLib';

export function activator<T extends ActivatableI>(type: IConstructor<T>): T {
  return new type();
}

/* --------------------------------------------------------------------------------- */
