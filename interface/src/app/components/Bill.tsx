import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  Clock,
  CreditCard,
  DollarSign,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';

import {
  endTable,
  getTables,
} from '../../api/tablesApi';

import {
  BillHistoryItem,
  BillPreview,
  clearTableOrders,
  getBillHistory,
  previewBill,
  saveBillHistory,
} from '../../api/billApi';

interface TableData {
  id: number;
  number: string;
  status: string;
  duration: number;
  pricePerHour: number;
}

export function Bill() {
  const [tables, setTables] =
    useState<TableData[]>([]);

  const [selectedTable, setSelectedTable] =
    useState('');

  const [billPreview, setBillPreview] =
    useState<BillPreview | null>(null);

  const [membershipDialogOpen, setMembershipDialogOpen] =
    useState(false);

  const [memberName, setMemberName] =
    useState('');

  const [appliedMemberName, setAppliedMemberName] =
    useState('');

  const [historyTable, setHistoryTable] =
    useState('');

  const [billHistory, setBillHistory] =
    useState<BillHistoryItem[]>([]);

  const loadTables = async () => {
    try {
      const tableData =
        await getTables();

      setTables(
        Array.isArray(tableData)
          ? tableData
          : []
      );

    } catch (error) {
      console.log(error);
    }
  };

  const loadBillPreview = async (
    tableNumber: string,
    member: string
  ) => {
    if (!tableNumber) {
      setBillPreview(null);
      return;
    }

    try {
      const data =
        await previewBill(
          tableNumber,
          member
        );

      if (!data.success) {
        setBillPreview(null);
        return;
      }

      setBillPreview(data);

    } catch (error: any) {
      alert(
        error.message || 'Cannot load bill'
      );
    }
  };

  const loadBillHistory = async (
    tableNumber: string
  ) => {
    if (!tableNumber) {
      setBillHistory([]);
      return;
    }

    try {
      const history =
        await getBillHistory(tableNumber);

      setBillHistory(history);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const occupiedTables =
    tables.filter(
      table => table.status === 'occupied'
    );

  const currentTable =
    occupiedTables.find(
      table => table.number === selectedTable
    );

  const handleTableChange = async (
    tableNumber: string
  ) => {
    setSelectedTable(tableNumber);
    setMemberName('');
    setAppliedMemberName('');

    await loadBillPreview(
      tableNumber,
      ''
    );

    await loadBillHistory(
      tableNumber
    );
  };


  const handleApplyMembership = async () => {
    const name =
      memberName.trim();

    if (!selectedTable) {
      alert('Please select a table first');
      return;
    }

    if (!name) {
      alert('Please enter member name');
      return;
    }

    const data =
      await previewBill(
        selectedTable,
        name
      );

    if (!data.memberApplied) {
      alert('Khong co membership nay');
      setAppliedMemberName('');
      setBillPreview(data);
      return;
    }

    setAppliedMemberName(name);
    setBillPreview(data);
    setMembershipDialogOpen(false);
  };

  const handleRemoveMembership = async () => {
    setMemberName('');
    setAppliedMemberName('');

    await loadBillPreview(
      selectedTable,
      ''
    );
  };

  const handleGenerateBill = async () => {
    if (!currentTable || !billPreview) {
      return;
    }

    try {
      const paidTableNumber =
        currentTable.number;

      await saveBillHistory(
        billPreview,
        appliedMemberName
      );

      await endTable(
        currentTable.id
      );

      await clearTableOrders(
        paidTableNumber
      );

      setSelectedTable('');
      setMemberName('');
      setAppliedMemberName('');
      setBillPreview(null);

      await loadTables();

      // Sau khi thanh toán bàn nào thì ô history hiện đúng bàn đó.
      await loadBillHistory(
        paidTableNumber
      );

  } catch (error: any) {
    alert(
      error.message || 'Cannot generate bill'
    );
  }
};


  return (
    <div>
      <Typography
        variant="h4"
        className="mb-6 font-bold"
      >
        Bill Calculator
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                className="mb-4"
              >
                Select Table
              </Typography>

              <FormControl fullWidth>
                <InputLabel>
                  Table Number
                </InputLabel>

                <Select
                  value={selectedTable}
                  label="Table Number"
                  onChange={(e) =>
                    handleTableChange(
                      e.target.value
                    )
                  }
                >
                  {occupiedTables.map(table => (
                    <MenuItem
                      key={table.id}
                      value={table.number}
                    >
                      {table.number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {currentTable && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />

                    <span>
                      Duration: {currentTable.duration} min
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />

                    <span>
                      Rate: ${currentTable.pricePerHour}/hr
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentTable && billPreview && (
            <Card className="mt-3">
              <CardContent>
                <Typography
                  variant="h6"
                  className="mb-4"
                >
                  Summary
                </Typography>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="body2">
                      Table Charge
                    </Typography>

                    <Typography
                      variant="body2"
                      className="font-semibold"
                    >
                      ${billPreview.tableCharge.toFixed(0)}
                    </Typography>
                  </div>

                  <div className="flex justify-between">
                    <Typography variant="body2">
                      Food & Beverages
                    </Typography>

                    <Typography
                      variant="body2"
                      className="font-semibold"
                    >
                      ${billPreview.foodTotal.toFixed(0)}
                    </Typography>
                  </div>

                  {billPreview.memberApplied && (
                    <>
                      <div className="flex justify-between">
                        <Typography
                          variant="body2"
                          className="text-blue-600"
                        >
                          Membership Discount
                        </Typography>

                        <Typography
                          variant="body2"
                          className="font-semibold text-blue-600"
                        >
                          -${billPreview.discount.toFixed(0)}
                        </Typography>
                      </div>

                      <Typography
                        variant="caption"
                        className="block text-gray-500"
                      >
                        Member: {appliedMemberName}
                      </Typography>
                    </>
                  )}

                  <Divider className="my-2" />

                  <div className="flex justify-between">
                    <Typography
                      variant="h6"
                      className="font-bold"
                    >
                      Total
                    </Typography>

                    <Typography
                      variant="h6"
                      className="font-bold text-green-600"
                    >
                      ${billPreview.total.toFixed(0)}
                    </Typography>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="outlined"
                  className="mt-4"
                  startIcon={<CreditCard />}
                  onClick={() =>
                    setMembershipDialogOpen(true)
                  }
                >
                  Add Membership
                </Button>

                {billPreview.memberApplied && (
                  <Button
                    fullWidth
                    variant="text"
                    color="warning"
                    className="mt-2"
                    onClick={handleRemoveMembership}
                  >
                    Remove Membership
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  className="mt-3 bg-green-600 hover:bg-green-700"
                  startIcon={<Receipt />}
                  onClick={handleGenerateBill}
                >
                  Generate Bill
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {!currentTable || !billPreview ? (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-gray-400">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />

                  <Typography variant="h6">
                    Select a table to view bill
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  className="font-bold mb-6"
                >
                  Bill Details - {currentTable.number}
                </Typography>

                <Typography
                  variant="h6"
                  className="mb-3 flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  Food & Beverages
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                >
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell>
                          Item
                        </TableCell>

                        <TableCell align="right">
                          Quantity
                        </TableCell>

                        <TableCell align="right">
                          Price
                        </TableCell>

                        <TableCell align="right">
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {billPreview.orders.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.name}
                          </TableCell>

                          <TableCell align="right">
                            {item.quantity}
                          </TableCell>

                          <TableCell align="right">
                            ${item.price}
                          </TableCell>

                          <TableCell align="right">
                            ${item.amount.toFixed(0)}
                          </TableCell>
                        </TableRow>
                      ))}

                      {billPreview.orders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            align="center"
                          >
                            No food orders
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
  <Card>
    <CardContent>
      <Typography
        variant="h6"
        className="mb-1 font-semibold"
      >
        Bill History
      </Typography>

      <Typography
        variant="body2"
        className="mb-4 text-gray-500"
      >
        {historyTable
          ? `Table ${historyTable}`
          : 'No table selected'}
      </Typography>

      <div className="space-y-3">
        {billHistory.length === 0 ? (
          <Typography
            variant="body2"
            className="text-gray-500"
          >
            No paid bills for this table
          </Typography>
        ) : (
          billHistory.map(history => (
            <Card
              key={history.id}
              variant="outlined"
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  className="font-semibold"
                >
                  {history.tableNumber}
                </Typography>

                <Typography
                  variant="caption"
                  className="text-gray-500"
                >
                  Paid at:{' '}
                  {new Date(history.paidAt).toLocaleString()}
                </Typography>

                <Divider className="my-2" />

                <Typography variant="body2">
                  Table Charge: ${history.tableCharge.toFixed(0)}
                </Typography>

                <Typography variant="body2">
                  Food & Beverages: ${history.foodTotal.toFixed(0)}
                </Typography>

                {history.memberApplied && (
                  <Typography
                    variant="body2"
                    className="text-blue-600"
                  >
                    Discount: -${history.discount.toFixed(0)}
                    {history.memberName
                      ? ` (${history.memberName})`
                      : ''}
                  </Typography>
                )}

                <Divider className="my-2" />

                {history.orders.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>

                    <span>
                      ${item.amount.toFixed(0)}
                    </span>
                  </div>
                ))}

                {history.orders.length === 0 && (
                  <Typography
                    variant="body2"
                    className="text-gray-500"
                  >
                    No food orders
                  </Typography>
                )}

                <Divider className="my-2" />

                <div className="flex justify-between">
                  <Typography className="font-bold">
                    Total
                  </Typography>

                  <Typography className="font-bold text-green-600">
                    ${history.total.toFixed(0)}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </CardContent>
  </Card>
</Grid>

      </Grid>

      <Dialog
        open={membershipDialogOpen}
        onClose={() => setMembershipDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Check Membership
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Member Name"
            value={memberName}
            sx={{ mt: 2 }}
            onChange={(e) =>
              setMemberName(
                e.target.value
              )
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setMembershipDialogOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleApplyMembership}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
