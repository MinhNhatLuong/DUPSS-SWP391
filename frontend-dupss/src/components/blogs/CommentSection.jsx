import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  Stack, 
  Divider,
  IconButton, 
  Pagination
} from '@mui/material';
import { ThumbUp, ThumbDown, Reply } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CommentBox = styled(Box)(({ theme, isReply }) => ({
  display: 'flex',
  marginBottom: '25px',
  ...(isReply && {
    marginLeft: '50px',
    marginTop: '20px',
    paddingLeft: '20px',
    borderLeft: '2px solid #e0e0e0',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '20px',
    }
  })
}));

const ReactionButton = styled(IconButton)(({ theme, isActive }) => ({
  color: isActive ? '#3498db' : '#7f8c8d',
  padding: '4px',
  '&:hover': {
    color: '#3498db'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#3498db',
    },
  },
}));

const CommentSection = ({ comments }) => {
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const commentsPerPage = 5;
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the comment to the backend
    console.log('Submitting comment:', commentText);
    setCommentText('');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Display comments for current page only
  const displayComments = comments.slice(
    (page - 1) * commentsPerPage,
    page * commentsPerPage
  );

  const renderComment = (comment, isReply = false) => (
    <CommentBox key={comment.id} isReply={isReply}>
      <Avatar 
        src={comment.avatarUrl} 
        alt={comment.author}
        sx={{ 
          width: 50, 
          height: 50, 
          mr: 2,
          flexShrink: 0
        }}
      />
      <Box sx={{ width: '100%' }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={1}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              component="h4" 
              sx={{ fontWeight: 500, mr: 1 }}
            >
              {comment.author}
            </Typography>
            {comment.isAuthor && (
              <Box
                component="span"
                sx={{
                  bgcolor: '#3498db',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 'normal'
                }}
              >
                Tác giả
              </Box>
            )}
          </Box>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mt: { xs: 0.5, sm: 0 } }}
          >
            {comment.date}
          </Typography>
        </Stack>
        
        <Typography variant="body2" paragraph>
          {comment.content}
        </Typography>
        
        <Stack 
          direction="row" 
          justifyContent="space-between"
          alignItems="center"
        >
          <Button 
            startIcon={<Reply />} 
            size="small" 
            sx={{ 
              color: '#3498db',
              textTransform: 'none'
            }}
          >
            Trả lời
          </Button>
          
          <Stack direction="row" spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReactionButton size="small">
                <ThumbUp fontSize="small" />
              </ReactionButton>
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {comment.likes}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReactionButton size="small">
                <ThumbDown fontSize="small" />
              </ReactionButton>
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {comment.dislikes}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        
        {/* Render replies if any */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </Box>
    </CommentBox>
  );

  return (
    <Box sx={{ mb: 5 }}>
      <Typography 
        variant="h5" 
        component="h3" 
        gutterBottom 
        sx={{ 
          color: '#2c3e50',
          borderTop: '1px solid #e0e0e0', 
          pt: 3,
          pb: 1
        }}
      >
        Bình luận ({comments.length})
      </Typography>
      
      <Paper 
        elevation={0}
        component="form"
        onSubmit={handleCommentSubmit}
        sx={{
          padding: 3,
          marginBottom: 4,
          backgroundColor: '#f8f9fa',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ color: '#2c3e50', fontSize: '1.2rem' }}
        >
          Để lại bình luận của bạn
        </Typography>
        
        <StyledTextField
          multiline
          fullWidth
          rows={4}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              bgcolor: '#3498db',
              '&:hover': {
                bgcolor: '#2980b9'
              }
            }}
          >
            Gửi bình luận
          </Button>
        </Box>
      </Paper>
      
      <Box>
        {displayComments.map(comment => renderComment(comment))}
      </Box>
      
      {comments.length > commentsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(comments.length / commentsPerPage)} 
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default CommentSection; 