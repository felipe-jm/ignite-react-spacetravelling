import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <a>
        <header className={`${commonStyles.container} ${styles.wrapper}`}>
          <img alt="logo" src="/images/logo.svg" />
        </header>
      </a>
    </Link>
  );
}
