import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardHeader,
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
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
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
  Cell
} from 'recharts';
import { 
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Article as ArticleIcon,
  Poll as PollIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FactCheck as FactCheckIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // State for data from API
  const [staffCount, setStaffCount] = useState(0);
  const [consultantCount, setConsultantCount] = useState(0);
  const [surveysStats, setSurveysStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [coursesStats, setCoursesStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [blogsStats, setBlogsStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [surveysCreatedDaily, setSurveysCreatedDaily] = useState([]);
  const [coursesCreatedMonthly, setCoursesCreatedMonthly] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [newReportsCount, setNewReportsCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Using Promise.all to fetch data in parallel
      const [
        staffResponse,
        consultantsResponse,
        surveysAllResponse,
        surveysPendingResponse,
        coursesAllResponse,
        coursesPendingResponse,
        blogsAllResponse,
        blogsPendingResponse,
        activitiesResponse,
        reportsResponse
      ] = await Promise.all([
        axios.get('/api/manager/staff'),
        axios.get('/api/manager/consultants'),
        axios.get('/api/manager/surveys/all'),
        axios.get('/api/manager/surveys/pending'),
        axios.get('/api/manager/courses/all'),
        axios.get('/api/manager/courses/pending'),
        axios.get('/api/manager/blogs/all'),
        axios.get('/api/manager/blogs/pending'),
        axios.get('/api/manager/activities?limit=10'),
        axios.get('/api/manager/reports')
      ]);

      // Process staff & consultants count
      setStaffCount(staffResponse.data.length);
      setConsultantCount(consultantsResponse.data.length);

      // Process surveys stats
      const allSurveys = surveysAllResponse.data;
      const pendingSurveys = surveysPendingResponse.data;
      setSurveysStats({
        pending: pendingSurveys.length,
        approved: allSurveys.filter(s => s.status === 'APPROVED').length,
        rejected: allSurveys.filter(s => s.status === 'REJECTED').length
      });

      // Process courses stats
      const allCourses = coursesAllResponse.data;
      const pendingCourses = coursesPendingResponse.data;
      setCoursesStats({
        pending: pendingCourses.length,
        approved: allCourses.filter(c => c.status === 'APPROVED').length,
        rejected: allCourses.filter(c => c.status === 'REJECTED').length
      });

      // Process blogs stats
      const allBlogs = blogsAllResponse.data;
      const pendingBlogs = blogsPendingResponse.data;
      setBlogsStats({
        pending: pendingBlogs.length,
        approved: allBlogs.filter(b => b.status === 'APPROVED').length,
        rejected: allBlogs.filter(b => b.status === 'REJECTED').length
      });

      // Process activities
      setRecentActivities(activitiesResponse.data);

      // Process reports count
      setNewReportsCount(reportsResponse.data.filter(r => r.status === 'NEW').length);

      // Generate surveys created daily data for last 30 days
      generateSurveysCreatedDailyData(allSurveys);

      // Generate courses created monthly data for last 6 months
      generateCoursesCreatedMonthlyData(allCourses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate daily survey creation data for the last 30 days
  const generateSurveysCreatedDailyData = (surveys) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'dd/MM'),
        fullDate: date,
        count: 0
      };
    }).reverse();

    // Count surveys created on each day
    surveys.forEach(survey => {
      const createdAt = parseISO(survey.createdAt);
      const dayIndex = last30Days.findIndex(day => 
        format(day.fullDate, 'dd/MM') === format(createdAt, 'dd/MM')
      );
      if (dayIndex !== -1) {
        last30Days[dayIndex].count++;
      }
    });

    setSurveysCreatedDaily(last30Days.map(day => ({
      date: day.date,
      count: day.count
    })));
  };

  // Generate monthly course creation data for the last 6 months
  const generateCoursesCreatedMonthlyData = (courses) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM', { locale: vi }),
        fullDate: date,
        count: 0
      };
    }).reverse();

    // Count courses created in each month
    courses.forEach(course => {
      const createdAt = parseISO(course.createdAt);
      const monthIndex = last6Months.findIndex(month => 
        format(month.fullDate, 'MM/yyyy') === format(createdAt, 'MM/yyyy')
      );
      if (monthIndex !== -1) {
        last6Months[monthIndex].count++;
      }
    });

    setCoursesCreatedMonthly(last6Months.map(month => ({
      month: month.month,
      count: month.count
    })));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    console.log(`Exporting to ${format}`);
    handleExportClose();
  };

  const handleViewReports = () => {
    navigate('/manager/reports');
  };

  // Card component for displaying counts with icons
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" variant="body1" fontWeight={500}>
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
            {React.cloneElement(icon, { sx: { color: 'white' } })}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  // Card component for displaying status statistics
  const StatusCard = ({ title, stats, icon, colors, total }) => (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" variant="body1" fontWeight={500}>
            {title}
          </Typography>
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            backgroundColor: theme.palette.primary.main, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { color: 'white' } })}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {total}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
          <Chip 
            icon={<CheckIcon />} 
            label={`${stats.approved} Approved`} 
            color="success" 
            variant="outlined"
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          />
          <Chip 
            icon={<CloseIcon />} 
            label={`${stats.rejected} Rejected`} 
            color="error" 
            variant="outlined"
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          />
          <Chip 
            icon={<PendingIcon />} 
            label={`${stats.pending} Pending`} 
            color="warning" 
            variant="outlined"
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Add the PendingIcon component that was missing
  const PendingIcon = () => (
    <Box
      component="span"
      sx={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontWeight: 'bold' }}>...</span>
    </Box>
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

      <Grid container spacing={3}>
        {/* Staff and Consultant Count Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Staff" 
            value={staffCount} 
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Consultants" 
            value={consultantCount} 
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>

        {/* Reports Quick-Link Card */}
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge badgeContent={newReportsCount} color="error" 
                    sx={{ '& .MuiBadge-badge': { fontSize: '1rem', height: '1.5rem', minWidth: '1.5rem' } }}>
                    <FactCheckIcon sx={{ fontSize: '2rem', color: theme.palette.warning.main, mr: 2 }} />
                  </Badge>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      New Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newReportsCount} reports require your attention
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="warning" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleViewReports}
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Status Cards */}
        <Grid item xs={12} md={4}>
          <StatusCard 
            title="Surveys" 
            stats={surveysStats} 
            icon={<PollIcon />}
            colors={{
              approved: 'success',
              rejected: 'error',
              pending: 'warning'
            }}
            total={surveysStats.approved + surveysStats.rejected + surveysStats.pending}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatusCard 
            title="Courses" 
            stats={coursesStats} 
            icon={<SchoolIcon />}
            colors={{
              approved: 'success',
              rejected: 'error',
              pending: 'warning'
            }}
            total={coursesStats.approved + coursesStats.rejected + coursesStats.pending}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatusCard 
            title="Blogs" 
            stats={blogsStats} 
            icon={<ArticleIcon />}
            colors={{
              approved: 'success',
              rejected: 'error',
              pending: 'warning'
            }}
            total={blogsStats.approved + blogsStats.rejected + blogsStats.pending}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Surveys Created (Last 30 Days)
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={surveysCreatedDaily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Surveys Created" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Courses Created (Last 6 Months)
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={coursesCreatedMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Courses Created" 
                  stroke={theme.palette.success.main} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Manager Activities
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Target ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(parseISO(activity.timestamp), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{activity.userName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.type} 
                            size="small"
                            color={
                              activity.type === 'COURSE' ? 'primary' :
                              activity.type === 'BLOG' ? 'secondary' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.action}
                            size="small"
                            color={
                              activity.action === 'APPROVE' ? 'success' :
                              activity.action === 'REJECT' ? 'error' :
                              'default'
                            }
                            icon={activity.action === 'APPROVE' ? <CheckIcon /> : <CloseIcon />}
                          />
                        </TableCell>
                        <TableCell>{activity.targetId}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No recent activities
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 