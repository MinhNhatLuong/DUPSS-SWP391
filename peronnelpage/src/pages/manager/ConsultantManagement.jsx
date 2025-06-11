import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Mock data for demonstration
const mockConsultants = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    topics: ['Web Development', 'React', 'Node.js'],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    topics: ['UI/UX Design', 'Figma', 'Adobe XD'],
  },
];

const availableTopics = [
  'Web Development',
  'React',
  'Node.js',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Python',
  'Data Science',
  'Machine Learning',
  'Cloud Computing',
  'DevOps',
  'Mobile Development',
];

const ConsultantManagement = () => {
  const [consultants, setConsultants] = useState(mockConsultants);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const handleEdit = (consultant) => {
    setSelectedConsultant(consultant);
    setSelectedTopics(consultant.topics);
    setOpenDialog(true);
  };

  const handleDelete = (consultantId) => {
    setConsultants(consultants.filter((c) => c.id !== consultantId));
  };

  const handleSave = () => {
    if (selectedConsultant) {
      setConsultants(
        consultants.map((c) =>
          c.id === selectedConsultant.id
            ? { ...c, topics: selectedTopics }
            : c
        )
      );
    }
    setOpenDialog(false);
    setSelectedConsultant(null);
    setSelectedTopics([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consultant Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Topics</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultants.map((consultant) => (
              <TableRow key={consultant.id}>
                <TableCell>{consultant.name}</TableCell>
                <TableCell>{consultant.email}</TableCell>
                <TableCell>
                  {consultant.topics.map((topic) => (
                    <Chip
                      key={topic}
                      label={topic}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(consultant)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(consultant.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Consultant Topics</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Autocomplete
              multiple
              options={availableTopics}
              value={selectedTopics}
              onChange={(event, newValue) => setSelectedTopics(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Topics"
                  placeholder="Select topics"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultantManagement; 