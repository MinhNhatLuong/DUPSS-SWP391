import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

// Mock data for demonstration
const mockContent = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    type: 'course',
    author: 'John Doe',
    status: 'pending',
    createdAt: '2024-03-15',
    content: 'This course covers the basics of React Hooks...',
  },
  {
    id: 2,
    title: 'Best Practices in UI Design',
    type: 'blog',
    author: 'Jane Smith',
    status: 'pending',
    createdAt: '2024-03-14',
    content: 'Learn about the fundamental principles of UI design...',
  },
];

const ContentReview = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState('');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleReview = (content) => {
    setSelectedContent(content);
    setOpenDialog(true);
  };

  const handleApprove = () => {
    // TODO: Implement approval logic
    console.log('Approving content:', selectedContent.id);
    setOpenDialog(false);
    setComment('');
  };

  const handleReject = () => {
    // TODO: Implement rejection logic
    console.log('Rejecting content:', selectedContent.id, 'with comment:', comment);
    setOpenDialog(false);
    setComment('');
  };

  const filteredContent = mockContent.filter(
    (content) => content.type === (selectedTab === 0 ? 'course' : 'blog')
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Content Review
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Courses" />
          <Tab label="Blogs" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredContent.map((content) => (
          <Grid item xs={12} md={6} key={content.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {content.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Author: {content.author}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Created: {content.createdAt}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {content.content}
                </Typography>
                <Chip
                  label={content.status}
                  color={content.status === 'pending' ? 'warning' : 'default'}
                  size="small"
                  sx={{ mt: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<CheckIcon />}
                  color="success"
                  onClick={() => handleReview(content)}
                >
                  Approve
                </Button>
                <Button
                  startIcon={<CloseIcon />}
                  color="error"
                  onClick={() => handleReview(content)}
                >
                  Reject
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Review Content: {selectedContent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {selectedContent?.content}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (required for rejection)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            disabled={!comment}
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentReview; 