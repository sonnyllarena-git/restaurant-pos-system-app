import React, { useState, useEffect } from 'react';
import { KDS_URGENT_MINUTES } from '../../utils/constants';

function getElapsedMinutes(createdAt) {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
}

export default function OrderTimer({ createdAt, children }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(() => getElapsedMinutes(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(getElapsedMinutes(createdAt));
    }, 10000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isUrgent = elapsedMinutes > KDS_URGENT_MINUTES;

  return children(elapsedMinutes, isUrgent);
}
