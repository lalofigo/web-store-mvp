'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const products: Product[] = [
  { id: 1, name: 'Producto A', price: 29.99, description: 'Excelente producto para tu hogar' },
  { id: 2, name: 'Producto B', price: 49.99, description: 'La mejor calidad del mercado' },
  { id: 3, name: 'Producto C', price: 19.99, description: 'Económico y funcional' },
];

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((_, index) => index !== productId));
  };

  const total = cart.reduce((sum, product) => sum + product.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Guardar carrito en localStorage para pasarlo al checkout
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    // Redirigir a la página de checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🛍️ Web Store MVP</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Productos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">🛒 Carrito</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((product, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-green-600">${product.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${
                      isCheckingOut
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isCheckingOut ? 'Procesando...' : 'Proceder al pago'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
