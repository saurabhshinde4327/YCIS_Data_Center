"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// 🔷 Sample services list
const packages = [
  {
    title: "Web Hosting",
    href: "/packages/web-hosting",
    description: "Reliable and fast web hosting solutions for your websites",
  },
  {
    title: "VPS Hosting",
    href: "/packages/vps",
    description: "Virtual Private Server solutions with dedicated resources",
  },
  {
    title: "Domain Email",
    href: "/packages/domain-email",
    description: "Professional email solutions for your business domain",
  },
  {
    title: "Database Hosting",
    href: "/packages/database-hosting",
    description: "Secure and scalable database hosting solutions",
  },
]

// 🔷 Main Navbar
export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  // Detect scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-black/20 backdrop-blur-lg shadow-lg border-b border-white/10" 
          : "bg-transparent"
      )}>
        <div className="container flex h-16 items-center justify-between">
          {/* Logo with image and text */}
          <Link href="/" className="flex items-center space-x-2 transition-all duration-300 group">
            <Logo 
              width={40} 
              height={40} 
              className={cn(
                "rounded-lg shadow-sm transition-all duration-300 filter brightness-0 invert",
                isScrolled ? "h-8 w-8 group-hover:scale-110" : "h-10 w-10 group-hover:scale-110"
              )} 
            />
            <div>
              <span className={cn(
                "font-bold text-white block transition-all duration-300 drop-shadow-lg",
                isScrolled ? "text-lg" : "text-xl"
              )}>
                YCIS Data & Technology Center
              </span>
            </div>
          </Link>

          {/* Right side navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                <NavigationMenuItem>
                  <Link href="/packages" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white hover:text-blue-300 hover:bg-white/10 bg-transparent border-transparent transition-all duration-300"
                    )}>
                      Packages
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white hover:text-blue-300 hover:bg-white/10 bg-transparent border-transparent transition-all duration-300"
                    )}>
                      Contact
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/datasets" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white hover:text-blue-300 hover:bg-white/10 bg-transparent border-transparent transition-all duration-300"
                    )}>
                      Public Datasets
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white hover:text-blue-300 hover:bg-white/10 bg-transparent border-transparent transition-all duration-300"
                    )}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Client Login Button */}
            <Link href="/client/signin">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50 hover:scale-105">
                Client Login
              </button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <MobileNav setIsOpen={setIsOpen} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}

// 🔷 Dropdown List Item
interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string
  children?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"

// 🔷 Mobile Nav
function MobileNav({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) {
  return (
    <div className="p-6 text-base font-medium space-y-4">
      <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white" onClick={() => setIsOpen(false)}>
        <Logo 
          width={32} 
          height={32} 
          className="h-8 w-8 rounded-lg shadow-sm filter brightness-0 invert" 
        />
        <div>
          <span className="block">YCIS Data & Technology Center</span>
        </div>
      </Link>

      <Link href="/packages" onClick={() => setIsOpen(false)} className="block text-white hover:text-blue-300 transition-colors duration-300 py-2 border-b border-gray-700 hover:border-blue-500">
        Packages
      </Link>

      <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-white hover:text-blue-300 transition-colors duration-300 py-2 border-b border-gray-700 hover:border-blue-500">
        Contact
      </Link>

      <Link href="/datasets" onClick={() => setIsOpen(false)} className="block text-white hover:text-blue-300 transition-colors duration-300 py-2 border-b border-gray-700 hover:border-blue-500">
        Public Datasets
      </Link>

      <Link href="/about" onClick={() => setIsOpen(false)} className="block text-white hover:text-blue-300 transition-colors duration-300 py-2 border-b border-gray-700 hover:border-blue-500">
        About
      </Link>

      {/* Client Login Button for Mobile */}
      <Link href="/client/signin" onClick={() => setIsOpen(false)}>
        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50 mt-4">
          Client Login
        </button>
      </Link>
    </div>
  )
}
