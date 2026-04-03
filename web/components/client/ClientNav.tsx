"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";
import PetsIcon from "@mui/icons-material/Pets";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import { useClientAuth } from "../ClientAuthProvider";

const navItems = [
  { label: "Home", href: "/client", icon: <HomeIcon /> },
  { label: "Pets", href: "/client", icon: <PetsIcon /> },
  { label: "Appointments", href: "/client/appointments", icon: <CalendarIcon /> },
  { label: "Profile", href: "/client/profile", icon: <PersonIcon /> },
];

function getActiveNavIndex(pathname: string) {
  if (pathname === "/client") return 0;
  if (pathname.startsWith("/client/pets")) return 1;
  if (pathname.startsWith("/client/appointments")) return 2;
  if (pathname.startsWith("/client/profile") || pathname.startsWith("/client/prescriptions")) return 3;
  return 0;
}

export function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(getActiveNavIndex(pathname));

  useEffect(() => {
    setValue(getActiveNavIndex(pathname));
  }, [pathname]);

  const handleChange = (newValue: number) => {
    router.push(navItems[newValue].href);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
      }}
      elevation={0}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => handleChange(newValue)}
        sx={{
          height: 72,
          background: "linear-gradient(180deg, #FFF 0%, #FDF8F3 100%)",
          borderTop: "1px solid rgba(139, 90, 43, 0.06)",
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "6px 0 10px",
            color: "#A1887F",
            "&.Mui-selected": {
              color: "#E8843C",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.7rem",
            fontWeight: 500,
            marginTop: 0.5,
            "&.Mui-selected": {
              fontSize: "0.75rem",
              fontWeight: 600,
            },
          },
          "& .MuiSvgIcon-root": {
            fontSize: 26,
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.href}
            label={item.label}
            icon={item.icon}
            sx={{
              "&:active": {
                transform: "scale(0.95)",
              },
              transition: "transform 0.1s ease",
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export function ClientHeader() {
  const { user, logout } = useClientAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push("/client/login");
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/client/profile");
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 99,
        background: "linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)",
        borderBottom: "1px solid rgba(139, 90, 43, 0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          py: 2,
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(232, 132, 60, 0.3)",
            }}
          >
            <PetsIcon sx={{ fontSize: 22, color: "white" }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#5D4037",
                lineHeight: 1.2,
              }}
            >
              VetClinic
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#8D6E63",
                fontSize: "0.7rem",
              }}
            >
              Client Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #8B9DC3 0%, #6B7BA2 100%)",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "C"}
          </Avatar>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ color: "#8D6E63" }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            minWidth: 180,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2 }}>
          <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: "#8D6E63" }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: "#D32F2F" }} />
          <Typography variant="body2" color="error">
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #FFF8F0 0%, #FFFDF9 100%)",
      }}
    >
      <ClientHeader />
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pb: "88px",
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            mx: "auto",
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          {children}
        </Box>
      </Box>
      <ClientNav />
    </Box>
  );
}
