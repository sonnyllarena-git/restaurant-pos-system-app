import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../modals/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';

export default function LogoutModal({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <ConfirmDialog
      title="Confirm Logout"
      message="Are you sure you want to log out of the POS system?"
      confirmLabel="LOGOUT"
      danger
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
