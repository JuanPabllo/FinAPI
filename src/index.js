import express from 'express';
import { v4 as uuidV4 } from 'uuid';
/**
 *  cpf - string
 *  name - string
 *  id - uuid
 *  statement - []
 */
const app = express();

app.use(express.json());

const customers = [];

// Middleware

const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) return res.status(400).json({ error: 'Customer not found' });

  req.customer = customer;

  return next();
};

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customersAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  );

  if (customersAlreadyExists)
    return res.status(400).json({ erros: 'Customers already exists' });

  customers.push({
    cpf,
    name,
    id: uuidV4(),
    statement: [],
  });

  return res.status(201).send();
});

// app.use(verifyIfExistsAccountCPF);

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.listen(3000);
