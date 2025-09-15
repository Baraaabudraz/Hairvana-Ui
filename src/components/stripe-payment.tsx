import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface StripePaymentProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  amount: string;
  currency: string;
  planName: string;
  ownerName: string;
}

// Payment form component that uses Stripe Elements
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError, 
  onCancel, 
  amount, 
  currency, 
  planName, 
  ownerName 
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/subscriptions`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: error.message || 'Payment could not be processed',
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent);
        toast({
          title: "Payment Successful",
          description: `Subscription for ${planName} has been activated for ${ownerName}`,
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError('An unexpected error occurred during payment');
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span>Owner:</span>
            <span className="font-medium">{ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">{currency.toUpperCase()} {amount}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${currency.toUpperCase()} ${amount}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Main Stripe payment component
export default function StripePayment(props: StripePaymentProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Fetch the publishable key from the backend
        const response = await apiFetch('/subscription-payments/stripe-key');
        
        if (response.success && response.data.publishableKey) {
          const stripe = loadStripe(response.data.publishableKey);
          setStripePromise(stripe);
        } else {
          setError('Stripe publishable key not configured');
        }
      } catch (err) {
        console.error('Error loading Stripe:', err);
        setError('Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Payment System Error</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <Button 
          variant="outline" 
          onClick={props.onCancel}
          className="mt-3"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-800 font-semibold">Payment System Not Available</h3>
        <p className="text-yellow-600 mt-1">Stripe is not properly configured.</p>
        <Button 
          variant="outline" 
          onClick={props.onCancel}
          className="mt-3"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#7c3aed',
          }
        }
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
