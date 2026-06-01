import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { Circle, Clock, DollarSign } from 'lucide-react';
import { getTables, startTable, endTable } from '../../api/tablesApi';

interface BilliardTable {
  id: number;
  number: string;
  type: 'VIP' | 'NORMAL_A' | 'NORMAL_B';
  status: 'available' | 'occupied';
  duration: number;
  pricePerHour: number;
}

export function Tables() {

  const [tables, setTables] =
    useState<BilliardTable[]>([]);

  const loadTables = async () => {

    try {

      const data =
        await getTables();

      setTables(data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    loadTables();

    const interval =
      setInterval(() => {

        loadTables();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, []);

  const handleStartTable = async (
    id: number
  ) => {

    try {

      await startTable(id);

      await loadTables();

    } catch (error) {

      console.log(error);
    }
  };

  const handleEndTable = async (
    id: number
  ) => {

    try {

      await endTable(id);

      await loadTables();

    } catch (error) {

      console.log(error);
    }
  };

  const vipTables =
    tables.filter(
      t => t.type === 'VIP'
    );

  const normalATables =
    tables.filter(
      t => t.type === 'NORMAL_A'
    );

  const normalBTables =
    tables.filter(
      t => t.type === 'NORMAL_B'
    );

  const vipOccupied =
    vipTables.filter(
      t => t.status === 'occupied'
    ).length;

  const normalAOccupied =
    normalATables.filter(
      t => t.status === 'occupied'
    ).length;

  const normalBOccupied =
    normalBTables.filter(
      t => t.status === 'occupied'
    ).length;

  const TableCard = ({
    table,
  }: {
    table: BilliardTable;
  }) => (

    <Card className={`h-full ${table.status === 'occupied' ? 'border-2 border-red-300' : 'border-2 border-green-300'}`}>

      <CardContent>

        <div className="flex items-start justify-between mb-3">

          <Typography variant="h6" className="font-bold">
            {table.number}
          </Typography>

          <Circle
            className={`w-4 h-4 ${table.status === 'available' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
          />

        </div>

        <Chip
          label={
            table.status === 'available'
              ? 'Available'
              : 'Occupied'
          }
          size="small"
          className={`mb-3 ${
            table.status === 'available'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        />

        <Typography
          variant="body2"
          className="mb-2 text-gray-600"
        >
          ${table.pricePerHour}/hour
        </Typography>

        {table.status === 'occupied' && (

          <div className="space-y-2">

            <div className="flex items-center gap-2 text-sm">

              <Clock className="w-4 h-4 text-gray-500" />

              <span>
                {table.duration} min
              </span>

            </div>

            <div className="flex items-center gap-2 text-sm">

              <DollarSign className="w-4 h-4 text-gray-500" />

              <span>
                $
                {(
                  (table.duration / 60) *
                  table.pricePerHour
                ).toFixed(0)}
              </span>

            </div>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              color="error"
              className="mt-2"
              onClick={() =>
                handleEndTable(table.id)
              }
            >
              End Session
            </Button>

          </div>

        )}

        {table.status === 'available' && (

          <Button
            variant="contained"
            size="small"
            fullWidth
            className="mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              handleStartTable(table.id)
            }
          >
            Start Session
          </Button>

        )}

      </CardContent>

    </Card>
  );

  return (

    <div>

      <Typography variant="h4" className="mb-6 font-bold">
        Table Management
      </Typography>

      <div className="mb-8">

        <div className="flex items-center justify-between mb-4">

          <Typography variant="h5" className="font-semibold text-purple-600">
            VIP Tables
          </Typography>

          <Chip
            label={`${vipOccupied}/${vipTables.length} Occupied`}
            className="bg-purple-100 text-purple-700"
          />

        </div>

        <Grid container spacing={3}>

          {vipTables.map((table) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={table.id}>
              <TableCard table={table} />
            </Grid>
          ))}

        </Grid>

      </div>

      <div className="mb-8">

        <div className="flex items-center justify-between mb-4">

          <Typography variant="h5" className="font-semibold text-blue-600">
            Normal A Tables
          </Typography>

          <Chip
            label={`${normalAOccupied}/${normalATables.length} Occupied`}
            className="bg-blue-100 text-blue-700"
          />

        </div>

        <Grid container spacing={3}>

          {normalATables.map((table) => (

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={table.id}>
              <TableCard table={table} />
            </Grid>

          ))}

        </Grid>

      </div>

      <div>

        <div className="flex items-center justify-between mb-4">

          <Typography variant="h5" className="font-semibold text-green-600">
            Normal B Tables
          </Typography>

          <Chip
            label={`${normalBOccupied}/${normalBTables.length} Occupied`}
            className="bg-green-100 text-green-700"
          />

        </div>

        <Grid container spacing={3}>

          {normalBTables.map((table) => (

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={table.id}>
              <TableCard table={table} />
            </Grid>

          ))}

        </Grid>

      </div>

    </div>
  );
}