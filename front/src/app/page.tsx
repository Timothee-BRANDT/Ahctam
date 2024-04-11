import Link from "next/link";
import Header from "./header/header";
import Footer from "./footer/footer"
import Authentification from "./authentification/authentification";

export default function Home() {
  return (
    <main>
      <Header />
      <Authentification />
      <Footer />
    </main>
  );
}
