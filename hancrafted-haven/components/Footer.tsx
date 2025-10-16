import React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
};

type SocialLink = {
  icon: React.ReactNode;
  href: string;
  label: string;
};

type FooterProps = {
  links?: FooterLink[];
  companyName?: string;
  socials?: SocialLink[];
};

const Footer: React.FC<FooterProps> = ({
  links = [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  companyName = "Team 05",
  socials = [
    { icon: <Github size={18} />, href: "https://github.com", label: "GitHub" },
    { icon: <Linkedin size={18} />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Twitter size={18} />, href: "https://twitter.com", label: "Twitter" },
  ],
}) => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        
        {/* Left side */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>

        {/* Center links */}
        <div className="flex space-x-6 mt-4 md:mt-0">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: social icons */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="hover:text-white"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
