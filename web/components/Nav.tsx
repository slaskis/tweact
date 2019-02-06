import React from "react";
import Link from "next/link";

export function Nav() {
  return (
    <nav className="list-reset flex">
      <Link href="/">
        <a className="mr-6 text-blue hover:text-blue-darker">Todos</a>
      </Link>
      <Link href="/empty">
        <a className="mr-6 text-blue hover:text-blue-darker">Empty</a>
      </Link>
      <Link href="/demo">
        <a className="mr-6 text-blue hover:text-blue-darker">Demo</a>
      </Link>
    </nav>
  );
}
