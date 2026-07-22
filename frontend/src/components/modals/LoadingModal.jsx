import React from 'react';
import Loader from '../common/Loader';

export default function LoadingModal({ label = 'Processing...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-slate-300 rounded px-10 py-8">
        <Loader label={label} />
      </div>
    </div>
  );
}
