import { NextResponse } from 'next/server';

const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'USD', description, customer, paymentMethod, billingAddress, items } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!customer?.email) {
      return NextResponse.json(
        { error: 'Invalid customer', message: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Validaciones básicas de tarjeta de crédito (simuladas)
    if (paymentMethod) {
      const { cardNumber, expiryDate, cvv, cardHolderName } = paymentMethod;
      
      if (!cardNumber || cardNumber.length < 13) {
        return NextResponse.json(
          { error: 'Invalid card', message: 'Card number is invalid' },
          { status: 400 }
        );
      }

      if (!cvv || cvv.length < 3) {
        return NextResponse.json(
          { error: 'Invalid CVV', message: 'CVV is required' },
          { status: 400 }
        );
      }

      if (!cardHolderName) {
        return NextResponse.json(
          { error: 'Invalid cardholder', message: 'Cardholder name is required' },
          { status: 400 }
        );
      }
    }

    // Paso 1: Crear el pago en el gateway
    console.log('Creating payment in gateway...', { amount, currency, description, customer });
    
    const createPaymentResponse = await fetch(`${PAYMENT_GATEWAY_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
        customer,
        paymentMethod: paymentMethod ? {
          type: 'credit_card',
          originalCardNumber: paymentMethod.cardNumber, // Solo para simulación del banco
          cardHolderName: paymentMethod.cardHolderName,
          last4: paymentMethod.cardNumber.slice(-4)
        } : undefined,
        billingAddress,
        items,
      }),
    });

    if (!createPaymentResponse.ok) {
      console.error('Failed to create payment:', createPaymentResponse.status);
      return NextResponse.json(
        { error: 'Payment creation failed', message: 'Failed to create payment in gateway' },
        { status: 500 }
      );
    }

    const paymentData = await createPaymentResponse.json();
    const paymentId = paymentData.payment.id;

    console.log('Payment created with ID:', paymentId);

    // Paso 2: Confirmar el pago (simula interacción con banco)
    console.log('Confirming payment with gateway...');
    
    const confirmPaymentResponse = await fetch(`${PAYMENT_GATEWAY_URL}/api/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!confirmPaymentResponse.ok) {
      console.error('Failed to confirm payment:', confirmPaymentResponse.status);
      return NextResponse.json(
        { error: 'Payment confirmation failed', message: 'Failed to confirm payment with gateway' },
        { status: 500 }
      );
    }

    const confirmationData = await confirmPaymentResponse.json();
    const paymentResult = confirmationData.payment;
    const bankResponse = confirmationData.bank_response;

    console.log('Payment result:', paymentResult.status, bankResponse.message);

    // Responder según el resultado del banco
    if (paymentResult.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        payment_id: paymentId,
        transaction_id: paymentResult.transaction_id,
        status: 'succeeded',
        message: 'Payment processed successfully',
        redirect_url: `/success?payment_id=${paymentId}&transaction_id=${paymentResult.transaction_id}`
      });
    } else {
      return NextResponse.json({
        success: false,
        payment_id: paymentId,
        status: 'failed',
        message: bankResponse.message || 'Payment was declined',
        redirect_url: `/failed?payment_id=${paymentId}`
      });
    }

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}