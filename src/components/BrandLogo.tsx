import { useNavigate } from 'react-router-dom';
import logoA from '@/assets/agilebridge-logo-a.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  linkHome?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl md:text-5xl',
};

const BrandLogo = ({ size = 'md', linkHome = true, className = '' }: BrandLogoProps) => {
  const navigate = useNavigate();

  const content = (
    <span className={`inline-flex items-baseline font-bold tracking-tight text-foreground ${sizeClasses[size]} ${className}`}>
      <img src={logoA} alt="" className="inline-block h-[2em] w-auto -mr-[0.4em] translate-y-[0.36em] object-contain" />
      <span className="relative z-10 -translate-y-[0.18em]">gileBridge</span>
    </span>
  );

  if (linkHome) {
    return (
      <button onClick={() => navigate('/')} className="focus:outline-none">
        {content}
      </button>
    );
  }

  return content;
};

export default BrandLogo;
