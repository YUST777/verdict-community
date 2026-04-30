import { Check, Send } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editField: string;
  inputValue: string;
  setInputValue: (val: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  editField,
  inputValue,
  setInputValue,
  onSave,
  saving,
  saved,
}: ProfileEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}</h3>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={`Enter ${editField} username`}
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-[#A0A0A0] hover:bg-white/5">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || saved}
            className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saved ? <><Check size={18} />Saved</> : saving ? 'Saving...' : <><Send size={16} />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}
