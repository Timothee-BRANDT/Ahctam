import Link from 'next/link';

import "./header.scss"

const Header: React.FC = () => {
  return (
    <header className="header">
      <p>Guinea Pig Dating Site</p>
      <nav>
        <ul className="navLinks">
          <li>
            <Link href="/">
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;