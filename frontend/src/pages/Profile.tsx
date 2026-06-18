import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Shield, LogOut } from "lucide-react";
import { useUpdateProfile, useChangePassword, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const profileSchema = z.object({ fullName: z.string().min(2, "Name must be at least 2 characters") });
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(6, "Min 6 characters"),
  confirmNew: z.string(),
}).refine(d => d.newPassword === d.confirmNew, { message: "Passwords don't match", path: ["confirmNew"] });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNew: "" },
  });

  const onSaveProfile = (values: ProfileValues) => {
    updateProfile.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated" });
      },
      onError: () => toast({ title: "Error", description: "Failed to update profile", variant: "destructive" }),
    });
  };

  const onChangePassword = (values: PasswordValues) => {
    changePassword.mutate({ data: { currentPassword: values.currentPassword, newPassword: values.newPassword } }, {
      onSuccess: () => {
        passwordForm.reset();
        toast({ title: "Password changed" });
      },
      onError: (err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error || "Failed to change password";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account settings.</p>
        </div>

        {/* Account info */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-medium text-sm" data-testid="text-username">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-email">{user?.email}</p>
              </div>
              <Badge className="ml-auto" variant="outline">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit name */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Update Display Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input data-testid="input-fullName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl><Input type="password" data-testid="input-currentPassword" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" data-testid="input-newPassword" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmNew" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl><Input type="password" data-testid="input-confirmNew" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={changePassword.isPending} data-testid="button-change-password">
                  {changePassword.isPending ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Separator />
        <Button variant="destructive" className="gap-2 w-full" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </MainLayout>
  );
}
