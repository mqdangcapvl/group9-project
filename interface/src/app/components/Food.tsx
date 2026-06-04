import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, List, ListItem, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { CheckCircle, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'react-toastify';
import { addFoodOrder, deleteOrder, getFoods, getOrders, markOrderDone } from '../../api/foodApi';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity?: number;
  unit?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  amount?: number;
  status?: string;
}

interface OrderGroup {
  id: number;
  tableNumber: string;
  items: OrderItem[];
  total?: number;
  status?: string;
}

export function Food() {
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedFood, setSelectedFood] = useState(0);
  const [quantity, setQuantity] = useState('');

  const tables = ['VIP-1', 'VIP-2', 'VIP-3', 'VIP-4', 'VIP-5', 'VIP-6', 'A-7', 'A-8', 'A-9', 'A-10', 'A-11', 'B-12', 'B-13', 'B-14', 'B-15', 'B-16'];

  const fetchData = async () => {
    const foodData = await getFoods();
    const orderData = await getOrders();
    setMenu(Array.isArray(foodData) ? foodData : []);
    setOrders(Array.isArray(orderData) ? orderData : []);
  };

  useEffect(() => {
    fetchData().catch((error) => alert(error.message || 'Cannot load food data'));
  }, []);

  const handleAddOrder = async () => {
    const food = menu.find(item => item.id === selectedFood);

    if (!selectedTable || !food || !quantity) {
      alert('Please select table, food and quantity');
      return;
    }

    try {
      await addFoodOrder({
        tableNumber: selectedTable,
        name: food.name,
        quantity: Number(quantity),
        price: food.price,
      });

      await fetchData();
      toast.success('Order added');

      setOpenDialog(false);
      setSelectedTable('');
      setSelectedFood(0);
      setQuantity('');
    } catch (error: any) {
      alert(error.message || 'Cannot add order');
    }
  };
  const handleMarkOrderDone = async (tableNumber: string) => {
    try {
      await markOrderDone(tableNumber);
      await fetchData();
      toast.success('Order marked as done');
    } catch (error: any) {
      alert(error.message || 'Cannot mark order as done');
    }
  };

  const handleDeleteOrder = async (tableNumber: string) => {
    if (!confirm(`Delete all orders for table ${tableNumber}?`)) {
      return;
    }

    try {
      await deleteOrder(tableNumber);
      await fetchData();
      toast.success('Order deleted');
    } catch (error: any) {
      alert(error.message || 'Cannot delete order');
    }
  };

  const categories = Array.from(new Set(menu.map(item => item.category)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">Food & Beverage Orders</Typography>
        <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenDialog(true)}>Add Order</Button>
      </div>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4 font-semibold">Menu</Typography>

              <Grid container spacing={2}>
                {categories.map(category => (
                  <Grid size={12} key={category}>
                    <Typography variant="subtitle2" className="font-semibold mb-2">{category}</Typography>

                    <div className="grid grid-cols-2 gap-2">
                      {menu.filter(item => item.category === category).map(item => (
                        <Card key={item.id} variant="outlined" className="p-2">
                          <Typography variant="body2" className="font-medium">{item.name}</Typography>
                          <Typography variant="caption" className="text-gray-600">
                            ${item.price}
                            {item.quantity !== undefined ? ` - ${item.quantity} ${item.unit || ''}` : ''}
                          </Typography>
                        </Card>
                      ))}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4 font-semibold">Active Orders</Typography>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <Typography variant="body2">No active orders</Typography>
                </div>
              ) : (
                orders.map(order => {
                  const isDone = (order.items || []).length > 0 &&
                    (order.items || []).every(item => item.status === 'DONE');

                  return (
                    <Card key={order.id || order.tableNumber} variant="outlined" className="mb-3">
                      <CardContent>
                        <div className="flex items-center justify-between gap-3">
                          <Typography variant="subtitle1" className="font-semibold">
                            {order.tableNumber}
                          </Typography>

                          <div className="flex gap-2">
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircle size={16} />}
                              disabled={isDone}
                              onClick={() => handleMarkOrderDone(order.tableNumber)}
                            >
                              Done
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Trash2 size={16} />}
                              onClick={() => handleDeleteOrder(order.tableNumber)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <List dense>
                          {(order.items || []).map((item, index) => (
                            <ListItem key={index} className="px-0">
                              <ListItemText
                                primary={`${item.quantity}x ${item.name}`}
                                secondary={`$${item.amount ?? item.price * item.quantity}${item.status ? ` - ${item.status}` : ''}`}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {order.total !== undefined && (
                          <Typography variant="body2" className="font-semibold text-right">
                            Total: ${order.total}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Food Order</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Table Number</InputLabel>
            <Select value={selectedTable} label="Table Number" onChange={(e) => setSelectedTable(e.target.value)}>
              {tables.map(table => <MenuItem key={table} value={table}>{table}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Food Item</InputLabel>
            <Select value={selectedFood} label="Food Item" onChange={(e) => setSelectedFood(Number(e.target.value))}>
              {menu.map(item => <MenuItem key={item.id} value={item.id}>{item.name} - ${item.price}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField fullWidth label="Quantity" value={quantity} sx={{ mt: 3 }} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOrder}>Add Order</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}