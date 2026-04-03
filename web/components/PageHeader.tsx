"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
};

function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

  let currentPath = "";
  for (let i = 0; i < paths.length; i++) {
    currentPath += `/${paths[i]}`;
    const isLast = i === paths.length - 1;
    const label = paths[i]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
      isLast,
    });
  }

  return breadcrumbs;
}

export default function PageHeader({ title, subtitle, actions, showBreadcrumbs = true }: Props) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <Box sx={{ mb: 4 }}>
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: "#A8A29E" }} />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            component={NextLink}
            href="/admin"
            sx={{
              color: "#78716C",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: 500,
              transition: "color 0.15s ease",
              "&:hover": {
                color: "#0D7377",
              },
            }}
          >
            Admin
          </Link>
          {breadcrumbs.map((crumb, index) =>
            crumb.isLast ? (
              <Typography
                key={crumb.href}
                color="#1C1917"
                fontSize="0.8125rem"
                fontWeight={600}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.href}
                component={NextLink}
                href={crumb.href}
                sx={{
                  color: "#78716C",
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  transition: "color 0.15s ease",
                  "&:hover": {
                    color: "#0D7377",
                  },
                }}
              >
                {crumb.label}
              </Link>
            )
          )}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: "#57534E",
                mt: 0.5,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
