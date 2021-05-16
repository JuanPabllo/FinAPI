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

const getBalance = (statement) => {
  const balace = statement.reduce((acumulator, operation) => {
    if (operation.type === 'credit') {
      return acumulator + operation.amount;
    } else {
      return acumulator - operation.amount;
    }
  }, 0);

  return balace;
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

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balace = getBalance(customer.statement);

  if (balace < amount) {
    res.status(400).json({ error: 'Insufficient funds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  const { date } = req.query;

  const formatDate = new Date(date + ' 00:00');

  const statement = customer.statement.filter((statement) => {
    statement.created_at.toDateString() === new Date(formatDate).toDateString();
  });

  return res.json(statement);
});

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer);
});

app.delete('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res.status(200).json(customers);
});

app.listen(3000);
