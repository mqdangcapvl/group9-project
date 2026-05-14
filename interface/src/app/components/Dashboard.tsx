import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Users,
  Sofa,
  Package,
  Activity,
} from 'lucide-react';
import { getDashboardData } from '../../api/dashboardApi';

interface TableItem {
  id: number;
  type: string;
  status: string;
}

interface EmployeeItem {
  id: number;
  name: string;
  type: string;
}

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  minStock: number;
}

interface FoodItem {
  id: number;
  name: string;
  quantity: number;
}

interface OrderItem {
  tableNumber: string;
  name: string;
  quantity: number;
}

interface DashboardData {
  tables: TableItem[];
  employees: EmployeeItem[];
  inventory: InventoryItem[];
  foods: FoodItem[];
  orders: OrderItem[];
}

export function Dashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result =
          await getDashboardData();

        setData(result);
      } catch (error: any) {
        setError(
          error.message || 'Cannot load dashboard'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography color="error">
        {error || 'Dashboard data not found'}
      </Typography>
    );
  }

  const totalTables =
    data.tables.length;

  const occupiedTables =
    data.tables.filter(
      table => table.status === 'occupied'
    ).length;

  const vipTables =
    data.tables.filter(
      table => table.type === 'VIP'
    );

  const vipOccupied =
    vipTables.filter(
      table => table.status === 'occupied'
    ).length;

  const normalTables =
    data.tables.filter(
      table => table.type !== 'VIP'
    );

  const normalOccupied =
    normalTables.filter(
      table => table.status === 'occupied'
    ).length;

  const lowStockItems =
    data.inventory.filter(
      item => item.quantity <= item.minStock
    );

  const inventoryItems =
    data.inventory.length;

  const recentActivities = [
    ...data.tables
      .filter(table => table.status === 'occupied')
      .slice(0, 3)
      .map(table => `Table ${table.id} started`),

    ...data.orders
      .slice(0, 3)
      .map(order => `Food order - Table ${order.tableNumber}`),

    ...lowStockItems
      .slice(0, 3)
      .map(item => `${item.name} low stock`),
  ].slice(0, 5);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="flex items-center justify-between">
        <div>
          <Typography
            variant="body2"
            className="text-gray-600 mb-1"
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            className="font-semibold text-gray-900"
          >
            {value}
          </Typography>
        </div>

        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography
        variant="h4"
        className="font-bold mb-6"
      >
        Dashboard
      </Typography>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={data.employees.length}
            icon={<Users className="w-6 h-6"/>}
            color="bg-blue-600"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tables"
            value={`${occupiedTables}/${totalTables}`}
            icon={<Sofa className="w-6 h-6" />}
            color="bg-green-600"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inventory Items"
            value={inventoryItems}
            icon={<Package className="w-6 h-6" />}
            color="bg-purple-600"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Food Items"
            value={data.foods.length}
            icon={<Activity className="w-6 h-6" />}
            color="bg-orange-500"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="shadow-sm border border-gray-200">
            <CardContent>
              <Typography
                variant="h6"
                className="font-semibold mb-3"
              >
                Recent Activity
              </Typography>

              {recentActivities.length === 0 ? (
                <Typography
                  variant="body2"
                  className="text-gray-500"
                >
                  No recent activity
                </Typography>
              ) : (
                recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    className="flex justify-between border-b border-gray-200 py-2 last:border-b-0"
                  >
                    <Typography variant="body2">
                      {activity}
                    </Typography>

                    <Typography
                      variant="caption"
                      className="text-gray-500"
                    >
                      now
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="shadow-sm border border-gray-200">
            <CardContent>
              <Typography
                variant="h6"
                className="font-semibold mb-3"
              >
                Quick Stats
              </Typography>

              <Box className="space-y-3">
                <Box className="flex justify-between">
                  <Typography variant="body2">
                    Available Tables
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-green-600 font-semibold"
                  >
                    {totalTables - occupiedTables}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">
                    Occupied Tables
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-red-600 font-semibold"
                  >
                    {occupiedTables}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">
                    VIP Tables Occupied
                  </Typography>
                  <Typography variant="body2">
                    {vipOccupied}/{vipTables.length}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">
                    Normal Tables Occupied
                  </Typography>
                  <Typography variant="body2">
                    {normalOccupied}/{normalTables.length}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-orange-600 font-semibold"
                  >
                    {lowStockItems.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
