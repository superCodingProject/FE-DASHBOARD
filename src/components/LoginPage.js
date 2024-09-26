import React, {useState} from 'react';
import {TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {blue, CustomButton} from './CustomButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState({
    email: '',
    password: ''
  });

  const loginHandler = async (path, email, password) => {
    try {
      const response = await fetch(`http://localhost:8080${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Content-Type 헤더 추가
        },
        body: JSON.stringify({
          email,
          password
        })
      });
  
      // 응답이 성공적이지 않은 경우 에러를 던짐
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      // 응답 헤더에서 access token을 가져오기
      if (path === '/api/login') {
        const accessToken = response.headers.get('Authorization');
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('email', email);
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div style={{
      padding: '40px'
    }}>
      <h1>로그인 페이지</h1>
      <h2>이메일</h2>
      <TextField id="outlined-basic" label="이메일을 입력해주세요." variant="outlined" onChange={(event) => setLoginState(prev => ({...prev, email: event.target.value}))}/>
      <h2>비밀번호</h2>
      <TextField id="outlined-basic" label="비밀번호를 입력해주세요." variant="outlined" onChange={(event) => setLoginState(prev => ({...prev, password: event.target.value}))}/>
      <div style={{
        marginTop: '20px'
      }}>
        <CustomButton style={{ backgroundColor: blue[900] }} onClick={() => loginHandler('/api/signup', loginState.email, loginState.password)}>회원가입</CustomButton>
        <CustomButton style={{ backgroundColor: blue[500] }} onClick={() => loginHandler('/api/login', loginState.email, loginState.password)}>로그인</CustomButton>
      </div>
    </div>
  );
};

export default LoginPage;
