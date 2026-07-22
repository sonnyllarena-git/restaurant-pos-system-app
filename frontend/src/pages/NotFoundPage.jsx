import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">404</h1>
      <p className="text-sm text-slate-600 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/pos" className="text-orange-500 font-medium hover:text-orange-600">
        Back to POS
      </Link>
    </div>
  );
}
