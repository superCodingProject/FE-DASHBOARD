import React, {useEffect, useState} from 'react';
import {blue, CustomButton} from './CustomButton';
import {useNavigate} from 'react-router-dom';
import {red} from '@mui/material/colors';
import {Table, TableBody, TableCell, TableHead, TableRow, TextField} from '@mui/material';

const ListPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '게시물 제목1',
      content: '게시물 내용1',
      author: '작성자',
      created_at: '작성일시'
    },
    {
      id: 2,
      title: '게시물 제목2',
      content: '게시물 내용2',
      author: '작성자',
      created_at: '작성일시'
    }
  ]);

  useEffect(() => {
    async function fetchData() {
      await fetch('http://localhost:8080/api/posts')
      .then(res => res.json()).then(res => setPosts([...res.posts]))
      .catch((err) => console.error(err));
    }

    fetchData();
  }, []);

  const logoutHandler = async () => {
    const email = localStorage.getItem('email');
    const accessToken = localStorage.getItem('accessToken'); // 토큰 가져오기
    
    if (!email || !accessToken) { // 이메일 또는 토큰이 없으면 로그인 페이지로 이동
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Content-Type 헤더 추가
          'Authorization': accessToken // Authorization 헤더 추가
        },
        body: JSON.stringify({ email })
      });
  
      // 응답 상태 확인
      if (!response.ok) {
        throw new Error('Logout failed');
      }
  
      // 로그아웃 성공 후 로그인 페이지로 이동
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const searchHandler = async (email) => {
    console.log("????");
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return;
    const { posts } = await fetch(`http://localhost:8080/api/posts/search?author_email=${email}`)
    .then(res => res.json()).catch((error) => {
      console.error(error);
    });
    if (!posts) return;
    setPosts([...posts]);
  };


  return (
    <div style={{
      padding: '40px'
    }}>
      <h1>게시판 리스트</h1>
      <div>
        <TextField id="standard-required" label="작성자 이메일 검색" variant="standard" value={keyword}
                   onChange={(event) => setKeyword(event.target.value)}/>
        <CustomButton style={{ backgroundColor: blue[500] }} onClick={() => searchHandler(keyword)}>검색</CustomButton>
      </div>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>게시물내용</TableCell>
            <TableCell>작성자</TableCell>
            <TableCell>작성일시</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map(post => (
            <TableRow
              key={post.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              onClick={() => {
                localStorage.setItem('post', JSON.stringify({ ...post}))
                navigate(`/post/${post.id}`)
              }}
            >
              <TableCell component="th" scope="row">
                {post.title}
              </TableCell>
              <TableCell>{post.content}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{post.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomButton style={{ backgroundColor: blue[500] }} onClick={() => navigate('/post/create')}>게시글 작성</CustomButton>
      <CustomButton style={{ backgroundColor: red[500] }} onClick={logoutHandler}>로그아웃</CustomButton>
    </div>
  );
};

export default ListPage;
