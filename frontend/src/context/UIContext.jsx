import React, { createContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/modals/ConfirmDialog';

export const UIContext = createContext();

export function UIProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);
  const [modal, setModal] = useState(null);

  const confirm = useCallback(({ title, message, confirmLabel, danger, onConfirm }) => {
    setConfirmState({ title, message, confirmLabel, danger, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => setConfirmState(null), []);

  const openModal = useCallback((content) => setModal(content), []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleConfirm = () => {
    if (confirmState?.onConfirm) confirmState.onConfirm();
    closeConfirm();
  };

  return (
    <UIContext.Provider value={{ confirm, openModal, closeModal, modal }}>
      {children}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          danger={confirmState.danger}
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
        />
      )}
    </UIContext.Provider>
  );
}
