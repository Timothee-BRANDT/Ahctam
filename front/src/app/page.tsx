import Link from "next/link";
import Header from "./header/header";
import Footer from "./footer/footer"

export default function Home() {
  return (
    <main>
      <Header />
    {/* <div>
      <h1>Home Page</h1>
      <Link href="/register" legacyBehavior>
        <a>Register</a>
      </Link>
    </div> */}
      <Footer />
    </main>
  );
}
