"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Users, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Lessons",
    url: "/lessons",
    icon: BookOpen,
  },
  {
    title: "Cabinet",
    url: "/cabinet",
    icon: User,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold font-architects">
          Income Calculator
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url} onClick={handleNavigation}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
