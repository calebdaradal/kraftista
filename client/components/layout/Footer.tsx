import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Linkedin } from "lucide-react";
import { useCustomization } from "@/context/CustomizationContext";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
};

export function Footer() {
  const { footer } = useCustomization();
  const currentYear = new Date().getFullYear();
  const bottomText = footer.bottomText.replace("{year}", currentYear.toString());

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-lg font-bold">
                  {footer.brandEmoji || footer.brandName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-display font-bold text-foreground">{footer.brandName}</div>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm">
              {footer.brandTagline}
            </p>
          </div>

          {/* Dynamic Sections */}
          {footer.sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              {section.title.toLowerCase() === "connect" ? (
                // Social Links for Connect section
                <div className="flex gap-4">
                  {footer.socialLinks.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform];
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-muted-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                // Regular Links
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      {link.href.startsWith("http") || link.href.startsWith("mailto:") ? (
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>{bottomText}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {footer.policyLinks.map((policy) => (
              <a
                key={policy.id}
                href={policy.href}
                className="hover:text-primary transition-colors"
              >
                {policy.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
