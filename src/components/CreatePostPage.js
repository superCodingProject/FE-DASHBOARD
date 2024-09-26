import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { blue, CustomButton } from './CustomButton';
import { red } from '@mui/material/colors';
import { StyledTextarea } from './StyledTextArea';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    author: '',
    content: ''
  });

  // 컴포넌트가 마운트될 때 로컬 스토리지에서 이메일을 가져옵니다.
  useEffect(() => {
    const email = localStorage.getItem('email'); // 로컬 스토리지에서 이메일 가져오기
    if (email) {
      setPost((prev) => ({
        ...prev,
        author: email // 가져온 이메일을 author에 설정
      }));
    }
  }, []);

  const submitPost = async () => {
    await fetch(`http://localhost:8080/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Content-Type 헤더 추가
      },
      body: JSON.stringify({
        title: post?.title || '',
        content: post?.content || '',
        author: post?.author || '' // author 필드 추가
      })
    }).then(() => navigate('/')).catch((err) => console.error(err));
  };

  return (
    <div style={{
      padding: '40px'
    }}>
      <h1>게시글 작성하기</h1>
      <h2>글 제목</h2>
      <TextField 
        id="outlined-basic" 
        label="글 제목" 
        variant="outlined" 
        value={post.title} 
        onChange={(event) => setPost(prev => ({
          ...prev,
          title: event.target.value
        }))} 
      />
      <h2>작성자</h2>
      <TextField 
        id="outlined-basic" 
        label="작성자" 
        variant="outlined" 
        value={post.author} 
        InputProps={{
          readOnly: true // 읽기 전용 설정
        }} 
      />
      <h2>본문</h2>
      <StyledTextarea
        aria-label="minimum height"
        minRows={3}
        placeholder="최소 3줄"
        value={post.content}
        onChange={(event) => setPost(prev => ({
          ...prev,
          content: event.target.value
        }))}
      />
      <div style={{
        marginTop: '20px'
      }}>
        <CustomButton style={{ backgroundColor: blue[500] }} onClick={submitPost}>
          작성
        </CustomButton>
        <CustomButton style={{ backgroundColor: red[500] }} onClick={() => navigate('/')}>
          취소
        </CustomButton>
      </div>
    </div>
  );
};

export default CreatePostPage;
