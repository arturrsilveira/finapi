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

app.listen(3333);