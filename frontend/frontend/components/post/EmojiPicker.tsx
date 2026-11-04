'use client';

import Picker, { Theme } from 'emoji-picker-react';

type Props = {
  onSelect: (emoji: string) => void;
};

export function EmojiPickerPanel({ onSelect }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <Picker
                theme={Theme.DARK} 
                onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
                searchPlaceholder="Buscar emoji"
                width="100%"
                height={350}
                previewConfig={{ showPreview: false }}
            />
        </div>
    )
}