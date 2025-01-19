'use client';

import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { FilloutPopupEmbed } from "@fillout/react";
import { useState } from "react";
import "@fillout/react/style.css";

interface SubscribeButtonProps {
  lang: string;
  variant?: 'nav' | 'hero' | 'primary' | 'secondary';
}

export function SubscribeButton({ lang, variant = 'nav' }: SubscribeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonStyles = 
    variant === 'hero' 
      ? "bg-transparent border-white text-white hover:bg-white/10"
      : variant === 'primary'
        ? "bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 min-w-[120px]";

  return (
    <>
      <Button 
        size="lg"
        variant={variant === 'hero' ? 'outline' : variant === 'primary' ? 'default' : 'secondary'}
        className={buttonStyles}
        onClick={() => setIsOpen(true)}
      >
        <Mail className="w-4 h-4 mr-2" />
        {lang === 'en' ? 'Subscribe' : 'Suscribirse'}
      </Button>

      {isOpen && (
        <FilloutPopupEmbed
          filloutId="5gt7SinUH8us"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}