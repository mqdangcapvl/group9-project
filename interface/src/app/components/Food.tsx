import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';

import {
  UtensilsCrossed,
  Plus,
  Trash2,
} from 'lucide-react';

import { toast } from 'react-toastify';

import {
  getFoods,
  getOrders,
  addFoodOrder,
} from '../../api/foodApi';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  tableNumber: string;
  items: {
    food: FoodItem;
    quantity: number;
  }[];
  timestamp: string;
}

export function Food() {
  const [menu, setMenu] =
    useState<FoodItem[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedTable, setSelectedTable] =
    useState('');

  const [selectedFood, setSelectedFood] =
    useState<number>(0);

  const [quantity, setQuantity] =
    useState('');

  const fetchData = async () => {
    try {
      const foodData =
        await getFoods();

      const orderData =
        await getOrders();

      setMenu(
        Array.isArray(foodData)
          ? foodData
          : []
      );

      const groupedOrders =
        (Array.isArray(orderData) ? orderData : [])
          .reduce(
            (result: Order[], item: any, index: number) => {
              const existingOrder =
                result.find(
                  order =>
                    order.tableNumber === item.tableNumber
                );

              const foodItem: FoodItem = {
                id: index + 1,
                name: item.name,
                category: '',
                price: Number(item.price),
                quantity: 0,
              };

              if (existingOrder) {
                existingOrder.items.push({
                  food: foodItem,
                  quantity: Number(item.quantity),
                });
              } else {
                result.push({
                  id: result.length + 1,
                  tableNumber: item.tableNumber,
                  items: [
                    {
                      food: foodItem,
                      quantity: Number(item.quantity),
                    },
                  ],
                  timestamp: '',
                });
              }

              return result;
            },
            []
          );

      setOrders(groupedOrders);

    } catch (error: any) {
      alert(
        error.message || 'Cannot load food data'
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOrder = async () => {
    if (!selectedTable || !selectedFood) {
      alert('Please select table and food');
      return;
    }

    const food =
      menu.find(
        item => item.id === selectedFood
      );

    if (!food) return;
    const orderQuantity =
      quantity === ''
        ? 0
        : Number(quantity);

    if (orderQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }


    try {
      await addFoodOrder({
        tableNumber: selectedTable,
        name: food.name,
        quantity: orderQuantity,
        price: food.price,
      });

      await fetchData();

      toast.success(
        `${orderQuantity}x ${food.name} added to ${selectedTable}`
      );

      setOpenDialog(false);
      setSelectedTable('');
      setSelectedFood(0);
      setQuantity('');

    } catch (error: any) {
      alert(
        error.message || 'Cannot add order'
      );
    }
  };

  const removeOrder = (orderId: number) => {
    setOrders(
      orders.filter(
        order => order.id !== orderId
      )
    );
  };

  const categories = [
    ...Array.from(
      new Set(
        menu.map(item => item.category)
      )
    ),
  ];

  const tables = [
    'VIP-1',
    'VIP-2',
    'VIP-3',
    'VIP-4',
    'VIP-5',
    'VIP-6',
    'A-7',
    'A-8',
    'A-9',
    'A-10',
    'A-11',
    'B-12',
    'B-13',
    'B-14',
    'B-15',
    'B-16',
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography
          variant="h4"
          className="font-bold"
        >
          Food & Beverage Orders
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpenDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Order
        </Button>
      </div>

      <Grid
        container
        spacing={3}
        className="mb-6"
      >
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                className="mb-4 font-semibold"
              >
                Menu
              </Typography>

              <Grid container spacing={2}>
                {categories.map(category => (
                  <Grid
                    item
                    xs={12}
                    key={category}
                  >
                    <Typography
                      variant="subtitle2"
                      className="font-semibold text-gray-700 mb-2"
                    >
                      {category}
                    </Typography>

                    <div className="grid grid-cols-2 gap-2">
                      {menu
                        .filter(
                          item =>
                            item.category === category
                        )
                        .map(item => (
                          <Card
                            key={item.id}
                            variant="outlined"
                            className="p-2"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <Typography
                                  variant="body2"
                                  className="font-medium"
                                >
                                  {item.name}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  className="text-gray-600"
                                >
                                  ${item.price}
                                </Typography>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                className="mb-4 font-semibold"
              >
                Active Orders
              </Typography>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />

                  <Typography variant="body2">
                    No active orders
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <Card
                      key={order.id}
                      variant="outlined"
                    >
                      <CardContent>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Typography
                              variant="subtitle1"
                              className="font-semibold"
                            >
                              {order.tableNumber}
                            </Typography>

                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              {order.timestamp || 'Active'}
                            </Typography>
                          </div>

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              removeOrder(order.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>

                        <List dense>
                          {order.items.map((item, idx) => (
                            <ListItem
                              key={idx}
                              className="px-0"
                            >
                              <ListItemText
                                primary={`${item.quantity}x ${item.food.name}`}
                                secondary={`$${item.food.price * item.quantity}`}
                              />
                            </ListItem>
                          ))}
                        </List>

                        <Typography
                          variant="body2"
                          className="font-semibold text-right mt-2"
                        >
                          Total: $
                          {order.items.reduce(
                            (sum, item) =>
                              sum +
                              (
                                item.food.price *
                                item.quantity
                              ),
                            0
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Food Order
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-2">
            <FormControl
              fullWidth
              sx={{ mt: 3 }}
            >
              <InputLabel>
                Table Number
              </InputLabel>

              <Select
                value={selectedTable}
                label="Table Number"
                onChange={(e) =>
                  setSelectedTable(
                    e.target.value
                  )
                }
              >
                {tables.map(table => (
                  <MenuItem
                    key={table}
                    value={table}
                  >
                    {table}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              sx={{ mt: 3 }}
            >
              <InputLabel>
                Food Item
              </InputLabel>

              <Select
                value={selectedFood}
                label="Food Item"
                onChange={(e) =>
                  setSelectedFood(
                    Number(e.target.value)
                  )
                }
              >
                {menu.map(item => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} - ${item.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="text"
              label="Quantity"
              value={quantity}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              sx={{ mt: 3 }}
              onChange={(e) =>
                setQuantity(
                  e.target.value.replace(/\D/g, '')
                )
              }
            />
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
            onClick={handleAddOrder}
            className="bg-blue-600"
          >
            Add Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
