const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyExistsAccountCPF(request, response, next) {
    const { cpf } = request.params;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ error: "Customer not found" });
    }
    request.customer = customer;
    return next();
};

function getBalance(statemente) {
    const balance = statemente.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
};

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer Already Exisis!" });
    }
    
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statemente: []
    });
    return response.status(201).json(customers);
});

app.get("/statement/:cpf", verifyExistsAccountCPF, (request, response) => {
   const { customer } = request;
   return response.json(customer.statemente);
});

app.post("/deposit/:cpf", verifyExistsAccountCPF,(request, response) => {
    
    const { description, amount } = request.body;
    const { customer } = request;

    const statementeOperation = {
       description,
       amount,
       created_at: new Date(),
       type: "credit"
    }

    customer.statemente.push(statementeOperation);

    return response.status(201).json(customer.statemente);
});

app.post("/withdraw/:cpf", verifyExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statemente);

    if (balance < amount) {
        return response. status(400).json({ error: "Insufficient funds!" });
    }
    const statementeOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statemente.push(statementeOperation);

    return response.status(201).send();
});

app.get("/statement/:cpf/date", verifyExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statemente = customer.statemente.filter((statemente) => statemente.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(statemente);
 });

app.put("/account/:cpf", verifyExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account/:cpf", verifyExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.status(201).json(customer);
});

app.listen(3333);