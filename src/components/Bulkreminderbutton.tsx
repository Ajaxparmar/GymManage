"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BellRing, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

type MemberWithPending = {
  id: string;
  name: string;
  mobile: string;
  plan: { name: string };
  expiryDate: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
};

type ReminderResult = {
  memberId: string;
  name: string;
  success: boolean;
  error?: string;
};

interface BulkReminderButtonProps {
  members: MemberWithPending[];
}

export function BulkReminderButton({ members }: BulkReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState("");
  const [results, setResults] = useState<ReminderResult[]>([]);
  const [done, setDone] = useState(false);

  const buildMessage = (member: MemberWithPending): string => {
    const expiryFormatted = format(new Date(member.expiryDate), "dd MMM yyyy");
    const daysLeft = differenceInDays(new Date(member.expiryDate), new Date());
    const expiryNote =
      daysLeft < 0
        ? `Your membership expired ${Math.abs(daysLeft)} day(s) ago.`
        : daysLeft === 0
        ? `Your membership expires today!`
        : `Your membership expires in ${daysLeft} day(s) (${expiryFormatted}).`;

    return (
      `Hi ${member.name},\n\n` +
      `This is a friendly reminder from your gym.\n\n` +
      `📋 *Membership Details*\n` +
      `Plan: ${member.plan?.name}\n` +
      `${expiryNote}\n\n` +
      `💰 *Fee Summary*\n` +
      `Total Fees: ₹${member.totalFees.toLocaleString()}\n` +
      `Amount Paid: ₹${member.paidAmount.toLocaleString()}\n` +
      `Pending Dues: ₹${member.pendingAmount.toLocaleString()}\n\n` +
      `Please clear your dues at the earliest to avoid any interruption.\n\n` +
      `Thank you! 🙏`
    );
  };

  const handleOpen = () => {
    if (members.length === 0) {
      toast.info("No members with pending dues to remind.");
      return;
    }
    // Reset state
    setResults([]);
    setCurrentIndex(0);
    setCurrentName("");
    setDone(false);
    setRunning(false);
    setOpen(true);
  };

  const handleClose = () => {
    if (running) return; // block close while running
    setOpen(false);
  };

  const handleStart = async () => {
    setRunning(true);
    setResults([]);
    setDone(false);

    const collected: ReminderResult[] = [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      setCurrentIndex(i + 1);
      setCurrentName(member.name);

      try {
        const res = await fetch("/api/dashboard/send-msg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            to: member.mobile,
            message: buildMessage(member),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed");
        }

        collected.push({ memberId: member.id, name: member.name, success: true });
      } catch (err: unknown) {
        collected.push({
          memberId: member.id,
          name: member.name,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }

      setResults([...collected]);

      // 5 second gap between messages (skip after last one)
      if (i < members.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    setRunning(false);
    setDone(true);

    const successCount = collected.filter((r) => r.success).length;
    const failCount = collected.filter((r) => !r.success).length;

    if (failCount === 0) {
      toast.success(`All ${successCount} reminders sent successfully!`);
    } else {
      toast.warning(`${successCount} sent, ${failCount} failed.`);
    }
  };

  const progress = members.length > 0 ? Math.round((currentIndex / members.length) * 100) : 0;

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
        onClick={handleOpen}
        disabled={members.length === 0}
      >
        <BellRing className="h-4 w-4" />
        Bulk Remind ({members.length})
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => running && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-600" />
              Bulk Fee Reminder
            </DialogTitle>
            <DialogDescription>
              Sends a WhatsApp reminder to all <strong>{members.length}</strong> members with
              pending dues, one at a time with a 5-second gap between each.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Progress bar — shown once started */}
            {(running || done) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {done
                      ? "Completed"
                      : `Sending to ${currentName}...`}
                  </span>
                  <span>
                    {currentIndex} / {members.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Spinner while running */}
            {running && (
              <div className="flex items-center justify-center gap-3 py-3 rounded-lg bg-amber-50 border border-amber-100">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">
                  Sending reminder {currentIndex} of {members.length} — please wait...
                </span>
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border bg-muted/30 p-3">
                {results.map((r) => (
                  <div
                    key={r.memberId}
                    className="flex items-center gap-2 text-sm"
                  >
                    {r.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className={r.success ? "text-foreground" : "text-red-600"}>
                      {r.name}
                      {!r.success && r.error && (
                        <span className="text-xs text-muted-foreground ml-1">({r.error})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Done summary */}
            {done && (
              <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
                ✅ Done! {results.filter((r) => r.success).length} sent
                {results.filter((r) => !r.success).length > 0 && (
                  <>, {results.filter((r) => !r.success).length} failed</>
                )}
                .
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={running}
            >
              {done ? "Close" : "Cancel"}
            </Button>

            {!done && (
              <Button
                onClick={handleStart}
                disabled={running}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <BellRing className="h-4 w-4" />
                    Start Sending
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}