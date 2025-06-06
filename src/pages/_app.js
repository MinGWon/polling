import Layout from '@/components/Layout';
import '@/styles/globals.css';

export default function App({ Component, pageProps, router }) {
  // Don't apply layout to login page
  if (router.pathname === '/') {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
