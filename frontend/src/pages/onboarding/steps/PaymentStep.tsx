// frontend/src/pages/onboarding/steps/PaymentStep.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { PaymentService } from '../../../services/payment';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentStepProps {
  data: {
    payment: {
      planId: string;
      method: string;
    };
  };
  onUpdate: (data: any) => void;
}

const PaymentStep = ({ data, onUpdate }: PaymentStepProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMercadoPago = async () => {
      try {
        // 1. Criar preferência de pagamento
        const preference = await PaymentService.createPreference(data.payment.planId);
        
        // 2. Carregar SDK do Mercado Pago
        const script = document.createElement('script');
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = () => {
          const mp = new window.MercadoPago('YOUR_PUBLIC_KEY', {
            locale: 'pt-BR'
          });

          mp.checkout({
            preference: {
              id: preference.id
            },
            render: {
              container: '.cho-container',
              label: 'Pagar',
            }
          });
          
          setLoading(false);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Erro ao configurar pagamento:', error);
      }
    };

    loadMercadoPago();
  }, [data.payment.planId]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pagamento
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <Typography gutterBottom>
            Plano selecionado: {data.payment.planId}
          </Typography>
          
          {/* Container para o botão do Mercado Pago */}
          <div className="cho-container"></div>
        </Box>
      )}
    </Box>
  );
};

export default PaymentStep;