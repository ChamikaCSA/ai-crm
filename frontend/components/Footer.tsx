'use client'

import Link from 'next/link'
import { APP_NAME } from '@/strings'
import { Sparkles, Mail, Twitter, Github, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--accent)]/5" />
      <div className="container mx-auto px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
              <h4 className="text-xl font-bold text-[var(--text-primary)]">{APP_NAME}</h4>
            </div>
            <p className="text-[var(--text-tertiary)] leading-relaxed">
              Transform your customer relationships with AI-powered insights and automation.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@example.com"
              className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          <div className="border-t border-[var(--border)] pt-8 space-y-4">
            <div className="flex items-center justify-center gap-6">
              <Link
                href="/privacy"
                className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-[var(--text-tertiary)] text-sm">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}