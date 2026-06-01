import { useEffect, useState } from 'react';

import {Avatar,Button,Card,CardContent,Checkbox,Chip,Dialog,DialogActions,DialogContent,DialogTitle,FormControl,FormControlLabel,FormGroup,Grid,InputLabel,MenuItem,Select,TextField,Typography,} from '@mui/material';

import {CheckCircle,Plus,Trash2,User,XCircle,} from 'lucide-react';

import {
  addEmployee,
  clearEmployeeAssignment,
  deleteEmployee,
  getEmployeeAssignments,
  getEmployees,
  saveEmployeeAssignment,
} from '../../api/employeeApi';

import { getTables } from '../../api/tablesApi';

interface Employee {
  id: number;
  name: string;
  position: string;
  status: 'available' | 'occupied';
  avatar: string;
}

interface TableItem {
  id: number;
  number: string;
  type: 'VIP' | 'NORMAL_A' | 'NORMAL_B';
  status: 'available' | 'occupied';
}

interface Assignment {
  employeeId: number;
  tableId: number;
}

export function Employees() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [tables, setTables] =
    useState<TableItem[]>([]);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [assignDialogOpen, setAssignDialogOpen] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [selectedTableIds, setSelectedTableIds] =
    useState<number[]>([]);

  const [newEmployee, setNewEmployee] =
    useState({
      name: '',
      position: '',
    });

  const getEmployeeAvatar = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getAssignedTables = (employeeId: number) => {
    return assignments
      .filter(item => item.employeeId === employeeId)
      .map(item =>
        tables.find(table => table.id === item.tableId)
      )
      .filter(Boolean) as TableItem[];
  };

  const loadEmployees = async () => {
    try {
      const [
        employeeData,
        tableData,
        assignmentData,
      ] = await Promise.all([
        getEmployees(),
        getTables(),
        getEmployeeAssignments(),
      ]);

      const safeAssignments =
        Array.isArray(assignmentData)
          ? assignmentData
          : [];

      const formattedEmployees =
        (Array.isArray(employeeData) ? employeeData : [])
          .map((employee: any) => {
            const employeeAssignments =
              safeAssignments.filter(
                (item: Assignment) =>
                  item.employeeId === employee.id
              );

            return {
              ...employee,
              status:
                employeeAssignments.length > 0
                  ? 'occupied'
                  : 'available',
              avatar: getEmployeeAvatar(employee.name),
            };
          });

      setEmployees(formattedEmployees);
      setTables(Array.isArray(tableData) ? tableData : []);
      setAssignments(safeAssignments);

    } catch (error: any) {
      alert(
        error.message || 'Cannot load employees'
      );
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addEmployee(newEmployee);

      await loadEmployees();

      setOpenDialog(false);

      setNewEmployee({
        name: '',
        position: '',
      });

    } catch (error: any) {
      alert(
        error.message || 'Cannot add employee'
      );
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      await clearEmployeeAssignment(id);
      await deleteEmployee(id);
      await loadEmployees();

    } catch (error: any) {
      alert(
        error.message || 'Cannot delete employee'
      );
    }
  };

  const handleOpenAssign = (employee: Employee) => {
    setSelectedEmployee(employee);

    const currentTableIds =
      assignments
        .filter(item => item.employeeId === employee.id)
        .map(item => item.tableId);

    setSelectedTableIds(currentTableIds);
    setAssignDialogOpen(true);
  };

  const handleToggleTable = (tableId: number) => {
    const exists =
      selectedTableIds.includes(tableId);

    const nextIds = exists
      ? selectedTableIds.filter(id => id !== tableId)
      : [...selectedTableIds, tableId];

    const selectedTables =
      nextIds
        .map(id => tables.find(table => table.id === id))
        .filter(Boolean) as TableItem[];

    const hasVip =
      selectedTables.some(
        table => table.type === 'VIP'
      );

    if (hasVip && nextIds.length > 1) {
      alert(
        'Bàn VIP chỉ được assign 1 nhân viên cho 1 bàn'
      );
      return;
    }

    if (!hasVip && nextIds.length > 2) {
      alert(
        'Một nhân viên chỉ được xếp tối đa 2 bàn normal'
      );
      return;
    }

    setSelectedTableIds(nextIds);
  };

  const handleSaveAssignment = async () => {
    if (!selectedEmployee) return;

    try {
      await saveEmployeeAssignment({
        employeeId: selectedEmployee.id,
        tableIds: selectedTableIds,
      });

      await loadEmployees();

      setAssignDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedTableIds([]);

    } catch (error: any) {
      alert(
        error.message || 'Cannot assign employee'
      );
    }
  };

  const handleClearAssignment = async (
    employeeId: number
  ) => {
    try {
      await clearEmployeeAssignment(employeeId);
      await loadEmployees();

    } catch (error: any) {
      alert(
        error.message || 'Cannot clear assignment'
      );
    }
  };

  const availableCount =
    employees.filter(
      employee => employee.status === 'available'
    ).length;

  const occupiedCount =
    employees.filter(
      employee => employee.status === 'occupied'
    ).length;

  const availableTablesForAssign =
    tables.filter(table => {
      const assignedToOther =
        assignments.some(
          item =>
            item.tableId === table.id &&
            item.employeeId !== selectedEmployee?.id
        );

      return !assignedToOther;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">
          Employee Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpenDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Employee
        </Button>
      </div>

      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <Typography variant="body2" className="text-gray-600">
                    Total Employees
                  </Typography>

                  <Typography variant="h5" className="font-bold">
                    {employees.length}
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
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <Typography variant="body2" className="text-gray-600">
                    Available
                  </Typography>

                  <Typography variant="h5" className="mt-2 font-bold text-green-600">
                    {availableCount}
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
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>

                <div>
                  <Typography variant="body2" className="text-gray-600">
                    Occupied
                  </Typography>

                  <Typography variant="h5" className="font-bold text-red-600">
                    {occupiedCount}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {employees.map(employee => {
          const assignedTables =
            getAssignedTables(employee.id);

          return (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
              }}
              key={employee.id}
            >
              <Card className="h-full">
                <CardContent>
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      className="w-16 h-16 text-xl mb-3"
                      sx={{
                        bgcolor:
                          employee.status === 'available'
                            ? '#10b981'
                            : '#ef4444',
                      }}
                    >
                      {employee.avatar}
                    </Avatar>

                    <Typography variant="h6" className="font-semibold">
                      {employee.name}
                    </Typography>

                    <Typography variant="body2" className="text-gray-600 mb-2">
                      {employee.position}
                    </Typography>

                    <Chip
                      label={
                        employee.status === 'available'
                          ? 'Available'
                          : 'Assigned'
                      }
                      size="small"
                      className={`mt-2 ${
                        employee.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    />

                    {assignedTables.length > 0 && (
                      <Typography
                        variant="caption"
                        className="text-gray-500 mt-2"
                      >
                        Assigned:{' '}
                        {assignedTables
                          .map(table => table.number)
                          .join(', ')}
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      className="mt-3"
                      onClick={() => handleOpenAssign(employee)}
                    >
                      Assign
                    </Button>

                    {assignedTables.length > 0 && (
                      <Button
                        variant="text"
                        color="warning"
                        size="small"
                        onClick={() => handleClearAssignment(employee.id)}
                      >
                        Clear Assign
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Trash2 />}
                      className="mt-2"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Employee
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-3">
            <TextField
              fullWidth
              label="Employee Name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  name: e.target.value,
                })
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Position
              </InputLabel>

              <Select
                label="Position"
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    position: e.target.value,
                  })
                }
              >
                <MenuItem value="Full-time Employee">
                  Full-time Employee
                </MenuItem>

                <MenuItem value="Part-time Employee">
                  Part-time Employee
                </MenuItem>

                <MenuItem value="Manager">
                  Manager
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAddEmployee}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Table - {selectedEmployee?.name}
        </DialogTitle>

        <DialogContent>
          {availableTablesForAssign.length === 0 ? (
            <Typography
              variant="body2"
              className="text-gray-500 mt-2"
            >
              No available tables to assign
            </Typography>
          ) : (
            <FormGroup className="mt-2">
              {availableTablesForAssign.map(table => (
                <FormControlLabel
                  key={table.id}
                  control={
                    <Checkbox
                      checked={selectedTableIds.includes(table.id)}
                      onChange={() => handleToggleTable(table.id)}
                    />
                  }
                  label={`${table.number} - ${
                    table.type === 'VIP'
                      ? 'VIP'
                      : 'Normal'
                  }`}
                />
              ))}
            </FormGroup>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveAssignment}
          >
            Save Assign
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
