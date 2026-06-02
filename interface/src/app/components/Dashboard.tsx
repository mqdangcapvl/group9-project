import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { Users, Sofa, Package, Activity } from 'lucide-react';
import { getDashboardData } from '../../api/dashboardApi';

interface DashboardData {
  summary: {
    totalEmployees: number;
    totalTables: number;
    occupiedTables: number;
    availableTables: number;
    vipTables: number;
    vipOccupied: number;
    normalTables: number;
    normalOccupied: number;
    inventoryItems: number;
    foodItems: number;
    lowStockItems: number;
  };
  recentActivities: string[];
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setData(await getDashboardData());
      } catch (error: any) {
        setError(error.message || 'Cannot load dashboard');
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
    return <Typography color="error">{error || 'Dashboard data not found'}</Typography>;
  }

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
          <Typography variant="body2" className="text-gray-600 mb-1">{title}</Typography>
          <Typography variant="h5" className="font-semibold text-gray-900">{value}</Typography>
        </div>

        <div className={`ml-3 w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6">
        Dashboard
      </Typography>

      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Employees" value={data.summary.totalEmployees} icon={<Users className="w-6 h-6" />} color="bg-blue-600" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Tables" value={`${data.summary.occupiedTables}/${data.summary.totalTables}`} icon={<Sofa className="w-6 h-6" />} color="bg-green-600" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Inventory Items" value={data.summary.inventoryItems} icon={<Package className="w-6 h-6" />} color="bg-purple-600" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Food Items" value={data.summary.foodItems} icon={<Activity className="w-6 h-6" />} color="bg-orange-500" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="shadow-sm border border-gray-200">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                Recent Activity
              </Typography>

              {data.recentActivities.length === 0 ? (
                <Typography variant="body2" className="text-gray-500">
                  No recent activity
                </Typography>
              ) : (
                data.recentActivities.map((activity, index) => (
                  <Box key={index} className="flex justify-between border-b border-gray-200 py-2 last:border-b-0">
                    <Typography variant="body2">{activity}</Typography>
                    <Typography variant="caption" className="text-gray-500">now</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="shadow-sm border border-gray-200">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                Quick Stats
              </Typography>

              <Box className="space-y-3">
                <Box className="flex justify-between">
                  <Typography variant="body2">Available Tables</Typography>
                  <Typography variant="body2" className="text-green-600 font-semibold">{data.summary.availableTables}</Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">Occupied Tables</Typography>
                  <Typography variant="body2" className="text-red-600 font-semibold">{data.summary.occupiedTables}</Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">VIP Tables Occupied</Typography>
                  <Typography variant="body2">{data.summary.vipOccupied}/{data.summary.vipTables}</Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">Normal Tables Occupied</Typography>
                  <Typography variant="body2">{data.summary.normalOccupied}/{data.summary.normalTables}</Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2">Low Stock Items</Typography>
                  <Typography variant="body2" className="text-orange-600 font-semibold">{data.summary.lowStockItems}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}