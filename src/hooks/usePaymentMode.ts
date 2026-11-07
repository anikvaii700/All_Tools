import { useState, useEffect } from 'react';
import { paymentModeService, PaymentMode } from '../services/paymentModeService';

export function usePaymentMode() {
  const [mode, setModeState] = useState<PaymentMode>(() => paymentModeService.getMode());

  useEffect(() => {
    return paymentModeService.subscribe((newMode) => {
      setModeState(newMode);
    });
  }, []);

  const setPaymentMode = async (newMode: PaymentMode) => {
    await paymentModeService.setMode(newMode);
  };

  return {
    mode,
    isPaymentEnabled: mode === 'ON',
    setPaymentMode,
  };
}
