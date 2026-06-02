import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Calculator, Calendar, DollarSign, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { getEmployees, getSalaries, saveSalary } from '../../api/salaryApi';

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

export function Salary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ baseSalary: '', hoursWorked: '', bonus: '' });
  const [summary, setSummary] = useState({totalSalaries: 0,calculatedCount: 0,});

  const fetchData = async () => {
    setEmployees(await getEmployees());
    const salaryResult = await getSalaries();

    setSummary(salaryResult.summary || {
      totalSalaries: 0,
      calculatedCount: 0,
    });

    setSalaryData(
      Array.isArray(salaryResult.salaries)
        ? salaryResult.salaries
        : []
    );
  };

  useEffect(() => {
    fetchData().catch(console.log);
  }, []);

  const onlyDigits = (value: string) => value.replace(/\D/g, '');

  const handleOpenDialog = (employee: Employee) => {
    const salary = salaryData.find(item => item.employeeId === employee.id);
    setSelectedEmployee(employee);
    setFormData({
      baseSalary: salary ? String(salary.baseSalary) : '',
      hoursWorked: salary ? String(salary.hoursWorked) : '',
      bonus: salary ? String(salary.bonus) : '',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    try {
      await saveSalary({
        employeeId: selectedEmployee.id,
        baseSalary: Number(formData.baseSalary || 0),
        hoursWorked: Number(formData.hoursWorked || 0),
        bonus: Number(formData.bonus || 0),
      });

      await fetchData();
      toast.success('Salary saved');
      setOpenDialog(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      alert(error.message || 'Cannot save salary');
    }
  };

  const getSalary = (employeeId: number) =>
    salaryData.find(item => item.employeeId === employeeId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">Salary Management</Typography>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <TextField size="small" value="May 2026" InputProps={{ readOnly: true }} />
        </div>
      </div>

      <Grid container spacing={3} className="mb-4">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <Typography variant="body2" className="text-gray-600">
                    Total Salaries
                  </Typography>

                  <Typography variant="h5" className="font-bold">
                    ${summary.totalSalaries.toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <Typography variant="body2" className="text-gray-600">
                    Calculated
                  </Typography>

                  <Typography variant="h5" className="font-bold">
                    {summary.calculatedCount}/{employees.length}
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
            <TableRow>
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell align="right"><strong>Base</strong></TableCell>
              <TableCell align="right"><strong>Hours</strong></TableCell>
              <TableCell align="right"><strong>Bonus</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map(employee => {
              const salary = getSalary(employee.id);

              return (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>

                  {salary ? (
                    <>
                      <TableCell align="right">${salary.baseSalary}</TableCell>
                      <TableCell align="right">{salary.hoursWorked}</TableCell>
                      <TableCell align="right">${salary.bonus}</TableCell>
                      <TableCell align="right">${salary.totalSalary}</TableCell>
                    </>
                  ) : (
                    <TableCell align="right" colSpan={4}>
                      <Chip label="Not Calculated" size="small" />
                    </TableCell>
                  )}

                  <TableCell align="center">
                    <Button size="small" variant="outlined" startIcon={<Edit className="w-4 h-4" />} onClick={() => handleOpenDialog(employee)}>
                      {salary ? 'Edit' : 'Calculate'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Salary - {selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Base Salary" value={formData.baseSalary} sx={{ mt: 3 }} onChange={(e) => setFormData({ ...formData, baseSalary: onlyDigits(e.target.value) })} />
          <TextField fullWidth label="Worked Hours" value={formData.hoursWorked} sx={{ mt: 3 }} onChange={(e) => setFormData({ ...formData, hoursWorked: onlyDigits(e.target.value) })} />
          <TextField fullWidth label="Bonus" value={formData.bonus} sx={{ mt: 3 }} onChange={(e) => setFormData({ ...formData, bonus: onlyDigits(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Salary</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}