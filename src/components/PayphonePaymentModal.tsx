import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, CheckCircle2, AlertCircle, Loader2, Lock, ArrowRight, Copy, Check } from 'lucide-react';
import { CartItem, CustomerInfo, RestaurantConfig, PayphoneTransactionResult } from '../types';

interface PayphonePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: CustomerInfo;
  config: RestaurantConfig;
  onSuccessPayment: (result: PayphoneTransactionResult) => void;
}

export const PayphonePaymentModal: React.FC<PayphonePaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  config,
  onSuccessPayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [documentId, setDocumentId] = useState(''); // Cédula / RUC Ecuador
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(customer.phone || '');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(customer.fullName || '');

  // Processing & Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PayphoneTransactionResult | null>(null);
  const [copiedTxId, setCopiedTxId] = useState(false);

  // Math Calculations (Ecuador Tax 15% IVA)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || item.dish.price) * item.quantity, 0);
  const deliveryFee = customer.orderType === 'delivery' ? (subtotal > 0 ? 2.50 : 0) : 0;
  const grandTotalUSD = subtotal + deliveryFee;

  // Food subtotal vs 15% IVA breakdown
  const foodSubtotalTaxable = subtotal / 1.15;
  const ivaTax15 = subtotal - foodSubtotalTaxable;

  useEffect(() => {
    if (customer.fullName && !cardHolder) setCardHolder(customer.fullName);
    if (customer.phone && !phoneNumber) setPhoneNumber(customer.phone);
  }, [customer]);

  if (!isOpen) return null;

  const handleProcessPayphone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!documentId.trim()) {
      setErrorMessage('Por favor ingrese su Cédula o RUC (Requerido por SRI Ecuador).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingrese un correo electrónico válido para su recibo electrónico.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber.replace(/\s/g, '').match(/^\d{15,16}$/)) {
        setErrorMessage('Número de tarjeta no válido (Debe tener 15 o 16 dígitos).');
        return;
      }
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        setErrorMessage('Fecha de expiración no válida (Formato MM/AA).');
        return;
      }
      if (!cardCvc.match(/^\d{3,4}$/)) {
        setErrorMessage('Código CVC no válido (3 o 4 dígitos).');
        return;
      }
    }

    setIsProcessing(true);
    setProcessStep('Conectando con la pasarela de pagos Payphone Ecuador...');

    try {
      // 1. Prepare transaction with backend
      const prepRes = await fetch('/api/payphone/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmountUSD: grandTotalUSD,
          deliveryFeeUSD: deliveryFee,
          customerName: customer.fullName,
          customerPhone: phoneNumber,
          customerEmail: email
        })
      });

      const prepData = await prepRes.json();
      if (!prepRes.ok || !prepData.success) {
        throw new Error(prepData.error || 'No se pudo iniciar la transacción Payphone.');
      }

      const { clientTransactionId, amount, tax } = prepData.data;

      // 2. Simulate Payphone Authorization steps for smooth visual feedback
      await new Promise(r => setTimeout(r, 800));
      setProcessStep('Verificando datos con la red Visa / Mastercard Ecuador...');

      await new Promise(r => setTimeout(r, 900));
      setProcessStep('Autorizando débito con Payphone...');

      // 3. Confirm with backend endpoint
      const confirmRes = await fetch('/api/payphone/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientTransactionId,
          mockDetails: {
            amount,
            tax,
            cardBrand: cardNumber.startsWith('4') ? 'Visa Ecuador' : 'Mastercard Ecuador',
            lastDigits: cardNumber.slice(-4) || '4242',
            phoneNumber,
            email,
            documentId
          }
        })
      });

      const confirmData = await confirmRes.json();

      if (!confirmRes.ok || !confirmData.success) {
        throw new Error(confirmData.error || 'Pago rechazado por el banco o Payphone.');
      }

      setProcessStep('¡Transacción Aprobada Exitosamente!');
      await new Promise(r => setTimeout(r, 600));

      const result: PayphoneTransactionResult = confirmData.data;
      setPaymentResult(result);
      setIsProcessing(false);

    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Error al procesar el pago con Payphone.');
    }
  };

  const handleCopyTxId = () => {
    if (!paymentResult) return;
    navigator.clipboard.writeText(paymentResult.authorizationCode || paymentResult.transactionId);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  const handleFinishAndSendWhatsApp = () => {
    if (!paymentResult) return;
    onSuccessPayment(paymentResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FAF6F0] text-[#2B231D] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#E5982A]/30 text-left relative my-8">
        
        {/* Payphone Official Header */}
        <div className="bg-gradient-to-r from-[#FF5A00] to-[#E84D00] p-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
              <span className="text-[#FF5A00] font-black text-xl tracking-tighter leading-none">payphone</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold leading-tight">Pasarela de Pagos Payphone</h2>
              <p className="text-[11px] text-orange-100 font-medium">Ecuador • Visa, Mastercard, Diners & Wallet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* SUCCESS SCREEN */}
          {paymentResult ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-green-500 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-300">
                  ¡PAGO APROBADO EXITOSAMENTE!
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C3A27] mt-2">
                  ${grandTotalUSD.toFixed(2)} USD
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Procesado con Payphone Ecuador ({paymentResult.cardBrand || 'Tarjeta Débito/Crédito'})
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="bg-[#FFFDF9] rounded-xl p-4 border border-amber-200 text-xs text-left space-y-2.5 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Código de Autorización:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#C23B22]">
                    <span>{paymentResult.authorizationCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyTxId}
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors cursor-pointer"
                      title="Copiar Código"
                    >
                      {copiedTxId ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">ID Transacción Payphone:</span>
                  <span className="font-mono text-gray-800">{paymentResult.clientTransactionId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Comprobante para SRI:</span>
                  <span className="font-medium text-gray-800">{email} ({documentId})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Comercio Registrado:</span>
                  <span className="font-semibold text-[#1C3A27]">{config.restaurantName} - Quito</span>
                </div>
              </div>

              {/* Dispatch Order */}
              <button
                onClick={handleFinishAndSendWhatsApp}
                className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Enviar Pedido Pagado a WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* PAYMENT FORM */
            <form onSubmit={handleProcessPayphone} className="space-y-5">
              
              {/* Amount Breakdown Summary */}
              <div className="bg-[#FFFDF9] p-4 rounded-xl border border-orange-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Consumo de Platos:</span>
                  <span className="font-medium">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>• Base Gravable (15% IVA Ecuador):</span>
                  <span>${foodSubtotalTaxable.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>• IVA 15% SRI:</span>
                  <span>${ivaTax15.toFixed(2)} USD</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Servicio de Entrega Cumbayá:</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-[#1C3A27]">
                  <span>Monto Total a Débito:</span>
                  <span className="text-lg text-[#FF5A00]">${grandTotalUSD.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-white text-[#FF5A00] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tarjeta Crédito/Débito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'bg-white text-[#FF5A00] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>App Payphone</span>
                </button>
              </div>

              {/* Accepted Cards Badge */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-medium">
                <span>Aceptamos:</span>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-bold text-blue-700">VISA</span>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-bold text-red-600">Mastercard</span>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-bold text-blue-900">Diners</span>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-bold text-orange-600">Discover</span>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Verification Details for SRI & Receipt */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Cédula o RUC (SRI) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1712345678"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      placeholder="para recibo Payphone"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Credit / Debit Card Specific Fields */}
                {paymentMethod === 'card' ? (
                  <div className="space-y-3 pt-1 border-t border-gray-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Nombre en la Tarjeta
                      </label>
                      <input
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs uppercase focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4532 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono tracking-wider focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Expiración (MM/AA)
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            setCardExpiry(val);
                          }}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-center font-mono focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Código CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-center font-mono focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Payphone Wallet App */
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-xs space-y-2">
                    <p className="font-semibold text-[#FF5A00] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      <span>Cobro directo a tu App Payphone</span>
                    </p>
                    <p className="text-gray-600 text-[11px]">
                      Enviaremos una solicitud de cobro instantánea a tu número de celular registrado en Payphone Ecuador.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Teléfono Móvil Registrado en Payphone
                      </label>
                      <input
                        type="tel"
                        placeholder="+593 99 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#FF5A00] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security Banner */}
              <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>Cifrado SSL de 256 bits y cumplimiento PCI-DSS Nivel 1 garantizados por Payphone Ecuador.</span>
              </div>

              {/* Submit Payphone Action */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#E84D00] hover:from-[#E84D00] hover:to-[#C23B22] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>{processStep || 'Procesando con Payphone...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-orange-200" />
                    <span>Pagar ${grandTotalUSD.toFixed(2)} USD con Payphone</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
