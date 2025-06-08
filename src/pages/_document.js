import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* FontAwesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Viewport Configuration */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA Configuration */}
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="S-STAT 출구조사"
        />
        <meta
          name="mobile-web-app-capable"
          content="yes"
        />
        <meta
          name="theme-color"
          content="#667eea"
        />
        <meta
          name="msapplication-TileColor"
          content="#667eea"
        />

        {/* Manifest and Icons */}
        <link
          rel="manifest"
          href="/manifest.json"
        />
        <link
          rel="apple-touch-icon"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/image_cut.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/image_cut.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/image_cut.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/image_cut.png"
        />

        {/* iOS Safari specific */}
        <meta
          name="apple-touch-fullscreen"
          content="yes"
        />
        <meta
          name="format-detection"
          content="telephone=no"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
