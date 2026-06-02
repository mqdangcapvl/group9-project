import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { Package, Plus, AlertCircle } from 'lucide-react';
import { getInventory, addInventoryItem } from '../../api/inventoryApi';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  status: string;
  totalValue: number;
}

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    minStock: '',
    price: '',
  });

  const onlyDigits = (value: string) => value.replace(/\D/g, '');
  const toNumber = (value: string) => value === '' ? 0 : Number(value);

  const fetchInventory = async () => {
    try {
      const data = await getInventory();

      setSummary(data.summary || {
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0,
      });

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error: any) {
      alert(error.message || 'Cannot load inventory');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addInventoryItem({
        name: newItem.name,
        category: newItem.category,
        quantity: toNumber(newItem.quantity),
        unit: newItem.unit,
        minStock: toNumber(newItem.minStock),
        price: toNumber(newItem.price),
      });

      await fetchInventory();
      setOpenDialog(false);

      setNewItem({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        minStock: '',
        price: '',
      });
    } catch (error: any) {
      alert(error.message || 'Cannot add inventory item');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">
          Inventory Management
        </Typography>

        <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          Add Item
        </Button>
      </div>

      <Grid container spacing={3} className="mb-4">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Total Items</Typography>
                  <Typography variant="h5" className="font-bold">{summary.totalItems}</Typography>
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
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Low Stock Items</Typography>
                  <Typography variant="h5" className="font-bold">{summary.lowStockItems}</Typography>
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
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Total Value</Typography>
                  <Typography variant="h5" className="font-bold">${summary.totalValue.toLocaleString()}</Typography>
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
              <TableCell><strong>Item Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell align="right"><strong>Quantity</strong></TableCell>
              <TableCell align="right"><strong>Min Stock</strong></TableCell>
              <TableCell align="right"><strong>Price</strong></TableCell>
              <TableCell align="right"><strong>Total Value</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} hover>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                <TableCell align="right">{item.minStock} {item.unit}</TableCell>
                <TableCell align="right">${item.price}</TableCell>
                <TableCell align="right">${item.totalValue.toLocaleString()}</TableCell>
                <TableCell align="center">
                  {item.status === 'Low Stock' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      In Stock
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField fullWidth label="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <TextField fullWidth label="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Quantity" value={newItem.quantity} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={(e) => setNewItem({ ...newItem, quantity: onlyDigits(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Unit" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Min Stock" value={newItem.minStock} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={(e) => setNewItem({ ...newItem, minStock: onlyDigits(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Price" value={newItem.price} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={(e) => setNewItem({ ...newItem, price: onlyDigits(e.target.value) })} />
              </Grid>
            </Grid>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" className="bg-blue-600">Add Item</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}