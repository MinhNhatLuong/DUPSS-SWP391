import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  CircularProgress,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { format, parseISO, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';
import { getAccessToken, isAuthenticated } from '../../utils/auth';

// Remove hardcoded URL
// const API_BASE_URL = 'http://localhost:8080';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffCount, setStaffCount] = useState(0);
  const [consultantCount, setConsultantCount] = useState(0);
  const [blogsCount, setBlogsCount] = useState(0);
  const [surveysCount, setSurveysCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);
  
  // Function to check if user is authenticated - not needed as we now use isAuthenticated from auth.js
  // const checkAuth = () => {
  //   const token = getAuthToken();
  //   if (!token) {
  //     console.warn('No authentication token found. Redirecting to login.');
  //     navigate('/login');
  //     return false;
  //   }
  //   
  //   try {
  //     // Basic validation: check if token is expired
  //     // This is a simple check - JWT validation should be done on server
  //     const base64Url = token.split('.')[1];
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
  //       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  //     }).join(''));
  //     
  //     const { exp } = JSON.parse(jsonPayload);
  //     const expired = Date.now() >= exp * 1000;
  //     
  //     if (expired) {
  //       console.warn('Token expired. Redirecting to login.');
  //       localStorage.removeItem('token');
  //       localStorage.removeItem('accessToken');
  //       sessionStorage.removeItem('token');
  //       sessionStorage.removeItem('accessToken');
  //       navigate('/login');
  //       return false;
  //     }
  //     
  //     return true;
  //   } catch (error) {
  //     console.error('Error validating token:', error);
  //     navigate('/login');
  //     return false;
  //   }
  // };

  // getAuthToken() function not needed as we now use getAccessToken from auth.js
  // const getAuthToken = () => {
  //   const token = localStorage.getItem('token') || 
  //                 localStorage.getItem('accessToken') || 
  //                 sessionStorage.getItem('token') || 
  //                 sessionStorage.getItem('accessToken');
  //   
  //   if (!token) {
  //     return null;
  //   }
  //   
  //   return token;
  // };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // No need to verify authentication before proceeding
      // if (!checkAuth()) {
      //   return;
      // }
      
      // Using Promise.all to fetch data in parallel with apiClient
      const [
        staffResponse,
        consultantsResponse,
        surveysAllResponse,
        coursesAllResponse,
        blogsAllResponse,
      ] = await Promise.all([
        apiClient.get('/manager/staff'),
        apiClient.get('/manager/consultants'),
        apiClient.get('/manager/surveys/all'),
        apiClient.get('/manager/courses/all'),
        apiClient.get('/manager/blogs/all'),
      ]);

      // Process staff & consultants count
      setStaffCount(staffResponse.data.length);
      setConsultantCount(consultantsResponse.data.length);

      // Process counts
      const allSurveys = surveysAllResponse.data || [];
      const allCourses = coursesAllResponse.data || [];
      const allBlogs = blogsAllResponse.data || [];
      
      console.log('Blogs data from API:', allBlogs);
      
      setSurveysCount(allSurveys.length);
      setCoursesCount(allCourses.length);
      setBlogsCount(allBlogs.length);
      
      // Simply sort the blogs without filtering by date
      const sortedBlogs = [...allBlogs].sort((a, b) => {
        // Check if created_at exists on both objects (from database screenshot)
        if (a.created_at && b.created_at) {
          try {
            return new Date(b.created_at) - new Date(a.created_at);
          } catch (err) {
            return 0;
          }
        }
        // Fallback to createdAt if created_at doesn't exist
        else if (a.createdAt && b.createdAt) {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (err) {
            return 0;
          }
        }
        return 0;
      });
      
      // Simply sort the surveys without filtering by date
      const sortedSurveys = [...allSurveys].sort((a, b) => {
        // Check if createdAt exists on both objects
        if (a.createdAt && b.createdAt) {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (err) {
            return 0;
          }
        }
        return 0;
      });
      
      // Simply sort the courses without filtering by date
      const sortedCourses = [...allCourses].sort((a, b) => {
        // Check if createdAt exists on both objects
        if (a.createdAt && b.createdAt) {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (err) {
            return 0;
          }
        }
        return 0;
      });
      
      // Use all the sorted data - don't filter by recent date
      setRecentBlogs(sortedBlogs);
      setRecentSurveys(sortedSurveys);
      setRecentCourses(sortedCourses);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication error. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(`Error loading dashboard: ${error.response.data?.message || 'Server error'}`);
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    // Add logo/header
    doc.setFillColor(41, 128, 185); // Blue header background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(22);
    doc.text('Manager Dashboard Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    // Add summary section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Summary Overview', 14, 55);
    
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(14, 58, pageWidth - 14, 58);
    
    // Add count information in a formatted way
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    doc.setTextColor(41, 128, 185);
    doc.text('Staff Count:', 14, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`${staffCount}`, 50, 70);
    
    doc.setTextColor(41, 128, 185);
    doc.text('Consultant Count:', 14, 80);
    doc.setTextColor(0, 0, 0);
    doc.text(`${consultantCount}`, 50, 80);
    
    doc.setTextColor(41, 128, 185);
    doc.text('Blogs Created:', 120, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`${blogsCount}`, 160, 70);
    
    doc.setTextColor(41, 128, 185);
    doc.text('Surveys Created:', 120, 80);
    doc.setTextColor(0, 0, 0);
    doc.text(`${surveysCount}`, 160, 80);
    
    doc.setTextColor(41, 128, 185);
    doc.text('Courses Created:', 120, 90);
    doc.setTextColor(0, 0, 0);
    doc.text(`${coursesCount}`, 160, 90);
    
    // Add recent blogs table section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Recent Blogs (Last 30 Days)', 14, 110);
    
    // Style for tables
    const tableOptions = {
      startY: 115,
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 10 }
    };
    
    doc.autoTable({
      ...tableOptions,
      head: [['#', 'Title', 'Status']],
      body: recentBlogs.map((blog, index) => [
        index + 1,
        blog.title,
        blog.status
      ]),
    });
    
    // Add recent surveys table
    const surveysStartY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Recent Surveys (Last 30 Days)', 14, surveysStartY);
    
    doc.autoTable({
      ...tableOptions,
      startY: surveysStartY + 5,
      head: [['#', 'Title', 'Status']],
      body: recentSurveys.map((survey, index) => [
        index + 1,
        survey.surveyTitle,
        survey.status
      ]),
    });
    
    // Add recent courses table
    const coursesStartY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (coursesStartY > 240) {
      doc.addPage();
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Manager Dashboard Report', 14, 13);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 15, 13, { align: 'right' });
      doc.setTextColor(41, 128, 185);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Recent Courses (Last 30 Days)', 14, 40);
      
      doc.autoTable({
        ...tableOptions,
        startY: 45,
        head: [['#', 'Title', 'Status']],
        body: recentCourses.map((course, index) => [
          index + 1,
          course.title,
          course.status
        ]),
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Recent Courses (Last 30 Days)', 14, coursesStartY);
      
      doc.autoTable({
        ...tableOptions,
        startY: coursesStartY + 5,
        head: [['#', 'Title', 'Status']],
        body: recentCourses.map((course, index) => [
          index + 1,
          course.title,
          course.status
        ]),
      });
    }
    
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`DUPSS Manager Report - Generated: ${currentDate}`, pageWidth / 2, 290, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, 290, { align: 'right' });
    }
    
    // Save the PDF
    doc.save('manager-dashboard-report.pdf');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: '100%', overflow: 'hidden' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Manager Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ 
            px: 3, 
            py: 1, 
            borderRadius: '4px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }
          }}
        >
          Export
        </Button>
      </Box>
      
      {/* Top row with Staff and Consultant counts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2%', mb: 3, width: '100%' }}>
        <Box sx={{ width: '49%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Total staffs
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#2196f3' }}>
                {staffCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '49%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Total consultants
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#4caf50' }}>
                {consultantCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Middle row with Blog, Survey, Course counts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1%', mb: 3, width: '100%' }}>
        <Box sx={{ width: '32.66%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Blogs created
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#ff9800' }}>
                {blogsCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '32.66%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Survey created
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#f44336' }}>
                {surveysCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '32.66%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Course created
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#9c27b0' }}>
                {coursesCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Bottom row with lists */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1%', width: '100%' }}>
        {/* Blog list */}
        <Box sx={{ width: '32.66%' }}>
          <Paper sx={{ height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">List of blog created in a month</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBlogs.length > 0 ? (
                    recentBlogs.map((blog, index) => (
                      <TableRow 
                        key={blog.id || index}
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          } 
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {blog.title}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={blog.status} 
                            color={getStatusColor(blog.status)} 
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No blogs in the last 30 days
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        
        {/* Survey list */}
        <Box sx={{ width: '32.66%' }}>
          <Paper sx={{ height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">List of survey created in a month</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSurveys.length > 0 ? (
                    recentSurveys.map((survey, index) => (
                      <TableRow 
                        key={survey.surveyId || index}
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          } 
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {survey.surveyTitle}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={survey.status} 
                            color={getStatusColor(survey.status)} 
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No surveys in the last 30 days
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        
        {/* Course list */}
        <Box sx={{ width: '32.66%' }}>
          <Paper sx={{ height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">List of course created in a month</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course, index) => (
                      <TableRow 
                        key={course.id || index}
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          } 
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.title}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.status} 
                            color={getStatusColor(course.status)} 
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No courses in the last 30 days
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 