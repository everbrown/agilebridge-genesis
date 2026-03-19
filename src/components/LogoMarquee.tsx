import logoJira from '@/assets/logo-jira.png';
import logoAzure from '@/assets/logo-azure-devops.png';
import logoClickup from '@/assets/logo-clickup.png';
import logoMonday from '@/assets/logo-monday.png';

const logos = [
  { src: logoJira, alt: 'Jira' },
  { src: logoAzure, alt: 'Azure DevOps' },
  { src: logoClickup, alt: 'ClickUp' },
  { src: logoMonday, alt: 'Monday.com' },
];

const LogoMarquee = () => {
  // Duplicate for seamless loop
  const items = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden mt-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-4">
        Export to
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex items-center gap-12 animate-marquee">
          {items.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-[35px] max-w-[140px] w-auto shrink-0 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoMarquee;
