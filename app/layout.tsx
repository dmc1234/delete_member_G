import React from 'react';
import Script from 'next/script';
import './globals.css';
import Header from "./Header";
import Footer from "./Footer";

export const metadata = {
  title: 'GMO会員削除機能',
  description: 'GMO会員削除機能',
};

interface Props {
  children: React.ReactNode;
}

// レイアウトの共通部分を設定
const Layout: React.FC<Props> = ({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="http://flat-icon-design.com/f/f_business_50/s512_f_business_50_2nbg.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"/>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></Script>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
      </head>
      <body className="home">
        <Header />
        <main>
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
};

export default Layout;
