'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '@/styles/Layout.module.css';
import Swal from 'sweetalert2';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  // 로그인하지 않은 경우의 메뉴
  const guestMenus = [
    { icon: <i className="fas fa-tv"></i>, text: '전광판', path: '/display' }
  ];

  const adminMenus = [
    { icon: <i className="fas fa-chart-bar"></i>, text: '대시보드', path: '/admin/dashboard' },
    { icon: <i className="fas fa-clipboard-list"></i>, text: '응답 관리', path: '/admin/responses' }
  ];

  const surveyorMenus = [
    { icon: <i className="fas fa-chart-line"></i>, text: '표본 현황', path: '/surveyor/samples' },
    { icon: <i className="fas fa-edit"></i>, text: '출구조사', path: '/surveyor/survey' }
  ];

  let menus, displayName, roleText;
  
  if (!mounted) {
    // 서버 사이드 렌더링 시 기본값
    menus = guestMenus;
    displayName = '게스트';
    roleText = '방문자';
  } else if (user) {
    menus = user.role === 'admin' ? adminMenus : surveyorMenus;
    displayName = user.username;
    roleText = user.role === 'admin' ? '관리자' : '조사원';
  } else {
    menus = guestMenus;
    displayName = '게스트';
    roleText = '방문자';
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.logo}>
            <Image 
              src="/image.png" 
              alt="로고" 
              width={60} 
              height={60}
              className={styles.logoImage}
            />
          </div>
          
          <div 
            className={`${styles.userInfo} ${mounted && user ? styles.clickable : ''}`}
            onClick={mounted && user ? handleLogout : undefined}
            title={mounted && user ? '클릭하여 로그아웃' : ''}
          >
            <div className={styles.userBox}>
              <i className="fas fa-user"></i>
            </div>
            <span className={styles.username}>{displayName}</span>
            <span className={styles.role}>{roleText}</span>
          </div>

          <nav className={styles.nav}>
            {menus.map((menu) => (
              <button
                key={menu.path}
                className={`${styles.menuItem} ${
                  router.pathname === menu.path ? styles.active : ''
                }`}
                onClick={() => router.push(menu.path)}
              >
                <div className={styles.menuIcon}>{menu.icon}</div>
                <span className={styles.menuText}>{menu.text}</span>
              </button>
            ))}
          </nav>
        </div>

        {mounted && user && (
          <div className={styles.logout}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <div className={styles.logoutIcon}><i className="fas fa-sign-out-alt"></i></div>
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
