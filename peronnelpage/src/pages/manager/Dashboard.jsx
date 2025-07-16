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
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import axios from 'axios';
import { format, parseISO, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';
import { getAccessToken, isAuthenticated } from '../../utils/auth';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import '@fontsource/roboto';

// Remove hardcoded URL
// const API_BASE_URL = 'http://localhost:8080';

export default function Dashboard() {
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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
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

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleExportPDF = () => {
    handleCloseMenu();
    
    try {
      // Tạo một container tạm thời để chứa nội dung PDF
      const element = document.createElement('div');
      element.style.width = '210mm'; // Khổ A4
      element.style.padding = '15mm';
      element.style.backgroundColor = 'white';
      element.style.fontFamily = 'Roboto, Arial, sans-serif';
      
      // CSS cho các phần trong PDF
      const style = document.createElement('style');
      style.textContent = `
        .report-header {
          background-color: #2980b9;
          color: white;
          padding: 20px;
          margin: -15mm -15mm 20px -15mm;
          text-align: center;
          width: 100%;
        }
        .report-title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .report-date {
          font-size: 14px;
          margin-bottom: 5px;
        }
        .section-title {
          color: #2980b9;
          font-size: 18px;
          font-weight: bold;
          border-bottom: 2px solid #2980b9;
          margin-top: 25px;
          margin-bottom: 15px;
          padding-bottom: 8px;
        }
        .stats-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin: 20px 0;
          justify-content: space-between;
        }
        .stat-item {
          flex: 1;
          min-width: 150px;
          background-color: #f8f9fa;
          border-left: 4px solid #2980b9;
          padding: 10px 15px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-label {
          font-weight: bold;
          color: #2980b9;
          display: block;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 500;
        }
        .table-container {
          margin: 15px 0 25px 0;
          width: 100%;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 12px;
          table-layout: fixed;
          border: 1px solid #dee2e6;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th {
          background-color: #2980b9;
          color: white;
          text-align: left;
          padding: 10px;
          font-weight: bold;
          word-wrap: break-word;
          vertical-align: middle;
          border: 1px solid #1a5c8a;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #dee2e6;
          word-wrap: break-word;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        tr:hover {
          background-color: #e9ecef;
        }
        .footer {
          text-align: center;
          color: #6c757d;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #dee2e6;
        }
      `;
      
      element.appendChild(style);
      
      // Header
      const header = document.createElement('div');
      header.className = 'report-header';
      
      const title = document.createElement('div');
      title.className = 'report-title';
      title.textContent = 'DUPSS MANAGEMENT REPORT';
      title.style.textAlign = 'center';
      
      const date = document.createElement('div');
      date.className = 'report-date';
      date.textContent = `Created: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
      
      header.appendChild(title);
      header.appendChild(date);
      element.appendChild(header);
      
      // Phần thống kê
      const statsTitle = document.createElement('div');
      statsTitle.className = 'section-title';
      statsTitle.textContent = 'OVERVIEW STATISTICS';
      element.appendChild(statsTitle);
      
      const statsContainer = document.createElement('div');
      statsContainer.className = 'stats-container';
      
      // Thêm các item thống kê
      const addStatItem = (label, value) => {
        const item = document.createElement('div');
        item.className = 'stat-item';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'stat-label';
        labelSpan.textContent = label;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'stat-value';
        valueSpan.textContent = value;
        
        item.appendChild(labelSpan);
        item.appendChild(valueSpan);
        statsContainer.appendChild(item);
      };
      
      addStatItem('Staff', `${staffCount}`);
      addStatItem('Blogs', `${blogsCount}`);
      addStatItem('Consultants', `${consultantCount}`);
      addStatItem('Surveys', `${surveysCount}`);
      addStatItem('Courses', `${coursesCount}`);
      
      element.appendChild(statsContainer);
      
      // Function to create a table
      const createTable = (title, columns, data) => {
        // Title
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = title;
        element.appendChild(sectionTitle);
        
        // Table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        // Create table
        const table = document.createElement('table');
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
                  // Thiết lập chiều rộng cột
          const colWidths = ['8%', '62%', '30%'];
        
        columns.forEach((column, index) => {
          const th = document.createElement('th');
          th.textContent = column;
          th.style.width = colWidths[index];
          headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        data.forEach((item, index) => {
          const row = document.createElement('tr');
          
          const indexCell = document.createElement('td');
          indexCell.textContent = (index + 1).toString();
          indexCell.style.width = colWidths[0];
          indexCell.style.textAlign = 'center';
          row.appendChild(indexCell);
          
          const titleCell = document.createElement('td');
          titleCell.textContent = item.title || item.surveyTitle || 'N/A';
          titleCell.style.width = colWidths[1];
          titleCell.style.maxWidth = colWidths[1];
          titleCell.style.overflow = 'hidden';
          titleCell.style.textOverflow = 'ellipsis';
          row.appendChild(titleCell);
          
          const statusCell = document.createElement('td');
          statusCell.textContent = 'APPROVED';
          statusCell.style.width = colWidths[2];
          statusCell.style.textAlign = 'center';
          statusCell.style.color = '#2e7d32';
          statusCell.style.fontWeight = 'bold';
          statusCell.style.whiteSpace = 'nowrap';
          row.appendChild(statusCell);
          
          tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        element.appendChild(tableContainer);
      };
      
      // Thêm bảng danh sách blog
      createTable('BLOG LIST', ['No.', 'Title', 'Status'], recentBlogs);
      
      // Thêm bảng danh sách khảo sát
      createTable('SURVEY LIST', ['No.', 'Title', 'Status'], recentSurveys);
      
      // Thêm bảng danh sách khóa học
      createTable('COURSE LIST', ['No.', 'Title', 'Status'], recentCourses);
      
      // Footer
      const footer = document.createElement('div');
      footer.className = 'footer';
      footer.textContent = `DUPSS Report - ${format(new Date(), 'dd/MM/yyyy')}`;
      element.appendChild(footer);
      
      // Append to document briefly so it renders
      document.body.appendChild(element);
      
      // HTML2PDF options
      const opt = {
        margin: [0, 0, 0, 0],
        filename: 'dupss-report.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          dpi: 300,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Generate PDF
      html2pdf().set(opt).from(element).save().then(() => {
        // Clean up the temporary element
        document.body.removeChild(element);
      });
      
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại sau.');
    }
  };

  const handleExportExcel = () => {
    handleCloseMenu();

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    // Create summary worksheet
    const summaryData = [
      ['DUPSS MANAGER DASHBOARD REPORT'],
      [`Generated on: ${currentDate}`],
      [],
      ['SUMMARY OVERVIEW'],
      [],
      ['Staff Count', staffCount],
      ['Consultant Count', consultantCount],
      ['Blogs Created', blogsCount],
      ['Surveys Created', surveysCount],
      ['Courses Created', coursesCount],
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Set column widths for summary
    const summaryColWidths = [{ wch: 20 }, { wch: 10 }];
    summaryWs['!cols'] = summaryColWidths;
    
    // Style cells
    // Note: Excel styling with xlsx is limited when using the community version
    
    // Create blogs worksheet
    const blogsData = [
      ['RECENT BLOGS'],
      ['#', 'Title', 'Status']
    ];
    
    recentBlogs.forEach((blog, index) => {
      blogsData.push([index + 1, blog.title, blog.status]);
    });
    
    const blogsWs = XLSX.utils.aoa_to_sheet(blogsData);
    XLSX.utils.book_append_sheet(wb, blogsWs, 'Blogs');
    
    // Set column widths for blogs
    const blogsColWidths = [{ wch: 5 }, { wch: 40 }, { wch: 15 }];
    blogsWs['!cols'] = blogsColWidths;
    
    // Create surveys worksheet
    const surveysData = [
      ['RECENT SURVEYS'],
      ['#', 'Title', 'Status']
    ];
    
    recentSurveys.forEach((survey, index) => {
      surveysData.push([index + 1, survey.surveyTitle, survey.status]);
    });
    
    const surveysWs = XLSX.utils.aoa_to_sheet(surveysData);
    XLSX.utils.book_append_sheet(wb, surveysWs, 'Surveys');
    
    // Set column widths for surveys
    const surveysColWidths = [{ wch: 5 }, { wch: 40 }, { wch: 15 }];
    surveysWs['!cols'] = surveysColWidths;
    
    // Create courses worksheet
    const coursesData = [
      ['RECENT COURSES'],
      ['#', 'Title', 'Status']
    ];
    
    recentCourses.forEach((course, index) => {
      coursesData.push([index + 1, course.title, course.status]);
    });
    
    const coursesWs = XLSX.utils.aoa_to_sheet(coursesData);
    XLSX.utils.book_append_sheet(wb, coursesWs, 'Courses');
    
    // Set column widths for courses
    const coursesColWidths = [{ wch: 5 }, { wch: 40 }, { wch: 15 }];
    coursesWs['!cols'] = coursesColWidths;
    
    // Generate and download Excel file
    XLSX.writeFile(wb, 'manager-dashboard-report.xlsx');
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  // Function to translate status labels
  const getStatusLabel = (status) => {
    if (!status) return 'Không xác định';
    
    const statusMap = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Đã từ chối',
      'DRAFT': 'Bản nháp',
      'PUBLISHED': 'Đã xuất bản'
    };
    
    return statusMap[status] || status;
  };

  // Function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
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
        <Typography variant="h4" gutterBottom sx={{ mb: 0, fontWeight: 'bold' }}>
          Bảng Điều Khiển
        </Typography>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleExportClick}
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
            Xuất báo cáo
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleExportPDF}>
              <PictureAsPdfIcon sx={{ mr: 1, color: '#f44336' }} />
              Xuất PDF
            </MenuItem>
            <MenuItem onClick={handleExportExcel}>
              <GridOnIcon sx={{ mr: 1, color: '#4caf50' }} />
              Xuất Excel
            </MenuItem>
          </Menu>
        </div>
      </Box>
      
      {/* Top row with Staff and Consultant counts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2%', mb: 3, width: '100%' }}>
        <Box sx={{ width: '49%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Tổng số nhân viên
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
                Tổng số tư vấn viên
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
                Bài viết đã tạo
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
                Khảo sát đã tạo
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
                Khóa học đã tạo
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
              <Typography variant="h6">Danh sách bài viết trong tháng</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
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
                            label={getStatusLabel(blog.status)} 
                            color={getStatusColor(blog.status)} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có bài viết nào trong 30 ngày qua
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
              <Typography variant="h6">Danh sách khảo sát trong tháng</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
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
                            label={getStatusLabel(survey.status)} 
                            color={getStatusColor(survey.status)} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có khảo sát nào trong 30 ngày qua
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
              <Typography variant="h6">Danh sách khóa học trong tháng</Typography>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell width="60%" sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
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
                            label={getStatusLabel(course.status)} 
                            color={getStatusColor(course.status)} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có khóa học nào trong 30 ngày qua
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