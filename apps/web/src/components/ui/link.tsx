"use client"

import { cx } from "@lib/primitive"
import { useRouterState } from "@tanstack/react-router"
import { forwardRef, useMemo } from "react"
import { Link as LinkPrimitive, type LinkProps as LinkPrimitiveProps } from "react-aria-components"
import { twJoin } from "tailwind-merge"

interface LinkProps extends LinkPrimitiveProps {
  intent?: "primary" | "secondary" | "unstyled"
  ref?: React.RefObject<HTMLAnchorElement>
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, intent = "unstyled", ...props }, ref) => {
    // Use fine-grained selector to only re-render when pathname changes
    // This prevents unnecessary re-renders when other router state changes
    const pathname = useRouterState({
      select: (state) => state.location.pathname,
    })

    // Memoize isCurrent calculation to prevent unnecessary re-renders
    const isCurrent = useMemo(() => {
      if (!props.href) return false
      const href = props.href.toString()
      // Normalize both paths by removing trailing slashes for comparison
      const normalizedPathname =
        pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
      const normalizedHref = href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href
      return normalizedPathname === normalizedHref
    }, [pathname, props.href])

    return (
      <LinkPrimitive
        ref={ref}
        {...props}
        data-current={isCurrent || undefined}
        aria-current={isCurrent ? "page" : undefined}
        className={cx(
          twJoin(
            "disabled:cursor-default disabled:opacity-60 forced-colors:disabled:text-[GrayText]",
            intent === "unstyled" && "text-current",
            intent === "primary" && "text-primary hover:text-primary/80",
            intent === "secondary" && "text-muted-fg hover:text-fg",
          ),
          className,
        )}
      >
        {(values) => {
          // Inject isCurrent into render props for components like SidebarItem
          const enhancedValues = { ...values, isCurrent }
          return (
            <>
              {typeof props.children === "function"
                ? props.children(enhancedValues as any)
                : props.children}
            </>
          )
        }}
      </LinkPrimitive>
    )
  },
)

Link.displayName = "Link"

export type { LinkProps }
export { Link }
