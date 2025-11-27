'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          Pago Rechazado ❌
        </h1>
        
        <p className="text-gray-600 mb-6">
          Lo sentimos, tu pago no pudo ser procesado. Esto puede deberse a fondos insuficientes, datos incorrectos o problemas temporales del banco.
        </p>
        
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>ID de Pago:</span>
                <span className="font-mono text-gray-800">#{paymentId}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Fecha:</span>
                <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Sugerencias:</strong><br />
            • Verifica los datos de tu tarjeta<br />
            • Asegúrate de tener fondos suficientes<br />
            • Intenta con otro método de pago<br />
            • Contacta a tu banco si el problema persiste
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar nuevamente
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:soporte@ejemplo.com'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Contactar soporte
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FailedContent />
    </Suspense>
  );
}