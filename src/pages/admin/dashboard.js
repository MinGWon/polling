import Head from "next/head";
import DashboardContent from '@/components/DashboardContent';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>관리자 대시보드 - 출구조사 시스템</title>
      </Head>
      <DashboardContent title="관리자 대시보드 - 출구조사 시스템" />
    </>
  );
}
