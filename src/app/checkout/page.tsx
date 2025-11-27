'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      zipCode: '',
      country: 'México'
    }
  });

  // Cargar datos del carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('checkoutCart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      const cartWithQuantity = parsedCart.map((item: {id: number; name: string; price: number}) => ({
        ...item,
        quantity: 1
      }));
      setCartItems(cartWithQuantity);
    } else {
      // Datos de ejemplo si no hay carrito guardado
      setCartItems([
        { id: 1, name: 'Producto A', price: 29.99, quantity: 2 },
        { id: 2, name: 'Producto B', price: 49.99, quantity: 1 }
      ]);
    }
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (field: keyof CreditCardData | string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCardData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreditCardData] as object),
          [child]: value
        }
      }));
    } else {
      setCardData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'USD',
          description: `Compra de ${cartItems.length} productos`,
          customer: {
            name: cardData.cardHolderName,
            email: cardData.email,
          },
          paymentMethod: {
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv,
            cardHolderName: cardData.cardHolderName,
          },
          billingAddress: cardData.billingAddress,
          items: cartItems
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(result.redirect_url);
      } else {
        router.push(result.redirect_url);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error procesando el pago. Inténtalo nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Volver al carrito
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout - Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">💳 Información de Pago</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Datos de tarjeta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Expiración
                  </label>
                  <input
                    type="text"
                    value={cardData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Tarjetahabiente
                </label>
                <input
                  type="text"
                  value={cardData.cardHolderName}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={cardData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dirección de facturación */}
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">📍 Dirección de Facturación</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={cardData.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                  placeholder="Av. Reforma 123"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={cardData.billingAddress.city}
                    onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                    placeholder="Ciudad de México"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={cardData.billingAddress.zipCode}
                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value.replace(/\D/g, '').substring(0, 10))}
                    placeholder="01000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isProcessing ? '🔄 Procesando Pago...' : `💳 Pagar $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Resumen de la compra */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📄 Resumen de Compra</h2>
            
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">IVA (16%):</span>
                <span>${(total * 0.16).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">${(total * 1.16).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">🔒 Pago Seguro</h3>
              <p className="text-sm text-blue-600 mb-3">
                Este es un entorno de prueba. Los datos de tu tarjeta son simulados y no se procesan realmente.
              </p>
              
              <div className="text-sm">
                <h4 className="font-medium text-blue-800 mb-2">💳 Tarjetas de Prueba:</h4>
                <ul className="space-y-1 text-blue-600">
                  <li><strong>4242424242424242</strong> - Pago exitoso (normal)</li>
                  <li><strong>4000000000000002</strong> - Pago rechazado (siempre)</li>
                  <li><strong>4000000000000101</strong> - Fondos insuficientes</li>
                  <li><strong>4000000000000119</strong> - Error de procesamiento</li>
                </ul>
                <p className="mt-2 text-xs">CVV: cualquier 3-4 dígitos, Fecha: cualquier fecha futura</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}