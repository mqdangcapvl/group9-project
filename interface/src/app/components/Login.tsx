import { useState } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { Lock } from 'lucide-react';
import bgImage from '../../assets/billards-bg.jpg';
import { login } from '../../api/loginApi';

interface LoginProps {
  onLogin: (
    username: string,
    role: string
  ) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await login(
        username,
        password
      );

      onLogin(
        data.username,
        data.role
      );
    } catch (error: any) {

      alert(
        error.message ||
        'Login failed'
      );
      
    } finally {
      setLoading(false);
    }
  };

  return (

    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >

      <div className="absolute inset-0 bg-black/40"></div>

      <Card className="relative z-10 w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 md:p-10">
          <Box className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-md">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <Typography
              variant="h4"
              component="h1"
              className="font-bold text-gray-800 text-center"
            >
              DatMeo Billiards Club
            </Typography>

            <Typography
              variant="body2"
              className="text-gray-600 mt-2 text-center"
            >
              Management System
            </Typography>

          </Box>

          <form onSubmit={handleSubmit}>

            <Box className="flex flex-col gap-5">
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                className="!bg-blue-600 hover:!bg-blue-700 !py-3 !mt-7 !rounded-xl !shadow-lg"
              >
                {loading
                  ? 'Logging in...'
                  : 'Login'}
              </Button>
            </Box>
          </form>

          <Typography
            variant="caption"
            className="text-gray-500 text-center block"
            sx={{ mt: 2 }}
          >
            Welcome back!
          </Typography>

        </CardContent>
      </Card>
    </div>
  );
}