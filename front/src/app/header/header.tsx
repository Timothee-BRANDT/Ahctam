import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header>
      <h1>Dog Dating Site</h1>
      <nav>
        <ul>
          <li>
            <Link href="/">
              Home
            </Link>
          </li>
          <li>
            <Link href="/register">
              Register
            </Link>
          </li>
          <li>
            <Link href="/login">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;