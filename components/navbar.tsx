"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

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

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <img 
            src="LOGO1.png" 
            alt="Data Center Logo" 
            className="h-12 w-auto"
          />
          <span className="hidden sm:text-2xl font-bold sm:inline-block text-blue-900">YCIS DATA CENTER</span>
        </Link>
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {packages.map((package_) => (
                      <ListItem key={package_.title} title={package_.title} href={package_.href}>
                        {package_.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/packages" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Packages</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1">
              <img src="https://flagcdn.com/16x12/in.png" alt="India Flag" className="h-4 w-5" />
              <span className="text-sm">English</span>
            </div>
            <Link href="/login" className="hidden md:block">
              <Button variant="outline">Log in</Button>
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0 bg-gradient-to-b from-blue-900 to-blue-600">
                <MobileNav setIsOpen={setIsOpen} />
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  )
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string
  children?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

function MobileNav({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) {
  return (
    <div className="grid gap-6 p-6 text-lg font-medium">
      <Link href="/" className="flex items-center space-x-2 mb-4" onClick={() => setIsOpen(false)}>
        <img 
          src="LOGO1.png" 
          alt="Data Center Logo" 
          className="h-12 w-auto"
        />
        <span className="font-bold text-white text-xl">YCIS DATA CENTER</span>
      </Link>
      <nav className="grid grid-flow-row auto-rows-max text-sm">
        <Link
          href="/about"
          className="flex w-full items-center rounded-md p-3 text-base font-medium text-white hover:bg-blue-700 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105"
          onClick={() => setIsOpen(false)}
        >
          About
        </Link>
        <Link
          href="/packages"
          className="flex w-full items-center rounded-md p-3 text-base font-medium text-white hover:bg-blue-700 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105"
          onClick={() => setIsOpen(false)}
        >
          Packages
        </Link>
        <div className="pl-4 border-l-2 border-blue-300">
          {packages.map((package_) => (
            <Link
              key={package_.title}
              href={package_.href}
              className="flex w-full items-center rounded-md py-2 pl-4 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105"
              onClick={() => setIsOpen(false)}
            >
              {package_.title}
            </Link>
          ))}
        </div>
        <Link
          href="/services"
          className="flex w-full items-center rounded-md p-3 text-base font-medium text-white hover:bg-blue-700 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-105"
          onClick={() => setIsOpen(false)}
        >
          Services
        </Link>
        <div className="flex items-center space-x-2 p-3">
          <img src="https://flagcdn.com/16x12/in.png" alt="India Flag" className="h-5 w-6" />
          <span className="text-sm text-white">English</span>
        </div>
        <Link
          href="/login"
          className="flex w-full items-center rounded-md p-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 ease-in-out transform hover:scale-105"
          onClick={() => setIsOpen(false)}
        >
          Log in
        </Link>
      </nav>
    </div>
  )
}