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
import EditTeamDialog from './edit';
import DeleteTeamDialog from './delete';

export default function ViewTeamDialog({ team, trigger }: { team: any, trigger?: React.ReactNode }) {
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
                    <DialogTitle>{team.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {team.photo_url ? (
                            <img 
                                src={team.photo_url} 
                                alt={team.name} 
                                className="h-20 w-20 rounded-full object-cover border" 
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full border bg-muted/50 flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">No Photo</span>
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold">{team.name}</h3>
                            <p className="text-muted-foreground">{team.designation}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Designation:</strong> {team.designation}
                        </div>
                        <div>
                            <strong>Experience:</strong> {team.years_of_experience ? `${team.years_of_experience} years` : '—'}
                        </div>
                        <div>
                            <strong>Added:</strong> {new Date(team.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <EditTeamDialog team={team} trigger={<Button variant="outline">Edit</Button>} />
                    <DeleteTeamDialog team={team} trigger={<Button variant="destructive">Delete</Button>} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

