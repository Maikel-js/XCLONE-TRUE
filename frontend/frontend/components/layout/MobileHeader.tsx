'use client'
import Link from 'next/link'
import { BrandMark } from '@/components/brand/BrandMark'

export function MobileHeader() {
    return (
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-[var(--color-border)] bg-[rgba(0,0,0,0.85)] px-4 py-2 backdrop-blur md:hidden">
            <Link href="/" aria-label="XClone inicio" className="rounded-full p-2">
                <BrandMark size={26} />
            </Link>
            <span className="text-base font-bold">XClone</span>
        </div>
    )
}
