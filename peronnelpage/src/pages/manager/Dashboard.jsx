import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Poll as PollIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';

// Mock data - sẽ được thay thế bằng dữ liệu thực từ API
const mockData = {
  enrollments: [
    { month: 'Jan', enrollments: 65, courses: 40, surveys: 25 },
    { month: 'Feb', enrollments: 59, courses: 35, surveys: 24 },
    { month: 'Mar', enrollments: 80, courses: 50, surveys: 30 },
    { month: 'Apr', enrollments: 81, courses: 52, surveys: 29 },
    { month: 'May', enrollments: 56, courses: 35, surveys: 21 },
    { month: 'Jun', enrollments: 55, courses: 34, surveys: 21 },
    { month: 'Jul', enrollments: 70, courses: 45, surveys: 25 },
    { month: 'Aug', enrollments: 90, courses: 60, surveys: 30 },
    { month: 'Sep', enrollments: 110, courses: 75, surveys: 35 },
    { month: 'Oct', enrollments: 95, courses: 65, surveys: 30 },
    { month: 'Nov', enrollments: 85, courses: 55, surveys: 30 },
    { month: 'Dec', enrollments: 100, courses: 65, surveys: 35 },
  ],
  
  contentDistribution: [
    { name: 'Courses', value: 45, color: '#0088FE' },
    { name: 'Blogs', value: 30, color: '#00C49F' },
    { name: 'Surveys', value: 25, color: '#FFBB28' },
  ],
  
  userActivity: [
    { name: 'Mon', visitors: 120, activeUsers: 80 },
    { name: 'Tue', visitors: 140, activeUsers: 95 },
    { name: 'Wed', visitors: 160, activeUsers: 110 },
    { name: 'Thu', visitors: 150, activeUsers: 105 },
    { name: 'Fri', visitors: 170, activeUsers: 120 },
    { name: 'Sat', visitors: 190, activeUsers: 130 },
    { name: 'Sun', visitors: 210, activeUsers: 150 },
  ],
  
  appointmentStatus: [
    { name: 'Completed', value: 63, color: '#4caf50' },
    { name: 'Pending', value: 22, color: '#ff9800' },
    { name: 'Cancelled', value: 15, color: '#f44336' },
  ]
};

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(mockData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalEnrollments: 1234,
    certificatesIssued: 856,
    surveyParticipation: 92,
    pendingReviews: 12,
    totalUsers: 2500,
    completedAppointments: 328,
    totalCourses: 45,
    totalBlogs: 72
  });

  useEffect(() => {
    // Mô phỏng tải dữ liệu khi component mount
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Thực tế sẽ gọi API ở đây
    // fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Thay thế bằng các API thực tế
      // const response = await axios.get('/api/manager/dashboard');
      // setData(response.data);
      // setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
    // fetchDashboardData();
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    // Thực hiện xuất báo cáo
    console.log(`Exporting to ${format}`);
    // Thực tế sẽ gọi API để xuất báo cáo
    // window.location.href = `/api/manager/reports/export?format=${format}`;
    handleExportClose();
  };

  // Card hiển thị thống kê với biểu tượng và phần trăm thay đổi
  const StatCard = ({ title, value, icon, change, color }) => (
    <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            backgroundColor: `${color}.main`, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        {change !== undefined && (
          <Chip 
            icon={change >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
            label={`${Math.abs(change).toFixed(1)}%`}
            color={change >= 0 ? 'success' : 'error'}
            size="small"
          />
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manager Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            sx={{ textTransform: 'none' }}
          >
            EXPORT
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('pdf')}>PDF Report</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Excel Spreadsheet</MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>CSV File</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Thẻ thống kê hàng đầu - tương tự như hình ảnh */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Enrollments" 
            value={stats.totalEnrollments} 
            icon={<SchoolIcon sx={{ color: 'white' }} />}
            change={5.2}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Certificates Issued" 
            value={stats.certificatesIssued} 
            icon={<AssignmentIcon sx={{ color: 'white' }} />}
            change={3.8}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Survey Participation" 
            value={`${stats.surveyParticipation}%`} 
            icon={<PollIcon sx={{ color: 'white' }} />}
            change={-1.4}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending Reviews" 
            value={stats.pendingReviews} 
            icon={<AssessmentIcon sx={{ color: 'white' }} />}
            change={-8.5}
            color="error"
          />
        </Grid>

        {/* Biểu đồ enrollment - làm cho nó lớn hơn, chiếm toàn bộ chiều rộng màn hình */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Enrollments & Content
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.enrollments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="enrollments" name="Total Enrollments" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="courses" name="Course Enrollments" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="surveys" name="Survey Participants" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Thống kê phụ - bố trí theo hàng ngang */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Content Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ width: '100%', mt: 2 }}>
                {data.contentDistribution.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: entry.color,
                        display: 'inline-block',
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{entry.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{entry.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Weekly User Activity
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.userActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  name="Total Visitors" 
                  stroke="#1976d2" 
                  fill="#1976d2" 
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Active Users" 
                  stroke="#4caf50" 
                  fill="#4caf50" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Appointment Status
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.appointmentStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.appointmentStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ width: '100%', mt: 2 }}>
                {data.appointmentStatus.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: entry.color,
                        display: 'inline-block',
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{entry.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{entry.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 