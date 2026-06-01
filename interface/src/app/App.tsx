import { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { LayoutDashboard, DollarSign, Package, Users, Sofa, UtensilsCrossed, Receipt, Menu, LogOut, CreditCard } from 'lucide-react';

import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Salary } from './components/Salary';
import { Inventory } from './components/Inventory';
import { Employees } from './components/Employees';
import { Tables } from './components/Tables';
import { Food } from './components/Food';
import { Bill } from './components/Bill';
import { Membership } from './components/Membership';

import { ListItemButton } from '@mui/material';
import { ToastContainer } from 'react-toastify';

type Section = 'dashboard' | 'salary' | 'inventory' | 'employees' | 'tables' | 'food' | 'bill' | 'membership';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogin = (_username: string, _role: string) => {
  setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentSection('dashboard');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tables' as Section, label: 'Tables', icon: Sofa },
    { id: 'employees' as Section, label: 'Employees', icon: Users },
    { id: 'membership' as Section, label: 'Membership', icon: CreditCard },
    { id: 'food' as Section, label: 'Food & Beverage', icon: UtensilsCrossed },
    { id: 'bill' as Section, label: 'Billing', icon: Receipt },
    { id: 'salary' as Section, label: 'Salary', icon: DollarSign },
    { id: 'inventory' as Section, label: 'Inventory', icon: Package },
  ];

  const drawerWidth = 260;

  const drawer = (
    <div>
      <div className="p-6 bg-blue-600 text-white">
        <Typography variant="h6" className="font-bold">
          Billiards Club
        </Typography>
        <Typography variant="caption">
          Management System
        </Typography>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              setCurrentSection(item.id);
              setMobileOpen(false);
            }}
            className={`cursor-pointer hover:bg-gray-100 ${
              currentSection === item.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
            }`}
          >
            <ListItemIcon>
              <item.icon className={`w-5 h-5 ${currentSection === item.id ? 'text-blue-600' : 'text-gray-600'}`} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                className: currentSection === item.id ? 'font-semibold text-blue-600' : 'text-gray-700',
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  const renderSection = () => {
  switch (currentSection) {
    case 'dashboard':
      return <Dashboard />;

    case 'tables':
      return <Tables />;

    case 'salary':
      return <Salary />;

    case 'inventory':
      return <Inventory />;

    case 'employees':
      return <Employees />;

    case 'food':
      return <Food />;

    case 'bill':
      return <Bill />;

    case 'membership':
      return <Membership />;

    default:
      return <Tables />;
  }
};

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />
      <Box className="flex h-screen">
        <AppBar
          position="fixed"
          className="bg-white text-gray-800 shadow-sm"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" className="flex-grow font-semibold">
              {menuItems.find(item => item.id === currentSection)?.label}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
            bgcolor: '#f5f5f5',
            minHeight: '100vh',
          }}
        >
          {renderSection()}
        </Box>
      </Box>
    </>
  );
}