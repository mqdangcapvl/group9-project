import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, Chip } from '@mui/material';
import { CreditCard, Plus, Trash2, User } from 'lucide-react';
import { getMembers, addMember, deleteMember } from '../../api/membershipApi';

interface Member {
  id: number;
  name: string;
  phoneNumber: string;
  citizenId: string;
  joinDate: string;
  joinDateText: string;
  status: 'active' | 'inactive';
}

export function Membership() {
  const [members, setMembers] = useState<Member[]>([]);
  const [summary, setSummary] = useState({
    totalMembers: 0,
    activeMembers: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    phoneNumber: '',
    citizenId: '',
  });

  const fetchMembers = async () => {
    try {
      const data = await getMembers();

      setSummary(data.summary || {
        totalMembers: 0,
        activeMembers: 0,
      });

      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.phoneNumber || !newMember.citizenId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addMember(newMember);
      await fetchMembers();
      setOpenDialog(false);
      setNewMember({ name: '', phoneNumber: '', citizenId: '' });
    } catch (error: any) {
      alert(error.message || 'Cannot add member');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      await deleteMember(id);
      await fetchMembers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold">
          Membership Management
        </Typography>

        <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          Add Member
        </Button>
      </div>

      <Grid container spacing={3} className="mb-4">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Total Members</Typography>
                  <Typography variant="h5" className="font-bold">{summary.totalMembers}</Typography>
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
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Active Members</Typography>
                  <Typography variant="h5" className="font-bold">{summary.activeMembers}</Typography>
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
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Citizen ID</strong></TableCell>
              <TableCell><strong>Join Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {members.map(member => (
              <TableRow key={member.id} hover>
                <TableCell>#{member.id.toString().padStart(4, '0')}</TableCell>
                <TableCell><strong>{member.name}</strong></TableCell>
                <TableCell>{member.phoneNumber}</TableCell>
                <TableCell>{member.citizenId}</TableCell>
                <TableCell>{member.joinDateText || member.joinDate}</TableCell>
                <TableCell>
                  <Chip
                    label={member.status}
                    size="small"
                    className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error" onClick={() => handleDeleteMember(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField fullWidth label="Full Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            <TextField fullWidth label="Phone Number" value={newMember.phoneNumber} onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })} />
            <TextField fullWidth label="Citizen ID" value={newMember.citizenId} onChange={(e) => setNewMember({ ...newMember, citizenId: e.target.value })} />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700">Add Member</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}