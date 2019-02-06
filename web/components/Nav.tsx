import React from "react";
import Link from "next/link";

export function Nav() {
  return (
    <nav>
      <Link prefetch href="/">
        <a>Home</a>
      </Link>
      <Link prefetch href="/empty">
        <a>Empty</a>
      </Link>
      <Link prefetch href="/demo">
        <a>Demo</a>
      </Link>
    </nav>
  );
}
