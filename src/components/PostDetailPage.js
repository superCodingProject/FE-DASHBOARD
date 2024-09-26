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
  const [isLiked, setIsLiked] = useState(false);

  // 좋아요 수 가져오기
  const fetchLikeCount = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/like/${postId}`);
      const likeData = await response.json();
      setLikesCount(likeData.likeCount);
      setIsLiked(likeData.isLiked);
    } catch (err) {
      console.error('Failed to fetch like count:', err);
    }
  };

  const toggleLike = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await fetch(`http://localhost:8080/api/like/${post.id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const likeData = await response.json();
        setLikesCount(prev => prev + (isLiked ? -1 : 1));
        setIsLiked(!isLiked);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  async function fetchData(postId) {
    try {
      const response = await fetch(`http://localhost:8080/api/comments?postId=${postId}`); // 게시물 ID에 맞게 댓글을 가져옵니다.
      const data = await response.json();
      if (data && data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }

  // 게시물, 댓글, 좋아요 수 가져오기
  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem('post'));
    const email = localStorage.getItem('email');

    const fetchPostData = async () => {
      if (postData) {
        setPost(postData);
        await fetchData(postData.id);
        await fetchLikeCount(postData.id);

        // 좋아요 상태 초기화
        try {
          const likeResponse = await fetch(`http://localhost:8080/api/like/${postData.id}`);
          const likeData = await likeResponse.json();
          setIsLiked(likeData.isLiked);
        } catch (err) {
          console.error('Failed to fetch like status:', err);
        }

        if (email) {
          setNewComment(prev => ({ ...prev, author: email }));
        }
      }
    };

    fetchPostData();
  }, []);

  // 게시물 수정
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
      console.error('Failed to delete post:', err);
    }
  };

  const handleCommentChange = async (id, content) => {
    try {
      await fetch(`http://localhost:8080/api/comments/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({ content })
      });
      
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
      const response = await fetch(`http://localhost:8080/api/comments`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          author: newComment.author,
          content: newComment.content,
          post_id: post.id
        })
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments(prev => [...prev, createdComment]); // 새로 생성된 댓글 추가
        setNewComment({ author: '', content: '' }); // 입력 필드 초기화
        navigate("/");
      }
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
        label="제목"
        variant="outlined"
        value={post?.title || ''}
        onChange={(event) =>
          setPost((prev) => ({ ...prev, title: event.target.value }))
        }
      />

      <h2>작성자</h2>
      <TextField
        id="outlined-basic"
        label="작성자"
        variant="outlined"
        value={post?.author || ''}
        onChange={(event) =>
          setPost((prev) => ({ ...prev, author: event.target.value }))
        }
      />

      <h2>본문</h2>
      <StyledTextarea
        aria-label="본문"
        minRows={3}
        placeholder="본문을 입력하세요"
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
        <CustomButton
          style={{ backgroundColor: isLiked ? red[500] : blue[500], marginLeft: 10 }}
          onClick={toggleLike}>{isLiked ? '좋아요 취소' : '좋아요'}
        </CustomButton>
        <Typography variant="h6" style={{ marginLeft: 10 }}>
          좋아요 수: {likesCount}
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
