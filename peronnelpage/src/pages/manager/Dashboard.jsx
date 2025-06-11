import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';

// Mock data for demonstration
const enrollmentData = [
  { month: 'Jan', enrollments: 65 },
  { month: 'Feb', enrollments: 59 },
  { month: 'Mar', enrollments: 80 },
  { month: 'Apr', enrollments: 81 },
  { month: 'May', enrollments: 56 },
  { month: 'Jun', enrollments: 55 },
];

const certificateData = [
  { name: 'Completed', value: 400 },
  { name: 'In Progress', value: 300 },
  { name: 'Not Started', value: 300 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const Dashboard = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting to ${format}`);
    handleExportClose();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manager Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportClick}
        >
          Export Report
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleExportClose}
        >
          <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
          <MenuItem onClick={() => handleExport('excel')}>Excel</MenuItem>
          <MenuItem onClick={() => handleExport('word')}>Word</MenuItem>
        </Menu>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Enrollments
              </Typography>
              <Typography variant="h4">1,234</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Certificates Issued
              </Typography>
              <Typography variant="h4">856</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Survey Participation
              </Typography>
              <Typography variant="h4">92%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h4">12</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enrollment Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Certificate Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={certificateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {certificateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 