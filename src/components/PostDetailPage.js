import React, { useEffect, useState } from 'react';
import { Card, CardContent, TextField, Typography } from '@mui/material';
import { green, purple, red } from '@mui/material/colors';
import { blue, CustomButton } from './CustomButton';
import { StyledTextarea } from './StyledTextArea';
import { useNavigate } from 'react-router-dom';

const PostDetailPage = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    content: '',
    author: ''
  });
  const [likesCount, setLikesCount] = useState(0);

  async function fetchData(postId) {
    try {
      const response = await fetch('http://localhost:8080/api/comments');
      const data = await response.json();
      if (data && data.comments) {
        setComments(data.comments.filter(c => c?.post_id === postId));
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }
  
  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem('post'));
    const email = localStorage.getItem('email'); // Get email from local storage
    if (postData) {
      setPost(postData);
      fetchData(postData.id);
      if (email) {
        setNewComment(prev => ({ ...prev, author: email })); // Set author to the local email
      }
    }
  }, []);

  const handlePostChange = async () => {
    try {
      await fetch(`http://localhost:8080/api/posts/${post.id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({
          title: post?.title || '',
          content: post?.content || '',
          author: post?.author || ''
        })
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handlePostDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/post/delete/${id}`, {
        method: 'DELETE',
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleCommentChange = async (id, content) => {
    try {
      await fetch(`http://localhost:8080/api/comments/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({ content })
      });
      
      // 댓글 업데이트 후 상태를 업데이트하여 UI에 반영
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === id ? { ...comment, content } : comment
        )
      );
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleCommentDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/comments/${id}`, {
        method: 'DELETE',
      });
      // 댓글이 삭제된 후 화면에서 제거되도록 상태를 업데이트합니다.
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const changeComment = (commentId, content) => {
    const updatedComments = comments.map(c =>
      c.id === commentId ? { ...c, content } : c
    );
    setComments(updatedComments);
  };

  const submitComment = async () => {
    try {
      await fetch(`http://localhost:8080/api/comments`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          author: newComment.author,
          content: newComment.content,
          post_id: post.id
        })
      });
      setNewComment({ author: '', content: '' });
      navigate('/');
    } catch (err) {
      console.error('Failed to create comment:', err);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>게시판 상세</h1>

      <h2>글 제목</h2>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={post?.title || ''}
        onChange={(event) =>
          setPost((prev) => ({ ...prev, title: event.target.value }))
        }
      />

      <h2>작성자</h2>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={post?.author || ''}
        onChange={(event) =>
          setPost((prev) => ({ ...prev, author: event.target.value }))
        }
      />

      <h2>본문</h2>
      <StyledTextarea
        aria-label="minimum height"
        minRows={3}
        placeholder="Minimum 3 rows"
        value={post?.content || ''}
        onChange={(event) =>
          setPost((prev) => ({ ...prev, content: event.target.value }))
        }
      />

      <div style={{ marginTop: '20px' }}>
        <CustomButton
          style={{ backgroundColor: blue[500] }}
          onClick={handlePostChange}
        >
          수정
        </CustomButton>
        <CustomButton
          style={{ backgroundColor: green[500] }}
          onClick={() => navigate('/')}
        >
          취소
        </CustomButton>
        <CustomButton 
          style={{ backgroundColor: red[500], marginLeft: 10 }} 
          onClick={() => handlePostDelete(post.id)}>삭제
        </CustomButton>
        <Typography variant="h6" style={{ marginLeft: '10px' }}>
          {likesCount} 👍 {/* Display likes count */}
        </Typography>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>댓글 작성자</h3>
            <TextField
              variant="outlined"
              value={newComment.author || ''}
              InputProps={{
                readOnly: true // 읽기 전용 설정
              }} 
              onChange={(event) =>
                setNewComment((prev) => ({ ...prev, author: event.target.value }))
              }
            />
            <h3>댓글 내용</h3>
            <TextField
              variant="outlined"
              value={newComment.content || ''}
              onChange={(event) =>
                setNewComment((prev) => ({ ...prev, content: event.target.value }))
              }
            />
            <CustomButton
              style={{ backgroundColor: blue[500], marginTop: 10 }}
              onClick={submitComment}
            >
              생성
            </CustomButton>
          </CardContent>
        </Card>

        {comments.length > 0 &&
          comments.map((c, index) => (
            <Card key={c.id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <TextField
                  variant="outlined"
                  value={c?.content || ''}
                  onChange={(event) =>
                    changeComment(c.id, event.target.value)
                  }
                />
                <Typography variant="h5" component="div">
                  {c?.author || ''}
                </Typography>
                <Typography color="text.secondary">
                  {c?.created_at || ''}
                </Typography>
                <CustomButton
                  style={{ backgroundColor: blue[500] }}
                  onClick={() => handleCommentChange(c.id, c.content)}
                >수정
                </CustomButton>
                <CustomButton
                  style={{ backgroundColor: red[500] }}
                  onClick={() => handleCommentDelete(c.id)}
                >
                  삭제
                </CustomButton>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
