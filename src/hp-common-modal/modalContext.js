/**
 * modalContext.js
 * ---------------------------------------------------------------------------
 * Shares modal-wide state (loading, disabled flags, ids, handlers) with the
 * Header/Body/Footer sub-components without prop-drilling through every
 * layer. HpCommonModal is the only component that provides this context;
 * ModalHeader/ModalBody/ModalFooter consume it.
 * ---------------------------------------------------------------------------
 */

import { createContext, useContext } from 'react';

export const ModalContext = createContext(null);

/**
 * Convenience hook for internal sub-components. Throws a clear error if used
 * outside of <HpCommonModal>, which is much easier to debug than a silent
 * `undefined` destructure failure.
 */
export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error(
      'ModalHeader/ModalBody/ModalFooter must be rendered inside <HpCommonModal>.'
    );
  }
  return ctx;
}