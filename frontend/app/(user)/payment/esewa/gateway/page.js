'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { toast } from 'react-hot-toast';

function EsewaGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get('total_amount') || searchParams.get('amount') || '0';
  const transactionUuid = searchParams.get('transaction_uuid') || 'ORDER-TEST';
  const productCode = searchParams.get('product_code') || 'EPAYTEST';
  const successUrl = searchParams.get('success_url') || '/payment/esewa/success';
  const failureUrl = searchParams.get('failure_url') || '/payment/esewa/failure';
  const serverSignature = searchParams.get('signature') || '';

  const [esewaId, setEsewaId] = useState('9806800001');
  const [mpin, setMpin] = useState('1122');
  const [processing, setProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    if (!esewaId || !mpin) {
      toast.error('Please enter eSewa ID and MPIN.');
      return;
    }

    setProcessing(true);
    toast.loading('Processing eSewa Payment...');

    setTimeout(() => {
      const transactionCode = `ES-${Date.now().toString(36).toUpperCase()}`;
      
      // Construct eSewa v2 callback data payload
      const callbackPayload = {
        transaction_code: transactionCode,
        status: 'COMPLETE',
        total_amount: String(amount),
        transaction_uuid: String(transactionUuid),
        product_code: String(productCode),
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: serverSignature
      };

      // Base64 encode response payload according to eSewa v2 spec
      const encodedData = btoa(JSON.stringify(callbackPayload));
      
      toast.dismiss();
      toast.success('Payment Approved by eSewa!');
      
      const targetUrl = successUrl.includes('?') 
        ? `${successUrl}&data=${encodeURIComponent(encodedData)}`
        : `${successUrl}?data=${encodeURIComponent(encodedData)}`;
      
      router.push(targetUrl);
    }, 1200);
  };

  const handleCancel = () => {
    toast.error('Payment canceled by user.');
    router.push(failureUrl);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* eSewa Header */}
        <div className="bg-[#60BB46] p-6 text-white text-center relative">
          <div className="inline-block bg-white text-[#60BB46] px-4 py-1.5 rounded-full font-extrabold text-xl tracking-wide shadow-sm mb-2">
            eSewa
          </div>

        </div>

        {/* Order Details */}
        <div className="bg-green-50/60 p-4 px-6 border-b border-green-100 text-sm space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Merchant:</span>
            <span className="font-semibold text-gray-800">Paw & Meow Pet Platform</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Transaction Ref:</span>
            <span className="font-mono text-xs text-gray-700">{transactionUuid}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="font-bold text-gray-700">Total Payable Amount:</span>
            <span className="text-xl font-black text-[#60BB46]">Rs. {Number(amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePayment} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">eSewa Mobile ID / Phone</label>
            <input
              type="text"
              required
              value={esewaId}
              onChange={(e) => setEsewaId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#60BB46] focus:border-transparent text-gray-800 font-medium"
              placeholder="98XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">MPIN / Password</label>
            <input
              type="password"
              required
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#60BB46] focus:border-transparent text-gray-800 font-medium"
              placeholder="••••"
            />
          </div>


          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#60BB46] hover:bg-[#52a33c] text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authorizing Payment...
                </>
              ) : (
                `Confirm & Pay Rs. ${Number(amount).toLocaleString()}`
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition text-sm"
            >
              Cancel Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EsewaGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <EsewaGatewayContent />
    </Suspense>
  );
}
