/**
 * index.js
 * ---------------------------------------------------------------------------
 * Public entry point for the hp-common-modal package.
 *
 * Typical usage:
 *   import HpCommonModal from 'path/to/hp-common-modal';
 *   // or, for advanced composition:
 *   import { HpCommonModal, ModalHeader, ModalBody, ModalFooter } from 'path/to/hp-common-modal';
 * ---------------------------------------------------------------------------
 */

export { default as HpCommonModal } from './HpCommonModal';
export { default } from './HpCommonModal';

export { default as ModalHeader } from './ModalHeader';
export { default as ModalBody } from './ModalBody';
export { default as ModalFooter } from './ModalFooter';
export { default as ModalPortal } from './ModalPortal';

export { useModal } from './useModal';
export { useModalContext, ModalContext } from './modalContext';

export * from './modal.constants';
export * from './modalUtils';