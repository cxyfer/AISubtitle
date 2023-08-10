import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import HeaderNew from "@/components/new/HeaderNew";
import FooterNew from "@/components/new/FooterNew";
import { ConfigProvider } from "antd";
import theme from "../utils/themeConfig";

// function App({ Component, pageProps }: AppProps) {
//   return (
//     <div>
//       <Head>
//         <title>AI字幕翻译</title>
//       </Head>
//       <Header></Header>
//       <main>
//         <Component {...pageProps} />
//         <Analytics />
//       </main>
//       <Footer></Footer>
//     </div>
//   );
// }

// export default App;

const App = ({ Component, pageProps }: AppProps) => (
  <div>
    <Head>
      <title>AI字幕翻译</title>
    </Head>
    <HeaderNew></HeaderNew>
    <main>
      <ConfigProvider theme={theme}>
        <Component {...pageProps} />
      </ConfigProvider>
    </main>
    <FooterNew></FooterNew>
  </div>
);

export default App;
