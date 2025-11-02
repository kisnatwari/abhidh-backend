import * as React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle2 } from 'lucide-react';

export default function ViewUserDialog({ user, trigger }: { user: any, trigger?: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline">View</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full border bg-muted/50 flex items-center justify-center">
                            <UserCircle2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <strong className="text-sm text-muted-foreground">Email Status:</strong>
                            <div className="mt-1">
                                {user.email_verified_at ? (
                                    <Badge variant="secondary" className="text-white bg-green-600">
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-white bg-gray-500">
                                        Unverified
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <strong className="text-sm text-muted-foreground">API Tokens:</strong>
                            <div className="mt-1">
                                <Badge variant="outline">{user.tokens_count || 0} tokens</Badge>
                            </div>
                        </div>
                        <div>
                            <strong className="text-sm text-muted-foreground">Email Verified:</strong>
                            <div className="mt-1">
                                {user.email_verified_at ? (
                                    <span className="text-sm">{new Date(user.email_verified_at).toLocaleDateString()}</span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Not verified</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <strong className="text-sm text-muted-foreground">Member Since:</strong>
                            <div className="mt-1">
                                <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

