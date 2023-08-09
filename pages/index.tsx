import Srt from "./srt";

export default function Home() {
  return <Srt></Srt>;
}

// export async function getStaticProps({ locale }: {locale:string}) {
//   return {
//       props: {
//           ...(await serverSideTranslations(locale, ['common'], nextI18nextConfig)),
//       }
//   }
// }
