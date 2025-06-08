import Head from "next/head";
import { useState, useEffect } from "react";
import DashboardContent from '@/components/DashboardContent';

export default function Display() {
  return (
    <div style={{ zoom: '0.85' }}>
      <DashboardContent title="순창고등학교 학생회장 선거 - 실시간 출구조사" />
    </div>
  );
}
