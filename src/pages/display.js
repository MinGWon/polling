import Head from "next/head";
import { useState, useEffect } from "react";
import DashboardContent from '@/components/DashboardContent';

export default function Display() {
  return <DashboardContent title="순창고등학교 학생회장 선거 - 실시간 출구조사" />;
}

// Layout 컴포넌트를 사용하지 않도록 설정
Display.getLayout = function getLayout(page) {
  return page;
};
