import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...rest
}: ActiveLinkProps) {
  const { asPath } = useRouter(); // get path from link, example blablabla.com/about etc..

  const className = asPath === rest.href ? activeClassName : "";
  //if router/page === link activate the className
  return <Link {...rest} legacyBehavior>{cloneElement(children, {
    className
  })}</Link>;
}
