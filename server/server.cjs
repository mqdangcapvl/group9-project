const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

// ================= RUN CPP =================

function runCpp(args) {
  return new Promise(
    (resolve, reject) => {
      const cpp = spawn(
        path.join(__dirname, 'app.exe'),
        args,
        {
          cwd: __dirname,
        }
      );

      let output = '';
      let error = '';

      cpp.stdout.on('data', (data) => {
          output += data.toString();
        }
      );
      cpp.stderr.on('data',(data) => {
          error += data.toString();
        }
      );
      cpp.on('error', (err) => {
          reject(err);
        }
      );
      cpp.on('close', (code) => {
          if (code !== 0 || error) {
            reject(error || `C++ exited with code ${code}`);
            return;
          }
          resolve(output.trim());
        }
      );
    }
  );
}

// ================= LOGIN =================

app.post('/cpp/login',
  async (req, res) => {
    try {
      const {username,password,} = req.body;
      const result =await runCpp(['login',username,password,]);
      res.json(
        JSON.parse(result.trim())
      );
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        error:
          error.toString(),
      });
    }
  }
);

// ================= TABLES =================

app.get('/cpp/tables',
  async (req, res) => {
    try {
      const result = await runCpp(['getTables',]);
      res.json(
        JSON.parse(result)
      );
    } 
    catch (error) {
      res.status(500).json({
        error: error.toString(),
      });
    }
  }
);

app.post('/cpp/tables/start/:id',
  async (req, res) => {
    try {
      const result = await runCpp([ 'startTable', req.params.id, ]);
      res.json({
        success: result.includes( 'SUCCESS' ),
      });
    } 
    catch (error) {
      res.status(500).json({
        error: error.toString(),
      });
    }
  }
);

app.post('/cpp/tables/end/:id',
  async (req, res) => {
    try {
      const result = await runCpp([ 'endTable', req.params.id, ]);
      res.json({
        success: result.includes( 'SUCCESS' ),
      });
    } 
    catch (error) {
      res.status(500).json({
        error: error.toString(),
      });
    }
  }
);

// ================= FOODS =================

app.get('/cpp/foods',
  async (req, res) => {
    try {
      const result =  await runCpp([
          'getFoods',
        ]);
      res.json(
        JSON.parse(result)
      );
    } 
    catch (error) {
      res.status(500).json({
        error: error.toString(),
      });
    }
  }
);

// ================= ORDERS =================

app.get(
  '/cpp/orders',

  async (req, res) => {

    try {

      const result =
        await runCpp([
          'getOrders',
        ]);

      res.json(
        JSON.parse(result)
      );

    } catch (error) {

      res.status(500).json({
        error:
          error.toString(),
      });
    }
  }
);
// Dashboard 
app.get('/cpp/dashboard', (req, res) => {
  try {
    const databaseDir = path.join(__dirname, '..', 'database');

    const readLines = (fileName) => {
      const filePath = path.join(databaseDir, fileName);

      if (!fs.existsSync(filePath)) {
        return [];
      }

      return fs
        .readFileSync(filePath, 'utf8')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('format'));
    };

    const tables = readLines('tables.txt').map(line => {
      const [id, type, pricePerHour, status] = line.split(',');

      return {
        id: Number(id),
        type,
        pricePerHour: Number(pricePerHour),
        status,
      };
    });

    const employees = readLines('employees.txt').map(line => {
      const parts = line.split(',');

      return {
        type: parts[0],
        id: Number(parts[1]),
        name: parts[2],
      };
    });

    const inventory = readLines('inventory.txt').map(line => {
      const [
        id,
        name,
        category,
        quantity,
        unit,
        minStock,
        price,
      ] = line.split(',');

      return {
        id: Number(id),
        name,
        category,
        quantity: Number(quantity),
        unit,
        minStock: Number(minStock),
        price: Number(price),
      };
    });

    const foods = readLines('foods.txt').map(line => {
      const [id, name, category, price, quantity] = line.split(',');

      return {
        id: Number(id),
        name,
        category,
        price: Number(price),
        quantity: Number(quantity),
      };
    });

    const orders = readLines('orders.txt').map(line => {
      const [tableNumber, name, quantity, price] = line.split(',');

      return {
        tableNumber,
        name,
        quantity: Number(quantity),
        price: Number(price),
      };
    });

    res.json({
      tables,
      employees,
      inventory,
      foods,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});

// Membership

const membersFile = path.join(
  __dirname,
  '..',
  'database',
  'members.txt'
);

function readMembers() {
  if (!fs.existsSync(membersFile)) {
    return [];
  }

  return fs
    .readFileSync(membersFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [
        id,
        name,
        phoneNumber,
        citizenId,
        joinDate,
        status,
      ] = line.split(',');

      return {
        id: Number(id),
        name,
        phoneNumber,
        citizenId,
        joinDate,
        status: status === '1' ? 'active' : 'inactive',
      };
    });
}

function saveMembers(members) {
  const content = members
    .map(member => [
      member.id,
      member.name,
      member.phoneNumber,
      member.citizenId,
      member.joinDate,
      member.status === 'active' ? '1' : '0',
    ].join(','))
    .join('\n');

  fs.writeFileSync(
    membersFile,
    content + (content ? '\n' : ''),
    'utf8'
  );
}

app.get('/cpp/members', (req, res) => {
  try {
    res.json(readMembers());
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});

app.post('/cpp/members', (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      citizenId,
    } = req.body;

    if (!name || !phoneNumber || !citizenId) {
      res.status(400).json({
        success: false,
        error: 'Missing member fields',
      });
      return;
    }

    const members = readMembers();

    const nextId =
      members.length === 0
        ? 1
        : Math.max(...members.map(member => member.id)) + 1;

    const today =
      new Date().toISOString().slice(0, 10);

    const member = {
      id: nextId,
      name,
      phoneNumber,
      citizenId,
      joinDate: today,
      status: 'active',
    };

    members.push(member);

    saveMembers(members);

    res.json({
      success: true,
      member,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

app.delete('/cpp/members/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    const members =
      readMembers().filter(
        member => member.id !== id
      );

    saveMembers(members);

    res.json({
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});
// ================= EMPLOYEES =================

const employeesFile = path.join(
  __dirname,
  '..',
  'database',
  'employees.txt'
);

function employeeTypeToPosition(type) {
  if (type === 'MANAGER') {
    return 'Manager';
  }

  if (type === 'PARTTIME') {
    return 'Part-time Employee';
  }

  return 'Full-time Employee';
}

function positionToEmployeeType(position) {
  if (position === 'Manager') {
    return 'MANAGER';
  }

  if (position === 'Part-time Employee') {
    return 'PARTTIME';
  }

  return 'FULLTIME';
}

function readEmployees() {
  if (!fs.existsSync(employeesFile)) {
    return [];
  }

  return fs
    .readFileSync(employeesFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(',');

      const type = parts[0];
      const id = Number(parts[1]);
      const name = parts[2];
      const age = Number(parts[3] || 0);
      const cccd = parts[4] || '';
      const salaryPerHour = Number(parts[5] || 0);
      const workedHours = Number(parts[6] || 0);
      const bonus = Number(parts[7] || 0);

      return {
        id,
        name,
        age,
        cccd,
        salaryPerHour,
        workedHours,
        bonus,
        type,
        position: employeeTypeToPosition(type),
        status: 'available',
        assignedTable: '',
      };
    });
}

function saveEmployees(employees) {
  const content = employees
    .map(employee => {
      const type =
        employee.type ||
        positionToEmployeeType(employee.position);

      const row = [
        type,
        employee.id,
        employee.name,
        employee.age || 0,
        employee.cccd || '',
        employee.salaryPerHour || 0,
        employee.workedHours || 0,
      ];

      if (type === 'MANAGER') {
        row.push(employee.bonus || 0);
      }

      return row.join(',');
    })
    .join('\n');

  fs.writeFileSync(
    employeesFile,
    content + (content ? '\n' : ''),
    'utf8'
  );
}

app.get('/cpp/employees', (req, res) => {
  try {
    res.json(readEmployees());
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});

app.post('/cpp/employees', async (req, res) => {
  try {
    const {
      name,
      position,
      age,
      cccd,
      salaryPerHour,
      workedHours,
      bonus,
    } = req.body;

    if (!name || !position) {
      res.status(400).json({
        success: false,
        error: 'Missing employee fields',
      });
      return;
    }

    const allowedPositions = [
      'Full-time Employee',
      'Part-time Employee',
      'Manager',
    ];

    if (!allowedPositions.includes(position)) {
      res.status(400).json({
        success: false,
        error: 'Invalid employee position',
      });
      return;
    }

    const type = positionToEmployeeType(position);

    const employees = readEmployees();

    const nextId =
      employees.length === 0
        ? 1
        : Math.max(...employees.map(employee => employee.id)) + 1;

    const result = await runCpp([
      'addEmployee',
      type,
      String(nextId),
      name,
      String(age || 0),
      cccd || '',
      String(salaryPerHour || 0),
      String(workedHours || 0),
      String(bonus || 0),
    ]);

    try {
      res.json(JSON.parse(result));
    } catch {
      res.json({
        success: true,
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});


app.delete('/cpp/employees/:id', (req, res) => {
  try {
    const id = Number(req.params.id);

    const employees =
      readEmployees().filter(
        employee => employee.id !== id
      );

    saveEmployees(employees);

    res.json({
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

// ================= SALARIES =================

const salariesFile = path.join(
  __dirname,
  '..',
  'database',
  'salaries.txt'
);

function readSalaries() {
  if (!fs.existsSync(salariesFile)) {
    return [];
  }

  return fs
    .readFileSync(salariesFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [
        employeeId,
        baseSalary,
        hoursWorked,
        bonus,
        totalSalary,
      ] = line.split(',');

      return {
        employeeId: Number(employeeId),
        baseSalary: Number(baseSalary),
        hoursWorked: Number(hoursWorked),
        bonus: Number(bonus),
        totalSalary: Number(totalSalary),
      };
    });
}

function saveSalaries(salaries) {
  const content = salaries
    .map(salary => [
      salary.employeeId,
      salary.baseSalary,
      salary.hoursWorked,
      salary.bonus,
      salary.totalSalary,
    ].join(','))
    .join('\n');

  fs.writeFileSync(
    salariesFile,
    content + (content ? '\n' : ''),
    'utf8'
  );
}

app.get('/cpp/salaries', (req, res) => {
  try {
    const employeeIds = new Set(
      readEmployees().map(employee => employee.id)
    );

    res.json(
      readSalaries().filter(
        salary => employeeIds.has(salary.employeeId)
      )
    );
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});


app.post('/cpp/salaries', (req, res) => {
  try {
    const {
      employeeId,
      baseSalary,
      hoursWorked,
      bonus,
      totalSalary,
    } = req.body;

    if (!employeeId) {
      res.status(400).json({
        success: false,
        error: 'Missing employeeId',
      });
      return;
    }

    const salaries = readSalaries();

    const index = salaries.findIndex(
      salary => salary.employeeId === Number(employeeId)
    );

    const salaryData = {
      employeeId: Number(employeeId),
      baseSalary: Number(baseSalary || 0),
      hoursWorked: Number(hoursWorked || 0),
      bonus: Number(bonus || 0),
      totalSalary: Number(totalSalary || 0),
    };

    if (index >= 0) {
      salaries[index] = salaryData;
    } else {
      salaries.push(salaryData);
    }

    saveSalaries(salaries);

    res.json({
      success: true,
      salary: salaryData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});
// ================= EMPLOYEE ASSIGNMENTS =================

const employeeAssignmentsFile = path.join(
  __dirname,
  '..',
  'database',
  'employee_assignments.txt'
);

function readTablesForAssignment() {
  const tablesFile = path.join(
    __dirname,
    '..',
    'database',
    'tables.txt'
  );

  if (!fs.existsSync(tablesFile)) {
    return [];
  }

  return fs
    .readFileSync(tablesFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [id, type, pricePerHour, status] = line.split(',');

      const tableId = Number(id);

      return {
        id: tableId,
        type,
        status,
        label:
          type === 'VIP'
            ? `VIP-${tableId}`
            : type === 'NORMAL_A'
              ? `A-${tableId}`
              : `B-${tableId}`,
      };
    });
}

function readEmployeeAssignments() {
  if (!fs.existsSync(employeeAssignmentsFile)) {
    return [];
  }

  return fs
    .readFileSync(employeeAssignmentsFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [employeeId, tableId] = line.split(',');

      return {
        employeeId: Number(employeeId),
        tableId: Number(tableId),
      };
    });
}

function saveEmployeeAssignments(assignments) {
  const content = assignments
    .map(item => [
      item.employeeId,
      item.tableId,
    ].join(','))
    .join('\n');

  fs.writeFileSync(
    employeeAssignmentsFile,
    content + (content ? '\n' : ''),
    'utf8'
  );
}

app.get('/cpp/employee-assignments', (req, res) => {
  try {
    res.json(readEmployeeAssignments());
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});

app.post('/cpp/employee-assignments', (req, res) => {
  try {
    const employeeId = Number(req.body.employeeId);
    const tableIds = [
      ...new Set(
        (req.body.tableIds || []).map(Number)
      ),
    ];

    if (!employeeId) {
      res.status(400).json({
        success: false,
        error: 'Missing employeeId',
      });
      return;
    }

    const tables = readTablesForAssignment();

    const selectedTables = tableIds.map(id =>
      tables.find(table => table.id === id)
    );

    if (selectedTables.some(table => !table)) {
      res.status(400).json({
        success: false,
        error: 'Invalid table selected',
      });
      return;
    }

    const hasVip =
      selectedTables.some(table => table.type === 'VIP');

    if (hasVip && tableIds.length > 1) {
      res.status(400).json({
        success: false,
        error: 'VIP table can only have one assigned employee',
      });
      return;
    }

    if (!hasVip && tableIds.length > 2) {
      res.status(400).json({
        success: false,
        error: 'One employee can only handle up to 2 normal tables',
      });
      return;
    }

    const assignments = readEmployeeAssignments();

    const duplicatedTable = assignments.find(item =>
      item.employeeId !== employeeId &&
      tableIds.includes(item.tableId)
    );

    if (duplicatedTable) {
      res.status(400).json({
        success: false,
        error: 'This table is already assigned',
      });
      return;
    }

    const nextAssignments = assignments.filter(
      item => item.employeeId !== employeeId
    );

    tableIds.forEach(tableId => {
      nextAssignments.push({
        employeeId,
        tableId,
      });
    });

    saveEmployeeAssignments(nextAssignments);

    res.json({
      success: true,
      assignments: nextAssignments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

app.delete('/cpp/employee-assignments/:employeeId', (req, res) => {
  try {
    const employeeId = Number(req.params.employeeId);

    const assignments = readEmployeeAssignments().filter(
      item => item.employeeId !== employeeId
    );

    saveEmployeeAssignments(assignments);

    res.json({
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

// ================= INVENTORY =================

const inventoryFile = path.join(
  __dirname,
  '..',
  'database',
  'inventory.txt'
);

function readInventory() {
  if (!fs.existsSync(inventoryFile)) {
    return [];
  }

  return fs
    .readFileSync(inventoryFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('format'))
    .map(line => {
      const [
        id,
        name,
        category,
        quantity,
        unit,
        minStock,
        price,
      ] = line.split(',');

      return {
        id: Number(id),
        name,
        category,
        quantity: Number(quantity),
        unit,
        minStock: Number(minStock),
        price: Number(price),
      };
    });
}

function saveInventory(items) {
  const content = items
    .map(item => [
      item.id,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.minStock,
      item.price,
    ].join(','))
    .join('\n');

  fs.writeFileSync(
    inventoryFile,
    content + (content ? '\n' : ''),
    'utf8'
  );
}

app.get('/cpp/inventory', (req, res) => {
  try {
    res.json(readInventory());
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
    });
  }
});

app.post('/cpp/inventory', (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      minStock,
      price,
    } = req.body;

    if (!name || !category || !unit) {
      res.status(400).json({
        success: false,
        error: 'Missing inventory fields',
      });
      return;
    }

    const items = readInventory();

    const normalize = value =>
      String(value || '').trim().toLowerCase();

    const addedQuantity = Number(quantity || 0);

    const existingItem =
      items.find(item =>
        normalize(item.name) === normalize(name) &&
        normalize(item.category) === normalize(category) &&
        normalize(item.unit) === normalize(unit) &&
        item.quantity <= item.minStock
      ) ||
      items.find(item =>
        normalize(item.name) === normalize(name) &&
        normalize(item.category) === normalize(category) &&
        normalize(item.unit) === normalize(unit)
      );

    if (existingItem) {
      existingItem.quantity += addedQuantity;

      if (minStock !== undefined && minStock !== '') {
        existingItem.minStock = Number(minStock);
      }

      if (price !== undefined && price !== '') {
        existingItem.price = Number(price);
      }

      saveInventory(items);

      res.json({
        success: true,
        item: existingItem,
      });

      return;
    }

    const nextId =
      items.length === 0
        ? 1
        : Math.max(...items.map(item => item.id)) + 1;

    const item = {
      id: nextId,
      name,
      category,
      quantity: addedQuantity,
      unit,
      minStock: Number(minStock || 0),
      price: Number(price || 0),
    };

    items.push(item);

    saveInventory(items);

    res.json({
      success: true,
      item,
    });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.toString(),
      });
    }
});
// ================= ADD ORDER =================

app.post('/cpp/orders', async (req, res) => {
  try {
    const {
      tableNumber,
      name,
      quantity,
      price,
    } = req.body;

    const result = await runCpp([
      'addOrder',
      tableNumber,
      name,
      String(quantity),
      String(price),
    ]);

    res.json(JSON.parse(result));

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});
app.patch('/cpp/orders/:tableNumber/done', async (req, res) => {
  try {
    const result = await runCpp([
      'doneOrder',
      req.params.tableNumber,
    ]);

    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

app.delete('/cpp/orders/:tableNumber', async (req, res) => {
  try {
    const result = await runCpp([
      'deleteOrder',
      req.params.tableNumber,
    ]);

    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

// preview bill
app.post('/cpp/bill/preview', async (req, res) => {
  try {
    const {
      tableNumber,
      memberName,
    } = req.body;

    const args = [
      'calculateBill',
      tableNumber,
    ];

    if (memberName) {
      args.push(memberName);
    }

    const result = await runCpp(args);

    res.json(JSON.parse(result));

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

const billHistoryFile = path.join(
  __dirname,
  '..',
  'database',
  'bill.txt'
);

function readBillHistory() {
  if (!fs.existsSync(billHistoryFile)) {
    return [];
  }

  return fs
    .readFileSync(billHistoryFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

app.get('/cpp/bill/history', (req, res) => {
  try {
    const tableNumber = req.query.tableNumber;

    const history = readBillHistory()
      .filter(item =>
        tableNumber
          ? item.tableNumber === tableNumber
          : true
      )
      .sort((a, b) =>
        new Date(b.paidAt).getTime() -
        new Date(a.paidAt).getTime()
      );

    res.json(history);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

app.post('/cpp/bill/history', (req, res) => {
  try {
    const bill = {
      id: Date.now(),
      tableNumber: req.body.tableNumber,
      tableCharge: Number(req.body.tableCharge || 0),
      foodTotal: Number(req.body.foodTotal || 0),
      discount: Number(req.body.discount || 0),
      total: Number(req.body.total || 0),
      memberApplied: Boolean(req.body.memberApplied),
      memberName: req.body.memberName || '',
      orders: Array.isArray(req.body.orders)
        ? req.body.orders
        : [],
      paidAt: new Date().toISOString(),
    };

    fs.appendFileSync(
      billHistoryFile,
      JSON.stringify(bill) + '\n',
      'utf8'
    );

    res.json({
      success: true,
      bill,
    });

  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
    });
  }
});

// ================= SERVER =================

app.listen(5000, () => {
    console.log('Server running on port 5000');
  }
);