import Link from "next/link";
import type { NavChild } from "@/lib/constants";
import styles from "./Nav.module.css";

interface NavDropdownProps {
  items: NavChild[];
  /** Services uses a 2-column layout with descriptions */
  wide?: boolean;
}

export default function NavDropdown({ items, wide }: NavDropdownProps) {
  return (
    <div className={`${styles.dropdown} ${wide ? styles.dropdownWide : ""}`}>
      <ul className={`${styles.dropdownList} ${wide ? styles.dropdownGrid : ""}`}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.dropdownItem}>
              <span className={styles.dropdownLabel}>{item.label}</span>
              {item.description && (
                <span className={styles.dropdownDesc}>{item.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
