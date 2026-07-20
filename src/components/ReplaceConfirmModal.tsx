"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui";
import { AlertCircle, ArrowRightLeft } from "lucide-react";

interface ReplaceConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: string;
  existingName: string;
  newName: string;
}

export function ReplaceConfirmModal({
  open,
  onClose,
  onConfirm,
  category,
  existingName,
  newName,
}: ReplaceConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Replace ${category}?`}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-text-primary font-medium">
              You already have a {category} in your build.
            </p>
            <p className="text-text-secondary mt-1">
              <span className="font-medium text-text-primary">{existingName}</span>
              {" → "}
              <span className="font-medium text-primary">{newName}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Keep Current
          </Button>
          <Button
            variant="primary"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Replace
          </Button>
        </div>
      </div>
    </Modal>
  );
}
