const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuração base para requisições à API Asaas
const asaasApi = axios.create({
  baseURL: process.env.ASAAS_BASE_URL,
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json',
    'User-Agent': process.env.ASAAS_USER_AGENT || 'CareCompany-App'
  }
});

// Middleware de validação
const validateCustomerData = (req, res, next) => {
  const { name, email, cpfCnpj } = req.body;
  
  if (!name || !email || !cpfCnpj) {
    return res.status(400).json({
      error: 'Dados obrigatórios não fornecidos',
      required: ['name', 'email', 'cpfCnpj']
    });
  }
  
  next();
};

// Rota para criar cliente
router.post('/customers', validateCustomerData, async (req, res) => {
  try {
    const customerData = req.body;
    
    // Limpar e validar dados
    const cleanCustomerData = {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone?.replace(/\D/g, '') || undefined,
      cpfCnpj: customerData.cpfCnpj?.replace(/\D/g, '') || undefined,
      postalCode: customerData.postalCode?.replace(/\D/g, '') || undefined,
      address: customerData.address || undefined,
      addressNumber: customerData.addressNumber || undefined,
      complement: customerData.complement || undefined,
      neighborhood: customerData.neighborhood || undefined,
      city: customerData.city || undefined,
      state: customerData.state || undefined
    };
    
    // Remover campos undefined
    Object.keys(cleanCustomerData).forEach(key => {
      if (cleanCustomerData[key] === undefined || cleanCustomerData[key] === '') {
        delete cleanCustomerData[key];
      }
    });
    
    console.log('📋 Criando cliente:', cleanCustomerData.name);
    
    const response = await asaasApi.post('/customers', cleanCustomerData);
    
    console.log('✅ Cliente criado com sucesso:', response.data.id);
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar cliente',
      details: error.response?.data || error.message
    });
  }
});

// Rota para criar pagamento
router.post('/payments', async (req, res) => {
  try {
    const paymentData = req.body;
    
    if (!paymentData.customer || !paymentData.value || !paymentData.dueDate) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['customer', 'value', 'dueDate']
      });
    }
    
    console.log('💳 Criando pagamento para cliente:', paymentData.customer);
    
    const response = await asaasApi.post('/payments', paymentData);
    
    console.log('✅ Pagamento criado com sucesso:', response.data.id);
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar pagamento',
      details: error.response?.data || error.message
    });
  }
});

// Rota para criar assinatura
router.post('/subscriptions', async (req, res) => {
  try {
    const subscriptionData = req.body;
    
    if (!subscriptionData.customer || !subscriptionData.value || !subscriptionData.nextDueDate) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['customer', 'value', 'nextDueDate']
      });
    }
    
    console.log('🔄 Criando assinatura para cliente:', subscriptionData.customer);
    
    const response = await asaasApi.post('/subscriptions', subscriptionData);
    
    console.log('✅ Assinatura criada com sucesso:', response.data.id);
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('❌ Erro ao criar assinatura:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar assinatura',
      details: error.response?.data || error.message
    });
  }
});

// Rota para webhook
router.post('/webhook', (req, res) => {
  try {
    const { event, payment } = req.body;
    
    console.log('🔔 Webhook recebido:', { event, payment: payment?.id });
    
    // Aqui você pode processar os eventos do webhook
    // Por exemplo: atualizar status no banco de dados
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

module.exports = router;