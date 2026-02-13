"use client";

import { useState } from "react";
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  Loader2, 
  Phone, 
  MapPin, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMember, updateMember } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  alt_phone_number: string | null;
  home_address: string | null;
  created_at: string;
  role: string;
}

export function AdminMemberActions({ member }: { member: Member }) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toastSuccess, toastError } = useToast();

  // Form State for Edit
  const [editData, setEditData] = useState({
    fullName: member.full_name || "",
    phoneNumber: member.phone_number || "",
    altPhoneNumber: member.alt_phone_number || "",
    homeAddress: member.home_address || "",
  });

  async function handleUpdate() {
    setIsPending(true);
    try {
      const result = await updateMember(member.id, editData);
      if (result.success) {
        toastSuccess("Member updated successfully");
        setShowEditDialog(false);
      } else {
        toastError("Update failed", { 
          description: result.error, 
        });
      }
    } catch (error) {
      toastError("An error occurred", { 
        description: "Failed to update member", 
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsPending(true);
    try {
      const result = await deleteMember(member.id);
      if (result.success) {
        toastSuccess("Member deleted successfully");
        setShowDeleteDialog(false);
      } else {
        toastError("Delete failed", { 
          description: result.error, 
        });
      }
    } catch (error) {
      toastError("An error occurred", { 
        description: "Failed to delete member", 
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Member
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Full information for {member.full_name || "Unnamed Member"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {member.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="text-lg font-bold">{member.full_name || "N/A"}</h3>
                <Badge variant="secondary">Member</Badge>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>{member.phone_number || "No phone number"}</span>
              </div>
              {member.alt_phone_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.alt_phone_number} (Alternate)</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{member.home_address || "No address provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Joined on {new Date(member.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => {
              setShowViewDialog(false);
              setShowEditDialog(true);
            }}>Edit Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member's personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={editData.fullName} 
                onChange={(e) => setEditData({...editData, fullName: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber" 
                value={editData.phoneNumber} 
                onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="altPhoneNumber">Alternate Phone (Optional)</Label>
              <Input 
                id="altPhoneNumber" 
                value={editData.altPhoneNumber} 
                onChange={(e) => setEditData({...editData, altPhoneNumber: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="homeAddress">Home Address</Label>
              <Input 
                id="homeAddress" 
                value={editData.homeAddress} 
                onChange={(e) => setEditData({...editData, homeAddress: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{member.full_name}</strong>? This action cannot be undone and may fail if the member has active transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
