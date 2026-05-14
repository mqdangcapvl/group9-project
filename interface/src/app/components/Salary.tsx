import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
} from '@mui/material';

import {
  DollarSign,
  Calendar,
  Calculator,
  Edit,
} from 'lucide-react';

import { toast } from 'react-toastify';

import {
  getEmployees,
  getSalaries,
  saveSalary,
} from '../../api/salaryApi';

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface SalaryData {
  employeeId: number;
  baseSalary: number;
  hoursWorked: number;
  bonus: number;
  totalSalary: number;
}

interface SalaryFormData {
  baseSalary: string;
  hoursWorked: string;
  bonus: string;
}

export function Salary() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [salaryData, setSalaryData] =
    useState<SalaryData[]>([]);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [formData, setFormData] =
    useState<SalaryFormData>({
      baseSalary: '',
      hoursWorked: '',
      bonus: '',
    });

  const [selectedMonth] =
    useState('May 2026');

  const fetchData = async () => {
    try {
      const employeeData =
        await getEmployees();

      const salaryList =
        await getSalaries();

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      );

      setSalaryData(
        Array.isArray(salaryList)
          ? salaryList
          : []
      );

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onlyDigits = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const toNumber = (value: string) => {
      return value === ''
        ? 0
        : Number(value);
    };
    const calculateSalaryByPosition = (
    position: string,
    baseSalary: number,
    hoursWorked: number,
    bonus: number
  ) => {
    if (position === 'Part-time Employee') {
      return ((baseSalary * hoursWorked) + bonus) * 0.8;
    }

    if (position === 'Manager') {
      return (baseSalary * hoursWorked) + (bonus * 2);
    }

    return (baseSalary * hoursWorked) + bonus;
  };


  const handleOpenDialog = (employee: Employee) => {
    setSelectedEmployee(employee);

    const existingSalary =
      salaryData.find(
        salary =>
          salary.employeeId === employee.id
      );

    if (existingSalary) {
      setFormData({
        baseSalary: String(existingSalary.baseSalary),
        hoursWorked: String(existingSalary.hoursWorked),
        bonus: String(existingSalary.bonus),
      });

    } else {
      setFormData({
        baseSalary: '',
        hoursWorked: '',
        bonus: '',
      });
    }

    setOpenDialog(true);
  };

  const baseSalary =
    toNumber(formData.baseSalary);

  const hoursWorked =
    toNumber(formData.hoursWorked);

  const bonus =
    toNumber(formData.bonus);

  const salaryPreview =
    selectedEmployee
      ? calculateSalaryByPosition(
          selectedEmployee.position,
          baseSalary,
          hoursWorked,
          bonus
        )
      : 0;


  const handleCalculateSalary = async () => {
    if (!selectedEmployee) return;

    const newSalaryData: SalaryData = {
      employeeId: selectedEmployee.id,
      baseSalary,
      hoursWorked,
      bonus,
      totalSalary: salaryPreview,
    };

    try {
      await saveSalary(newSalaryData);

      await fetchData();

      toast.success(
        `Salary saved for ${selectedEmployee.name || `Employee #${selectedEmployee.id}`}: $${salaryPreview.toLocaleString()}`
      );

      setOpenDialog(false);
      setSelectedEmployee(null);

    } catch (error) {
      console.log(error);
    }
  };

  const getEmployeeSalary = (
    employeeId: number
  ) => {
    return salaryData.find(
      salary =>
        salary.employeeId === employeeId
    );
  };

  const totalSalaries =
    salaryData.reduce(
      (sum, salary) =>
        sum + salary.totalSalary,
      0
    );

  const calculatedCount =
    salaryData.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography
          variant="h4"
          className="font-bold"
        >
          Salary Management
        </Typography>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />

          <TextField
            size="small"
            value={selectedMonth}
            variant="outlined"
            InputProps={{ readOnly: true }}
          />
        </div>
      </div>

      <Grid
        container
        spacing={3}
        className="mb-4"
      >
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-600"
                  >
                    Total Salaries
                  </Typography>

                  <Typography
                    variant="h5"
                    className="font-bold"
                  >
                    ${totalSalaries.toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <Typography
                    variant="body2"
                    className="text-gray-600"
                  >
                    Calculated
                  </Typography>

                  <Typography
                    variant="h5"
                    className="font-bold"
                  >
                    {calculatedCount}/{employees.length}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell>
                <strong>Employee</strong>
              </TableCell>

              <TableCell>
                <strong>Position</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Base</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Hours</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Bonus</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Total</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map(employee => {
              const salary =
                getEmployeeSalary(employee.id);

              return (
                <TableRow
                  key={employee.id}
                  hover
                >
                  <TableCell>
                    {employee.name}
                  </TableCell>

                  <TableCell>
                    {employee.position}
                  </TableCell>

                  {salary ? (
                    <>
                      <TableCell align="right">
                        ${salary.baseSalary}/hr
                      </TableCell>

                      <TableCell align="right">
                        {salary.hoursWorked}h
                      </TableCell>

                      <TableCell align="right">
                        ${salary.bonus}
                      </TableCell>

                      <TableCell align="right">
                        <strong className="text-green-600">
                          ${salary.totalSalary.toLocaleString()}
                        </strong>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit className="w-4 h-4" />}
                          onClick={() =>
                            handleOpenDialog(employee)
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        align="right"
                        colSpan={4}
                      >
                        <Chip
                          label="Not Calculated"
                          size="small"
                          className="bg-gray-100"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Calculator className="w-4 h-4" />}
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() =>
                            handleOpenDialog(employee)
                          }
                        >
                          Calculate
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Salary Calculation - {selectedEmployee?.name}
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Base Salary"
              type="text"
              value={formData.baseSalary}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  baseSalary: onlyDigits(e.target.value),
                })
              }
            />

            <TextField
              fullWidth
              label="Worked Hours"
              type="text"
              value={formData.hoursWorked}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoursWorked: onlyDigits(e.target.value),
                })
              }
            />

            <TextField
              fullWidth
              label="Bonus"
              type="text"
              value={formData.bonus}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bonus: onlyDigits(e.target.value),
                })
              }
            />

            <Card
              variant="outlined"
              className="bg-blue-50 border-blue-200"
            >
              <CardContent>
                <Typography
                  variant="body2"
                  className="mb-2"
                >
                  Salary Preview
                </Typography>

                <Typography
                  variant="h6"
                  className="font-bold text-green-600"
                >
                  ${salaryPreview.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCalculateSalary}
          >
            Save Salary
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
