const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function runCpp(args) {
  return new Promise((resolve, reject) => {
    execFile(
      path.join(__dirname, 'app.exe'),
      args.map(String),
      { cwd: __dirname },
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
          return;
        }

        resolve(stdout.trim());
      }
    );
  });
}

async function bridge(req, res, args) {
  try {
    const result = await runCpp(args);
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
}

// LOGIN
app.post('/cpp/login', async (req, res) => {
  await bridge(req, res, [
    'login',
    req.body.username,
    req.body.password,
  ]);
});

// DASHBOARD
app.get('/cpp/dashboard', async (req, res) => {
  await bridge(req, res, ['getDashboard']);
});

// TABLES
app.get('/cpp/tables', async (req, res) => {
  await bridge(req, res, ['getTables']);
});

app.post('/cpp/tables/start/:id', async (req, res) => {
  await bridge(req, res, ['startTable', req.params.id]);
});

app.post('/cpp/tables/end/:id', async (req, res) => {
  await bridge(req, res, ['endTable', req.params.id]);
});

// FOOD / INVENTORY MENU
app.get('/cpp/foods', async (req, res) => {
  await bridge(req, res, ['getMenu']);
});

app.get('/cpp/inventory', async (req, res) => {
  await bridge(req, res, ['getInventory']);
});

app.post('/cpp/inventory', async (req, res) => {
  await bridge(req, res, [
    'addInventoryItem',
    req.body.name,
    req.body.category,
    req.body.quantity,
    req.body.unit,
    req.body.minStock,
    req.body.price,
  ]);
});

// ORDERS
app.get('/cpp/orders', async (req, res) => {
  await bridge(req, res, ['getOrders']);
});

app.post('/cpp/orders', async (req, res) => {
  await bridge(req, res, [
    'addOrder',
    req.body.tableNumber,
    req.body.name,
    req.body.quantity,
    req.body.price,
  ]);
});

app.patch('/cpp/orders/:tableNumber/done', async (req, res) => {
  await bridge(req, res, [
    'doneOrder',
    req.params.tableNumber,
  ]);
});

app.delete('/cpp/orders/:tableNumber', async (req, res) => {
  await bridge(req, res, [
    'deleteOrder',
    req.params.tableNumber,
  ]);
});

// EMPLOYEES
app.get('/cpp/employees', async (req, res) => {
  await bridge(req, res, ['getEmployees']);
});

app.post('/cpp/employees', async (req, res) => {
  await bridge(req, res, [
    'addEmployeeAuto',
    req.body.position,
    req.body.name,
    req.body.age,
    req.body.cccd,
    req.body.salaryPerHour,
    req.body.workedHours,
    req.body.bonus || 0,
  ]);
});

app.delete('/cpp/employees/:id', async (req, res) => {
  await bridge(req, res, [
    'deleteEmployee',
    req.params.id,
  ]);
});

// SALARIES
app.get('/cpp/salaries', async (req, res) => {
  await bridge(req, res, ['getSalaries']);
});

app.post('/cpp/salaries', async (req, res) => {
  await bridge(req, res, [
    'saveSalary',
    req.body.employeeId,
    req.body.baseSalary,
    req.body.hoursWorked,
    req.body.bonus,
  ]);
});

// MEMBERSHIP
app.get('/cpp/members', async (req, res) => {
  await bridge(req, res, ['getMembers']);
});

app.post('/cpp/members', async (req, res) => {
  await bridge(req, res, [
    'addMember',
    req.body.name,
    req.body.phoneNumber,
    req.body.citizenId,
  ]);
});

app.delete('/cpp/members/:id', async (req, res) => {
  await bridge(req, res, [
    'deleteMember',
    req.params.id,
  ]);
});

// EMPLOYEE ASSIGNMENTS
app.get('/cpp/employee-assignments', async (req, res) => {
  await bridge(req, res, ['getEmployeeAssignments']);
});

app.post('/cpp/employee-assignments', async (req, res) => {
  await bridge(req, res, [
    'saveEmployeeAssignments',
    req.body.employeeId,
    ...(req.body.tableIds || []),
  ]);
});

app.delete('/cpp/employee-assignments/:employeeId', async (req, res) => {
  await bridge(req, res, [
    'deleteEmployeeAssignments',
    req.params.employeeId,
  ]);
});

// BILL
app.post('/cpp/bill/preview', async (req, res) => {
  const args = [
    'calculateBill',
    req.body.tableNumber,
  ];

  if (req.body.memberName) {
    args.push(req.body.memberName);
  }

  await bridge(req, res, args);
});

app.get('/cpp/bill/history', async (req, res) => {
  await bridge(req, res, [
    'getBillHistory',
    req.query.tableNumber || '',
  ]);
});

app.post('/cpp/bill/history', async (req, res) => {
  await bridge(req, res, [
    'saveBillHistory',
    JSON.stringify(req.body),
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});