"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsappLogo, Copy, Check, Link } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  shareUrl: string;
  shareText: string;
  imageUrl?: string;
}

export function ShareModal({
  open,
  onOpenChange,
  title,
  description,
  shareUrl,
  shareText,
  imageUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <Link size={18} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {shareUrl}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <Copy size={18} />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <WhatsappLogo size={20} weight="fill" className="mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className={cn(
                copied && "bg-green-500/10 border-green-500/50 text-green-600"
              )}
            >
              {copied ? (
                <>
                  <Check size={20} className="mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={20} className="mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
