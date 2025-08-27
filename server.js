const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Configurar dotenv baseado no ambiente
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
} else {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de segurança
app.use(helmet());
app.use(morgan('combined'));

// CORS configurado para aceitar apenas o frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://carecompany.com.br',
    'https://www.carecompany.com.br',
    'https://planos.carecompany.com.br',
    'https://www.planos.carecompany.com.br'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Importar rotas
const asaasRoutes = require('./routes/asaas');

// Usar rotas
app.use('/api/asaas', asaasRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});